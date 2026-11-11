const prisma = require('../prisma');

/**
 * List all roles with staff member count
 */
async function listRoles(req, res) {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { staffMembers: true }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { displayName: 'asc' }
      ]
    });

    const formatted = roles.map(r => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      isSystem: r.isSystem,
      isActive: r.isActive,
      permissions: Array.isArray(r.permissions) ? r.permissions : [],
      staffCount: r._count.staffMembers,
      createdAt: r.createdAt
    }));

    return res.status(200).json({
      success: true,
      roles: formatted
    });
  } catch (error) {
    console.error('List roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list roles',
      error: error.message
    });
  }
}

/**
 * Create a new custom role (Admin only)
 */
async function createRole(req, res) {
  try {
    const { name, displayName, description, permissions } = req.body;

    if (!displayName || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Display name and permissions array are required'
      });
    }

    // Auto-generate slug name if not provided
    const roleSlug = (name || displayName)
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_');

    // Check duplicate
    const existing = await prisma.role.findUnique({
      where: { name: roleSlug }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A role with identifier '${roleSlug}' already exists`
      });
    }

    const newRole = await prisma.role.create({
      data: {
        name: roleSlug,
        displayName: displayName.trim(),
        description: description ? description.trim() : null,
        isSystem: false,
        isActive: true,
        permissions
      }
    });

    return res.status(201).json({
      success: true,
      message: `Role '${newRole.displayName}' created successfully`,
      role: newRole
    });
  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
}

/**
 * Update an existing role (Admin only)
 */
async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { displayName, description, permissions, isActive } = req.body;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const data = {};
    if (displayName) data.displayName = displayName.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (permissions && Array.isArray(permissions)) data.permissions = permissions;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const updated = await prisma.role.update({
      where: { id },
      data
    });

    return res.status(200).json({
      success: true,
      message: `Role '${updated.displayName}' updated successfully`,
      role: updated
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
}

/**
 * Delete a custom role (Admin only, cannot delete system roles)
 */
async function deleteRole(req, res) {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: { select: { staffMembers: true } }
      }
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Predefined system roles (SUPER_ADMIN, TELECALLER, CIVIL_ENGINEER, PURCHASE_PERSON) cannot be deleted'
      });
    }

    if (role._count.staffMembers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role: ${role._count.staffMembers} staff member(s) are assigned to this role. Please reassign them first.`
      });
    }

    await prisma.role.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `Role '${role.displayName}' deleted successfully`
    });
  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
}

module.exports = {
  listRoles,
  createRole,
  updateRole,
  deleteRole
};
