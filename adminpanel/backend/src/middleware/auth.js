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

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    // Attach identity & role to request
    req.user = {
      id: userId,
      staffId: decoded.staffId || (decoded.role !== 'VENDOR' && decoded.role !== 'CUSTOMER' ? userId : null),
      role: (decoded.role || 'CUSTOMER').toUpperCase(),
      roleName: decoded.roleName || (decoded.role || 'CUSTOMER').toUpperCase(),
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
      vendorId: decoded.vendorId || (decoded.role === 'VENDOR' ? userId : null),
      email: decoded.email || null,
      name: decoded.name || null
    };

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
 * Ensures user is an onboarded Vendor (or Super Admin inspecting vendor portal).
 */
function requireVendor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Admins can act as vendors for inspection / testing
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
    req.vendorId = req.query.vendorId || req.user.vendorId || 'v_adv_01';
    return next();
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

  // Admins are exempt from IDOR restrictions
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (req.user.role === 'VENDOR') {
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
      const userId = decoded.id || decoded.userId;
      if (userId) {
        req.user = {
          id: userId,
          staffId: decoded.staffId || (decoded.role !== 'VENDOR' && decoded.role !== 'CUSTOMER' ? userId : null),
          role: (decoded.role || 'CUSTOMER').toUpperCase(),
          roleName: decoded.roleName || (decoded.role || 'CUSTOMER').toUpperCase(),
          permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
          vendorId: decoded.vendorId || (decoded.role === 'VENDOR' ? userId : null),
          email: decoded.email || null,
          name: decoded.name || null
        };
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

