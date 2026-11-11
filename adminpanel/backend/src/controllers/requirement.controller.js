const prisma = require('../prisma');

/**
 * Civil Engineer creates Requirement Analysis for a Lead after site visit
 * Splits work into Material Requirements and Labor Requirements
 */
async function createRequirementAnalysis(req, res) {
  try {
    const {
      leadId,
      siteNotes,
      sitePhotos = [],
      siteVideos = [],
      inspectionDate,
      estimatedBudget,
      estimatedDuration,
      materials = [],
      labors = []
    } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: 'Lead ID is required' });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const engineerId = req.user.staffId || req.user.id;
    const engineerName = req.user.name || 'Civil Engineer';

    // Create Requirement Analysis with nested materials and labors
    const analysis = await prisma.requirementAnalysis.create({
      data: {
        leadId,
        engineerId,
        siteNotes: siteNotes || null,
        sitePhotos: Array.isArray(sitePhotos) ? sitePhotos : [],
        siteVideos: Array.isArray(siteVideos) ? siteVideos : [],
        inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        estimatedDuration: estimatedDuration || null,
        materialRequirements: {
          create: materials.map(m => ({
            materialName: m.materialName || 'Material Item',
            materialCategory: m.materialCategory || 'General',
            specification: m.specification || null,
            quantity: parseFloat(m.quantity) || 1,
            unit: m.unit || 'Pieces',
            estimatedRate: m.estimatedRate ? parseFloat(m.estimatedRate) : null,
            notes: m.notes || null,
            status: 'PENDING'
          }))
        },
        laborRequirements: {
          create: labors.map(l => ({
            laborType: l.laborType || 'Mason',
            laborCategory: l.laborCategory || 'Civil',
            numberOfWorkers: parseInt(l.numberOfWorkers, 10) || 1,
            durationDays: l.durationDays ? parseInt(l.durationDays, 10) : null,
            skillLevel: l.skillLevel || 'Skilled',
            description: l.description || null,
            estimatedRate: l.estimatedRate ? parseFloat(l.estimatedRate) : null,
            status: 'PENDING'
          }))
        }
      },
      include: {
        engineer: { select: { id: true, name: true, phone: true } },
        materialRequirements: true,
        laborRequirements: true
      }
    });

    // Advance Lead status to REQUIREMENTS_CREATED
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'REQUIREMENTS_CREATED',
        statusHistory: {
          create: {
            fromStatus: lead.status,
            toStatus: 'REQUIREMENTS_CREATED',
            changedBy: engineerName,
            notes: `Requirement analysis created by Civil Engineer ${engineerName} (${materials.length} material items, ${labors.length} labor trades)`
          }
        }
      }
    });

    // Notify Purchase Person & Super Admin in real-time
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('requirements_created', {
          leadId,
          leadNumber: lead.leadNumber,
          engineerName,
          materialCount: materials.length,
          laborCount: labors.length
        });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Requirement analysis created successfully and routed to Purchase Person & Labor teams',
      analysis
    });
  } catch (error) {
    console.error('Create requirement analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create requirement analysis',
      error: error.message
    });
  }
}

/**
 * Get Requirement Analysis by Lead ID
 */
async function getRequirementsByLead(req, res) {
  try {
    const { leadId } = req.params;

    const analysis = await prisma.requirementAnalysis.findUnique({
      where: { leadId },
      include: {
        engineer: { select: { id: true, name: true, phone: true, email: true } },
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
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No requirement analysis found for this lead'
      });
    }

    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Get requirements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch requirements',
      error: error.message
    });
  }
}

/**
 * Add items to existing requirement analysis
 */
async function addMaterialItem(req, res) {
  try {
    const { analysisId } = req.params;
    const { materialName, materialCategory, specification, quantity, unit, estimatedRate, notes } = req.body;

    const item = await prisma.materialRequirement.create({
      data: {
        requirementAnalysisId: analysisId,
        materialName,
        materialCategory: materialCategory || 'General',
        specification: specification || null,
        quantity: parseFloat(quantity) || 1,
        unit: unit || 'Pieces',
        estimatedRate: estimatedRate ? parseFloat(estimatedRate) : null,
        notes: notes || null
      }
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function addLaborItem(req, res) {
  try {
    const { analysisId } = req.params;
    const { laborType, laborCategory, numberOfWorkers, durationDays, skillLevel, description, estimatedRate } = req.body;

    const item = await prisma.laborRequirement.create({
      data: {
        requirementAnalysisId: analysisId,
        laborType,
        laborCategory: laborCategory || 'Civil',
        numberOfWorkers: parseInt(numberOfWorkers, 10) || 1,
        durationDays: durationDays ? parseInt(durationDays, 10) : null,
        skillLevel: skillLevel || 'Skilled',
        description: description || null,
        estimatedRate: estimatedRate ? parseFloat(estimatedRate) : null
      }
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createRequirementAnalysis,
  getRequirementsByLead,
  addMaterialItem,
  addLaborItem
};
