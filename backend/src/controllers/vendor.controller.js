const prisma = require('../prisma');
const { addNotification } = require('./notifications');

// ==========================================
// VENDOR CONTROLLER - Full vendor management
// ==========================================

// Standard Vendor Categories
const VENDOR_CATEGORIES = [
  { id: 'waterproofing', name: 'Waterproofing & Leakage', slug: 'waterproofing', icon: 'Droplets', color: '#0284c7' },
  { id: 'civil', name: 'Civil Construction & Masonry', slug: 'civil', icon: 'HardHat', color: '#6366f1' },
  { id: 'plumbing', name: 'Plumbing & Sanitation', slug: 'plumbing', icon: 'Wrench', color: '#0d9488' },
  { id: 'electrical', name: 'Electrical & Wiring', slug: 'electrical', icon: 'Zap', color: '#eab308' },
  { id: 'painting', name: 'Painting & Finishing', slug: 'painting', icon: 'Sparkles', color: '#ec4899' },
  { id: 'renovation', name: 'Renovation & Carpentry', slug: 'renovation', icon: 'Home', color: '#8b5cf6' },
  { id: 'adventure', name: 'Adventure & Tour Operators', slug: 'adventure', icon: 'Compass', color: '#e11d48' },
  { id: 'general', name: 'General Maintenance & Repair', slug: 'general', icon: 'Layers', color: '#64748b' },
];

// GET /api/v1/vendors/categories - List categories with active vendor count
const getVendorCategories = async (req, res) => {
  try {
    const allVendors = await prisma.vendor.findMany({ select: { specialization: true, status: true } });
    const categoriesWithCount = VENDOR_CATEGORIES.map(cat => {
      const count = allVendors.filter(v =>
        v.specialization && v.specialization.toLowerCase().includes(cat.slug.toLowerCase())
      ).length;
      return {
        ...cat,
        vendorCount: count
      };
    });
    res.json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/vendors - List all vendors (with optional filters)
const getVendors = async (req, res) => {
  try {
    const { city, specialization, category, status, search } = req.query;
    const where = {};
    if (city) where.city = city;
    if (category && category.toLowerCase() !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (specialization && specialization.toLowerCase() !== 'all') {
      where.specialization = { contains: specialization, mode: 'insensitive' };
    }
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: {
          select: { vendorQuotes: true, assignedJobs: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, vendors, total: vendors.length });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/vendors/:id - Single vendor
const getVendorById = async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: {
        vendorQuotes: {
          include: { request: true },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        assignedJobs: {
          orderBy: { created_at: 'desc' },
          take: 20
        }
      }
    });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/vendors - Create a new vendor
const createVendor = async (req, res) => {
  try {
    const { name, businessName, phone, email, city, category, specialization, experience, status, rating, minCharge, imageUrl } = req.body;

    if (!name || !businessName || !phone || !city || !specialization) {
      return res.status(400).json({ success: false, message: 'Name, business name, phone, city, and specialization are required' });
    }

    const determinedCategory = category || (
      specialization.toLowerCase().includes('adventure') ||
      specialization.toLowerCase().includes('safari') ||
      specialization.toLowerCase().includes('paragliding') ||
      specialization.toLowerCase().includes('rafting')
        ? 'Adventure'
        : 'Services'
    );

    const vendor = await prisma.vendor.create({
      data: {
        name,
        businessName,
        phone,
        email: email || null,
        city,
        category: determinedCategory,
        specialization,
        experience: experience || '0 Years',
        status: status || 'active',
        rating: rating ? parseFloat(rating) : 0.0,
        minCharge: minCharge ? parseFloat(minCharge) : 0.0,
        imageUrl: imageUrl || null
      }
    });

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Vendor with this phone or email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/vendors/:id - Update vendor
const updateVendor = async (req, res) => {
  try {
    const { name, businessName, phone, email, city, category, specialization, experience, status, rating, minCharge, imageUrl } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        businessName: businessName || undefined,
        phone: phone || undefined,
        email: email || null,
        city: city || undefined,
        category: category || undefined,
        specialization: specialization || undefined,
        experience: experience || undefined,
        status: status || undefined,
        rating: rating ? parseFloat(rating) : undefined,
        minCharge: minCharge ? parseFloat(minCharge) : undefined,
        imageUrl: imageUrl || undefined
      }
    });

    res.json({ success: true, vendor });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/vendors/:id - Delete vendor
const deleteVendor = async (req, res) => {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/vendors/:id/status - Toggle vendor status
const toggleVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// VENDOR QUOTATIONS
// ==========================================

// GET /api/v1/vendor-quotes - Get quotes (filter by request or vendor)
const getVendorQuotes = async (req, res) => {
  try {
    const { requestId, vendorId, status } = req.query;
    const where = {};
    if (requestId) where.requestId = requestId;
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;

    const quotes = await prisma.vendorQuote.findMany({
      where,
      include: {
        vendor: true,
        request: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, quotes, total: quotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/vendor-quotes - Submit a vendor quotation
const createVendorQuote = async (req, res) => {
  try {
    const { requestId, vendorId, vendorName, vendorBusiness, quotePrice, notes, estimatedTimeline, submittedBy } = req.body;

    if (!requestId || !vendorId || !vendorName || !quotePrice) {
      return res.status(400).json({ success: false, message: 'Request ID, vendor ID, vendor name, and quote price are required' });
    }

    // Verify request exists
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Check if vendor already submitted a quote for this request
    const existingQuote = await prisma.vendorQuote.findFirst({
      where: { requestId, vendorId }
    });
    if (existingQuote) {
      return res.status(409).json({ success: false, message: 'Vendor has already submitted a quotation for this request' });
    }

    const quote = await prisma.vendorQuote.create({
      data: {
        requestId,
        vendorId,
        vendorName,
        vendorBusiness: vendorBusiness || vendor.businessName,
        quotePrice: parseFloat(quotePrice),
        notes: notes || null,
        estimatedTimeline: estimatedTimeline || '1-2 Working Days',
        status: 'submitted',
        submittedBy: submittedBy || vendor.businessName
      },
      include: { vendor: true, request: true }
    });

    // Notify admin about new quotation
    try {
      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('new_vendor_quote', {
          quoteId: quote.id,
          requestId,
          requestNumber: request.requestNumber,
          vendorName: vendor.name,
          vendorBusiness: vendor.businessName,
          quotePrice: quote.quotePrice,
          createdAt: quote.createdAt
        });
      }
      await addNotification({
        title: `New Quotation Received`,
        description: `${vendor.name} (${vendor.businessName}) submitted a quotation of ₹${quotePrice} for request #${request.requestNumber}`,
        type: 'QUOTATION',
        referenceId: quote.id,
        requestId,
        projectName: request.servicecode || 'Service Request',
        location: request.addressline || request.location || 'Site Location',
        unread: true,
        timestamp: new Date().toISOString()
      }, io);
    } catch (notifErr) {
      console.error('Failed to dispatch quotation notification:', notifErr);
    }

    res.status(201).json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/vendor-quotes/:id - Update a vendor quotation
const updateVendorQuote = async (req, res) => {
  try {
    const { quotePrice, notes, estimatedTimeline, status } = req.body;
    const quote = await prisma.vendorQuote.update({
      where: { id: req.params.id },
      data: {
        quotePrice: quotePrice ? parseFloat(quotePrice) : undefined,
        notes: notes || undefined,
        estimatedTimeline: estimatedTimeline || undefined,
        status: status || undefined
      },
      include: { vendor: true, request: true }
    });
    res.json({ success: true, quote });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/vendor-quotes/:id - Delete vendor quotation
const deleteVendorQuote = async (req, res) => {
  try {
    await prisma.vendorQuote.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// VENDOR ASSIGNMENT - Admin assigns vendor to request
// ==========================================

// PATCH /api/v1/vendor-assign/:requestId - Admin manually assigns a vendor
const assignVendorToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { vendorId, vendorName, quotePrice, assignedBy } = req.body;

    if (!vendorId || !vendorName) {
      return res.status(400).json({ success: false, message: 'Vendor ID and vendor name are required' });
    }

    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Update the request with vendor assignment
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        vendorId,
        assignedVendorName: vendorName,
        assignedQuotePrice: quotePrice ? parseFloat(quotePrice) : null,
        assignedBy: assignedBy || 'Super Admin',
        status: 'ASSIGNED'
      },
      include: { user: true, vendor: true, quotations: true }
    });

    // Mark the accepted vendor quote as assigned
    await prisma.vendorQuote.updateMany({
      where: { requestId, vendorId },
      data: { status: 'assigned' }
    });

    // Notify vendor and customer via socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('vendor_assigned', {
          requestId,
          requestNumber: request.requestNumber,
          vendorId,
          vendorName: vendor.name,
          businessName: vendor.businessName,
          assignedQuotePrice: quotePrice ? parseFloat(quotePrice) : null,
          assignedBy: assignedBy || 'Super Admin'
        });

        // Notify customer
        io.emit('request_status_updated', {
          requestId,
          requestNumber: request.requestNumber,
          status: 'ASSIGNED',
          vendorName: vendor.name,
          businessName: vendor.businessName
        });

        await addNotification({
          title: 'Vendor Assigned to Your Request',
          description: `${vendor.name} (${vendor.businessName}) has been assigned to handle request #${request.requestNumber}`,
          type: 'ASSIGNMENT',
          referenceId: request.id,
          requestId,
          projectName: request.servicecode || 'Service Request',
          location: request.addressline || request.location || 'Site Location',
          unread: true,
          timestamp: new Date().toISOString()
        }, io);
      }
    } catch (notifErr) {
      console.error('Failed to dispatch assignment notification:', notifErr);
    }

    res.json({ success: true, message: 'Vendor assigned successfully', request: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// VENDOR-FACING ENDPOINTS
// ==========================================

// GET /api/v1/vendor/requests - Get requests shared with vendors (open for quoting)
const getVendorRequests = async (req, res) => {
  try {
    const { vendorId, city, status } = req.query;
    const where = {};

    // Only show requests that are open for quotes or already assigned to this vendor
    if (vendorId) {
      where.OR = [
        { status: 'QUOTE_REQUESTED' },
        { vendorId }
      ];
    } else {
      where.status = 'QUOTE_REQUESTED';
    }

    if (city) where.city = city;
    if (status && !vendorId) where.status = status;

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        user: true,
        vendorQuotes: {
          where: vendorId ? { vendorId } : undefined,
          take: 1
        },
        vendor: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, requests, total: requests.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/vendor/my-quotes - Get quotes submitted by a specific vendor
const getMyVendorQuotes = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'vendorId is required' });
    }

    const quotes = await prisma.vendorQuote.findMany({
      where: { vendorId },
      include: {
        request: {
          include: { user: true, vendor: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, quotes, total: quotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/vendor/my-jobs - Get jobs assigned to a specific vendor
const getMyVendorJobs = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'vendorId is required' });
    }

    const jobs = await prisma.serviceRequest.findMany({
      where: { vendorId },
      include: {
        user: true,
        vendorQuotes: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, jobs, total: jobs.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  toggleVendorStatus,
  getVendorQuotes,
  createVendorQuote,
  updateVendorQuote,
  deleteVendorQuote,
  assignVendorToRequest,
  getVendorRequests,
  getMyVendorQuotes,
  getMyVendorJobs
};
