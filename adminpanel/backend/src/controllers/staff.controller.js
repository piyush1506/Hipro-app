const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

/**
 * Unified Staff Login
 * Authenticates any staff member (Super Admin, Telecaller, Civil Engineer, Purchase Person, or Custom Role)
 * Returns JWT with role and granular permissions attached.
 */
async function loginStaff(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Look up StaffMember with Role
    let staff = await prisma.staffMember.findUnique({
      where: { email: cleanEmail },
      include: { role: true }
    });

    // 2. Fallback check: If not in StaffMember yet, check legacy Admin table
    if (!staff) {
      const legacyAdmin = await prisma.admin.findUnique({
        where: { email: cleanEmail }
      });

      if (legacyAdmin) {
        // Auto-migrate on the fly
        const superAdminRole = await prisma.role.findUnique({
          where: { name: 'SUPER_ADMIN' }
        });

        if (superAdminRole) {
          staff = await prisma.staffMember.create({
            data: {
              name: legacyAdmin.name || 'Super Administrator',
              email: cleanEmail,
              phone: legacyAdmin.phone || null,
              password: legacyAdmin.password,
              roleId: superAdminRole.id,
              isActive: legacyAdmin.isActive !== false
            },
            include: { role: true }
          });
        }
      }
    }

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!staff.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact the Super Administrator.'
      });
    }

    // 3. Verify password
    let passwordMatches = false;
    if (staff.password.startsWith('$2a$') || staff.password.startsWith('$2b$')) {
      passwordMatches = await bcrypt.compare(password, staff.password);
    } else {
      passwordMatches = staff.password === password;
      if (passwordMatches) {
        // Auto-hash plain text password
        const hashed = await bcrypt.hash(password, 10);
        await prisma.staffMember.update({
          where: { id: staff.id },
          data: { password: hashed }
        });
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Update last login
    await prisma.staffMember.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() }
    });

    // 5. Generate token with role and permissions
    const permissions = Array.isArray(staff.role?.permissions) ? staff.role.permissions : [];
    const token = jwt.sign(
      {
        id: staff.id,
        staffId: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role.name,
        roleName: staff.role.displayName,
        permissions
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${staff.name}!`,
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role.name,
        roleDisplayName: staff.role.displayName,
        permissions,
        lastLoginAt: staff.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
}

/**
 * Get current authenticated staff member profile
 */
async function getStaffProfile(req, res) {
  try {
    const staff = await prisma.staffMember.findUnique({
      where: { id: req.user.staffId || req.user.id },
      include: { role: true },
      omit: { password: true }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    return res.status(200).json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role.name,
        roleDisplayName: staff.role.displayName,
        permissions: staff.role.permissions,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
        lastLoginAt: staff.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Staff profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch staff profile',
      error: error.message
    });
  }
}

/**
 * List all staff members (Admin only)
 */
async function listStaff(req, res) {
  try {
    const staffMembers = await prisma.staffMember.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            isSystem: true
          }
        }
      },
      omit: { password: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: staffMembers.length,
      staff: staffMembers
    });
  } catch (error) {
    console.error('List staff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list staff members',
      error: error.message
    });
  }
}

/**
 * Create a new staff member (Admin only)
 */
async function createStaff(req, res) {
  try {
    const { name, email, phone, password, roleId } = req.body;

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.staffMember.findUnique({
      where: { email: cleanEmail }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A staff member with this email already exists'
      });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await prisma.staffMember.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        roleId,
        isActive: true,
        createdBy: req.user.name || req.user.email
      },
      include: {
        role: true
      },
      omit: { password: true }
    });

    return res.status(201).json({
      success: true,
      message: `Staff account created for ${newStaff.name} (${newStaff.role.displayName})`,
      staff: newStaff
    });
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create staff member',
      error: error.message
    });
  }
}

/**
 * Update staff member (Admin only)
 */
async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, roleId, isActive, password } = req.body;

    const data = {};
    if (name) data.name = name.trim();
    if (phone !== undefined) data.phone = phone ? phone.trim() : null;
    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        return res.status(400).json({ success: false, message: 'Invalid role ID' });
      }
      data.roleId = roleId;
    }
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (password && password.trim()) {
      data.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.staffMember.update({
      where: { id },
      data,
      include: { role: true },
      omit: { password: true }
    });

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updated
    });
  } catch (error) {
    console.error('Update staff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: error.message
    });
  }
}

/**
 * Delete / deactivate staff member (Admin only)
 */
async function deleteStaff(req, res) {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (req.user.staffId === id || req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await prisma.staffMember.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: error.message
    });
  }
}

module.exports = {
  loginStaff,
  getStaffProfile,
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
