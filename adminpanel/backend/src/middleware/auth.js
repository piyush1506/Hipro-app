const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'your_super_secret_jwt_key_here') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: A secure, strong JWT_SECRET must be configured in environment variables.');
  } else {
    console.warn('⚠️ WARNING: JWT_SECRET not configured or using default placeholder. Generating an ephemeral secret for this session.');
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    process.env.JWT_SECRET = JWT_SECRET;
  }
}

/**
 * Access Control Middleware Suite
 * Supports: Super Admin, Vendors, Support Agents, and Customers.
 */

/**
 * Normalize a role value from a JWT, database row, or request body.
 */
function normalizeRole(value) {
  return String(value || 'CUSTOMER').trim().toUpperCase();
}

/**
 * Resolve the request identity from the database, not from mutable JWT claims.
 * Staff roles and permissions are re-read on every authenticated request so that
 * role changes, permission edits, and deactivations take effect immediately.
 */
async function resolveRequestUser(decoded) {
  const userId = decoded.id || decoded.userId;
  if (!userId) return null;

  const tokenRole = normalizeRole(decoded.role);
  const hasStaffIdentity = Boolean(decoded.staffId) ||
    !['VENDOR', 'CUSTOMER', 'USER'].includes(tokenRole);

  if (hasStaffIdentity) {
    const staff = await prisma.staffMember.findUnique({
      where: { id: decoded.staffId || userId },
      include: { role: true }
    });

    if (!staff || !staff.isActive || !staff.role || staff.role.isActive === false) {
      return null;
    }

    return {
      id: staff.id,
      staffId: staff.id,
      role: normalizeRole(staff.role.name),
      roleName: staff.role.displayName || staff.role.name,
      permissions: Array.isArray(staff.role.permissions) ? staff.role.permissions : [],
      vendorId: null,
      email: staff.email || null,
      name: staff.name || null
    };
  }

  if (tokenRole === 'VENDOR') {
    const vendorId = decoded.vendorId || userId;
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true, email: true, phone: true, status: true }
    });

    if (!vendor || String(vendor.status || '').toLowerCase() === 'inactive') {
      return null;
    }

    return {
      id: vendor.id,
      staffId: null,
      role: 'VENDOR',
      roleName: 'Vendor',
      permissions: [],
      vendorId: vendor.id,
      email: vendor.email || null,
      name: vendor.name || null
    };
  }

  return {
    id: userId,
    staffId: null,
    role: tokenRole,
    roleName: decoded.roleName || tokenRole,
    permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
    vendorId: null,
    email: decoded.email || null,
    name: decoded.name || null
  };
}

/**
 * Core Authentication Middleware
 * Validates JWT Bearer tokens, resolves identity and role, and attaches `req.user`.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required (Bearer <token>)'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const requestUser = await resolveRequestUser(decoded);

    if (!requestUser) {
      return res.status(401).json({
        success: false,
        message: 'This account or its assigned role is inactive. Please sign in again.'
      });
    }

    req.user = requestUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
      error: error.message
    });
  }
}

/**
 * Super Admin Authorization Guard
 * Ensures only users with role 'ADMIN' or 'SUPER_ADMIN' can proceed.
 */
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Super Admin access required'
    });
  }
  next();
}

/**
 * Vendor Authorization Guard
 * Only authenticated vendor accounts can use vendor portal endpoints.
 */
function requireVendor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'VENDOR') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Vendor access required'
    });
  }

  // Strictly bind vendorId from verified token (IDOR Prevention)
  req.vendorId = req.user.vendorId || req.user.id;
  next();
}

/**
 * Flexible Multi-Role Authorization Guard
 * Usage: router.get('/endpoint', authenticate, requireRole('ADMIN', 'VENDOR'))
 */
function requireRole(...allowedRoles) {
  const normalized = allowedRoles.map(r => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user || !normalized.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${normalized.join(', ')}]`
      });
    }
    next();
  };
}

/**
 * Multi-Tenancy IDOR Protection Middleware for Vendors
 * Ensures a vendor can NEVER access or mutate records belonging to another vendor.
 */
function preventVendorIDOR(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'VENDOR') {
    return res.status(403).json({ success: false, message: 'Forbidden: Vendor access required' });
  }

  const requestedVendorId = req.query.vendorId || req.body?.vendorId || req.params?.vendorId;
  if (requestedVendorId && requestedVendorId !== req.user.vendorId && requestedVendorId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Security Alert: You are not authorized to view or access another vendor\'s data.'
    });
  }

  // Overwrite any client-supplied vendorId with the verified token identity
  req.query.vendorId = req.user.vendorId || req.user.id;
  if (req.body && req.body.vendorId) {
    req.body.vendorId = req.user.vendorId || req.user.id;
  }

  next();
}

/**
 * Support Agent & Admin Authorization Middleware
 * Verifies that the authenticated user is registered as an active support agent or admin.
 */
async function requireAgent(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Admins have automatic access
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check support_agents table
    const agent = await prisma.supportAgent.findUnique({
      where: { userId: req.user.id }
    });

    if (!agent || !agent.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Support Agent privileges required'
      });
    }

    req.supportAgent = agent;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify agent authorization',
      error: error.message
    });
  }
}


/**
 * Optional Authentication Middleware
 * If Bearer token is provided and valid, attaches req.user. Does not reject unauthenticated calls.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const requestUser = await resolveRequestUser(decoded);
      if (requestUser) {
        req.user = requestUser;
      }
    }
  } catch (err) {
    // Silent ignore for optional authentication
  }
  next();
}

/**
 * Permission-Based Authorization Guard (RBAC)
 * Checks whether user has the required granular permission,
 * '*' wildcard permission, or is a SUPER_ADMIN / ADMIN.
 */
function requirePermission(permission) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin has unrestricted access to everything
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = req.user.permissions || [];
    if (permissions.includes('*') || permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access Denied: Missing permission '${permission}'`,
      requiredPermission: permission
    });
  };
}

module.exports = {
  optionalAuth,
  authenticate,
  requireAdmin,
  requirePermission,
  requireVendor,
  requireRole,
  preventVendorIDOR,
  requireAgent
};

