const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../prisma');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `damage_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// POST /api/v1/requests - Create a service request
router.post('/', upload.array('damageImages', 10), async (req, res) => {
  try {
    const {
      servicecode,
      subServiceCode,
      issueDescription,
      propertyType,
      propertySize,
      location,
      preferredDate,
      preferredTime,
      addressline,
      status
    } = req.body;

    const baseURL = process.env.BASE_URL || 'http://localhost:5000';
    const uploadedMedia = (req.files || []).map(file => `${baseURL}/uploads/${file.filename}`);

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          name: "HINDUSTAN PROJECTS Customer",
          phoneNumber: "9461877701",
          password: "demopassword"
        }
      });
    }

    const requestNumber = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await prisma.serviceRequest.create({
      data: {
        requestNumber,
        userId: defaultUser.id,
        servicecode: servicecode ,
        subServiceCode: subServiceCode ,
        issueDescription: issueDescription ,
        urgency: 'NORMAL',
        status:status ||'SUBMITTED',
        mediaUrl: uploadedMedia.length > 0 ? uploadedMedia : [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
        ],
        propertyType: propertyType ,
        propertySize: propertySize ,
        location: location ,
        preferredDate: preferredDate ,
        preferredTime: preferredTime ,
        addressline: addressline
      }
    });

    res.status(201).json({
      success: true,
      message: 'Request Created Successfully',
      data: newRequest
    });
  } catch (error) {
    console.error('Request creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Request Creation Failed'
    });
  }
});

// GET /api/v1/requests - Get all requests with quotations and user info
router.get('/', async (req, res) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      include: {
        quotations: true,
        user: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: requests, total: requests.length });
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/requests/:id - Single request
router.get('/:id', async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        quotations: true,
        user: true
      }
    });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/requests/:id/status - Update request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: { quotations: true, user: true }
    });
    res.json({ success: true, message: 'Status updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/requests/:id - Delete a request
router.delete('/:id', async (req, res) => {
  try {
    await prisma.serviceRequest.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;