const prisma = require('../prisma');

/**
 * Generate human-friendly Lead Number: LEAD-YYMMDD-XXXX
 */
function generateLeadNumber() {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LEAD-${dateStr}-${rand}`;
}

/**
 * List Leads (Role-Aware Filtering)
 */
async function listLeads(req, res) {
  try {
    const {
      status,
      source,
      city,
      assignedToId,
      verifiedById,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};

    // Role-based visibility enforcement
    const userRole = (req.user?.role || '').toUpperCase();
    const permissions = req.user?.permissions || [];
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || permissions.includes('*');

    if (!isSuperAdmin) {
      if (userRole === 'TELECALLER') {
        // Telecallers primarily work on early pipeline stages, but can view all unless filtered
        if (status) {
          where.status = status;
        }
      } else if (userRole === 'CIVIL_ENGINEER') {
        // Civil Engineers see leads assigned to them or ready for site visits
        if (!assignedToId && !status) {
          where.OR = [
            { assignedToId: req.user.staffId || req.user.id },
            { status: { in: ['VERIFIED', 'SITE_VISIT_SCHEDULED', 'SITE_VISITED', 'REQUIREMENTS_CREATED', 'PROCUREMENT_IN_PROGRESS', 'VENDORS_ASSIGNED', 'PROJECT_STARTED', 'IN_PROGRESS'] } }
          ];
        }
      } else if (userRole === 'PURCHASE_PERSON') {
        // Purchase person sees leads with requirements created or in procurement
        if (!status) {
          where.status = {
            in: ['REQUIREMENTS_CREATED', 'PROCUREMENT_IN_PROGRESS', 'QUOTATIONS_RECEIVED', 'VENDORS_ASSIGNED', 'PROJECT_STARTED', 'IN_PROGRESS']
          };
        }
      }
    }

    // Explicit query filters
    if (status && !where.status) where.status = status;
    if (source) where.source = source.toUpperCase();
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (assignedToId) where.assignedToId = assignedToId;
    if (verifiedById) where.verifiedById = verifiedById;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { leadNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q } },
        { serviceName: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        include: {
          verifiedBy: {
            select: { id: true, name: true, email: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true, phone: true }
          },
          requirementAnalysis: {
            select: {
              id: true,
              estimatedBudget: true,
              estimatedDuration: true,
              _count: {
                select: {
                  materialRequirements: true,
                  laborRequirements: true
                }
              }
            }
          },
          project: {
            select: { id: true, projectNumber: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    // Stage counts for Kanban / Quick Filters
    const stageCounts = await prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusMap = {};
    stageCounts.forEach(s => {
      statusMap[s.status] = s._count.status;
    });

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: take,
      countsByStatus: statusMap,
      leads
    });
  } catch (error) {
    console.error('List leads error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
}

/**
 * Get single Lead detail with full history and requirement breakdown
 */
async function getLeadById(req, res) {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phoneNumber: true, photoUrl: true }
        },
        service: true,
        subService: true,
        verifiedBy: {
          select: { id: true, name: true, email: true, phone: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, phone: true }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        requirementAnalysis: {
          include: {
            engineer: { select: { id: true, name: true, phone: true } },
            materialRequirements: {
              include: {
                assignedVendor: { select: { id: true, name: true, businessName: true, phone: true } },
                rfqs: {
                  include: {
                    vendor: { select: { id: true, name: true, businessName: true, rating: true, phone: true } }
                  }
                }
              }
            },
            laborRequirements: {
              include: {
                assignedVendor: { select: { id: true, name: true, businessName: true, phone: true } },
                rfqs: {
                  include: {
                    vendor: { select: { id: true, name: true, businessName: true, rating: true, phone: true } }
                  }
                }
              }
            }
          }
        },
        project: true
      }
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    return res.status(200).json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch lead details',
      error: error.message
    });
  }
}

/**
 * Create a new Lead (Manual entry by Telecaller or Super Admin)
 */
async function createLead(req, res) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      serviceId,
      subServiceId,
      serviceName,
      subServiceName,
      issueDescription,
      propertyType,
      propertySize,
      location,
      city,
      preferredDate,
      preferredTime,
      source = 'MANUAL'
    } = req.body;

    if (!customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required'
      });
    }

    const leadNumber = generateLeadNumber();

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        source: source.toUpperCase(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        customerAddress: customerAddress ? customerAddress.trim() : null,
        serviceId: serviceId || null,
        subServiceId: subServiceId || null,
        serviceName: serviceName || 'General Service',
        subServiceName: subServiceName || null,
        issueDescription: issueDescription || null,
        propertyType: propertyType || null,
        propertySize: propertySize || null,
        location: location || customerAddress || null,
        city: city || 'Bhilwara',
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        status: 'NEW',
        statusHistory: {
          create: {
            fromStatus: 'NONE',
            toStatus: 'NEW',
            changedBy: req.user?.name || 'Staff',
            notes: 'Lead created manually in admin portal'
          }
        }
      }
    });

    // Notify real-time via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new_lead', {
          id: newLead.id,
          leadNumber: newLead.leadNumber,
          customerName: newLead.customerName,
          serviceName: newLead.serviceName,
          city: newLead.city,
          createdAt: newLead.createdAt
        });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Lead ${newLead.leadNumber} created successfully`,
      lead: newLead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message
    });
  }
}

/**
 * Telecaller verifies and qualifies a Lead
 * Sets status to VERIFIED and records telecaller notes
 */
async function verifyLead(req, res) {
  try {
    const { id } = req.params;
    const { telecallerNotes, preferredDate, preferredTime, urgency } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const previousStatus = lead.status;
    const staffId = req.user.staffId || req.user.id;
    const staffName = req.user.name || 'Telecaller';

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedById: staffId,
        verifiedAt: new Date(),
        telecallerNotes: telecallerNotes ? telecallerNotes.trim() : lead.telecallerNotes,
        preferredDate: preferredDate || lead.preferredDate,
        preferredTime: preferredTime || lead.preferredTime,
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: 'VERIFIED',
            changedBy: staffName,
            notes: telecallerNotes || 'Lead verified and qualified for site inspection'
          }
        }
      },
      include: {
        verifiedBy: { select: { id: true, name: true, email: true } }
      }
    });

    // Socket notification: Notify civil engineers of qualified lead
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('lead_verified', {
          id: updatedLead.id,
          leadNumber: updatedLead.leadNumber,
          customerName: updatedLead.customerName,
          serviceName: updatedLead.serviceName,
          verifiedBy: staffName
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Lead ${updatedLead.leadNumber} verified successfully and queued for Civil Engineer inspection`,
      lead: updatedLead
    });
  } catch (error) {
    console.error('Verify lead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify lead',
      error: error.message
    });
  }
}

/**
 * Assign Lead to Civil Engineer for site inspection visit
 */
async function assignLeadToEngineer(req, res) {
  try {
    const { id } = req.params;
    const { engineerId, scheduledDate, scheduledTime, notes } = req.body;

    if (!engineerId) {
      return res.status(400).json({
        success: false,
        message: 'Civil Engineer ID is required'
      });
    }

    const engineer = await prisma.staffMember.findUnique({
      where: { id: engineerId },
      include: { role: true }
    });

    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer staff account not found' });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const previousStatus = lead.status;
    const staffName = req.user.name || 'Coordinator';

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        assignedToId: engineerId,
        assignedAt: new Date(),
        preferredDate: scheduledDate || lead.preferredDate,
        preferredTime: scheduledTime || lead.preferredTime,
        status: 'SITE_VISIT_SCHEDULED',
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: 'SITE_VISIT_SCHEDULED',
            changedBy: staffName,
            notes: notes || `Site visit assigned to Civil Engineer ${engineer.name}`
          }
        }
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    // Notify engineer via socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('lead_assigned', {
          id: updatedLead.id,
          leadNumber: updatedLead.leadNumber,
          engineerId,
          engineerName: engineer.name,
          customerName: updatedLead.customerName,
          location: updatedLead.location
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Lead ${updatedLead.leadNumber} assigned to Civil Engineer ${engineer.name}`,
      lead: updatedLead
    });
  } catch (error) {
    console.error('Assign lead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign lead',
      error: error.message
    });
  }
}

/**
 * Telecaller marks lead as contacted
 */
async function contactLead(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: 'CONTACTED',
        telecallerNotes: notes || lead.telecallerNotes,
        statusHistory: {
          create: {
            fromStatus: lead.status,
            toStatus: 'CONTACTED',
            changedBy: req.user?.name || 'Telecaller',
            notes: notes || 'Customer contacted via telephone'
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Lead status updated to Contacted',
      lead: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Telecaller or Admin rejects lead (Not interested, duplicate, invalid number, out of service area)
 */
async function rejectLead(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: 'REJECTED',
        telecallerNotes: reason || lead.telecallerNotes,
        statusHistory: {
          create: {
            fromStatus: lead.status,
            toStatus: 'REJECTED',
            changedBy: req.user?.name || 'Telecaller',
            notes: reason || 'Lead rejected during telecaller verification'
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Lead ${lead.leadNumber} rejected`,
      lead: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listLeads,
  getLeadById,
  createLead,
  verifyLead,
  assignLeadToEngineer,
  contactLead,
  rejectLead
};
