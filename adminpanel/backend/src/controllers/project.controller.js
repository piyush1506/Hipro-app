const prisma = require('../prisma');

function generateProjectNumber() {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PRJ-${dateStr}-${rand}`;
}

/**
 * Civil Engineer or Super Admin initializes a project from a lead
 */
async function createProject(req, res) {
  try {
    const {
      leadId,
      startDate,
      estimatedEnd,
      totalBudget,
      notes
    } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: 'Lead ID is required' });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { requirementAnalysis: true }
    });

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const managerId = req.user.staffId || req.user.id;
    const managerName = req.user.name || 'Civil Engineer';

    const project = await prisma.project.create({
      data: {
        projectNumber: generateProjectNumber(),
        leadId,
        managerId,
        status: 'PLANNING',
        startDate: startDate ? new Date(startDate) : new Date(),
        estimatedEnd: estimatedEnd ? new Date(estimatedEnd) : null,
        totalBudget: totalBudget ? parseFloat(totalBudget) : lead.requirementAnalysis?.estimatedBudget || null,
        notes: notes || null
      },
      include: {
        manager: { select: { id: true, name: true, phone: true } },
        lead: true
      }
    });

    // Advance Lead status to PROJECT_STARTED
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'PROJECT_STARTED',
        statusHistory: {
          create: {
            fromStatus: lead.status,
            toStatus: 'PROJECT_STARTED',
            changedBy: managerName,
            notes: `Project ${project.projectNumber} created and initialized`
          }
        }
      }
    });

    // Notify all via socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('project_created', {
          projectId: project.id,
          projectNumber: project.projectNumber,
          leadNumber: lead.leadNumber,
          managerName
        });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Project ${project.projectNumber} created successfully`,
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
}

/**
 * List projects with filters
 */
async function listProjects(req, res) {
  try {
    const { status, managerId, page = 1, limit = 50 } = req.query;
    const where = {};

    if (status) where.status = status.toUpperCase();
    if (managerId) where.managerId = managerId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: {
          manager: { select: { id: true, name: true, phone: true, email: true } },
          lead: {
            select: {
              id: true,
              leadNumber: true,
              customerName: true,
              customerPhone: true,
              serviceName: true,
              city: true,
              location: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: take,
      projects
    });
  } catch (error) {
    console.error('List projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list projects',
      error: error.message
    });
  }
}

/**
 * Get project details
 */
async function getProjectById(req, res) {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, phone: true, email: true } },
        lead: {
          include: {
            requirementAnalysis: {
              include: {
                materialRequirements: {
                  include: {
                    assignedVendor: { select: { id: true, name: true, businessName: true, phone: true } }
                  }
                },
                laborRequirements: {
                  include: {
                    assignedVendor: { select: { id: true, name: true, businessName: true, phone: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Update project status
 */
async function updateProjectStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes, actualEnd } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const data = { status: status.toUpperCase() };
    if (notes) data.notes = notes;
    if (actualEnd) data.actualEnd = new Date(actualEnd);
    if (status.toUpperCase() === 'COMPLETED' && !actualEnd) data.actualEnd = new Date();

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: { manager: true, lead: true }
    });

    // Sync status to lead
    if (status.toUpperCase() === 'COMPLETED') {
      await prisma.lead.update({
        where: { id: project.leadId },
        data: {
          status: 'COMPLETED',
          statusHistory: {
            create: {
              fromStatus: 'IN_PROGRESS',
              toStatus: 'COMPLETED',
              changedBy: req.user.name || 'Civil Engineer',
              notes: 'Project work completed and approved'
            }
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Project status updated to ${updated.status}`,
      project: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProjectStatus
};
