const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// POST /api/v1/auth/google
router.post('/google', async (req, res) => {
  try {
    const { name, email, googleId, photoUrl } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success:false,
        message:'Email and Google ID are required'
      })
      
    }
    
    // Check if user already exists by email or googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { googleId: googleId }
        ]
      }
    });

    if (!user) {
      // If they don't exist, create a new user dynamically!
      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email: email,
          googleId: googleId,
          photoUrl: photoUrl,
          authProvider: 'google',
        }
      });
    } else {
       // Optionally update the existing user with google info if it was a local user
       if (!user.googleId) {
          user = await prisma.user.update({
             where: { id: user.id },
             data: {
                googleId: googleId,
                photoUrl: photoUrl,
                authProvider: 'google',
             }
          });
       }
    }

    // Generate an Auth Token for the app
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      token,
      user :{
        id: user.id,
        name: user.name,
        email:user.email,
        phoneNumber:user.phoneNumber,
        photoUrl:user.photoUrl,
        authProvider: user.authProvider,
        
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// POST /api/v1/auth/register (Standard Name/Email/Password Signup)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
   

    if (!email || !password || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Email and password and phone number are required' });
    }

    // Check if user already exists
    const existingemail = await prisma.user.findUnique({
      where: 
          { 
            email: email,
           
           },
    });
    if (existingemail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' });
    }
  const existingnum = await prisma.user.findUnique({
      where: 
          { 
            phoneNumber: phoneNumber,
           
           },
    });
    if (existingnum) {
      return res.status(400).json({ success: false, message: 'An account with this phonenumber already exists. Please login.' });
    }
  
    const newUser = await prisma.user.create({
      data: {
        name: name ,
        email,
        password,
        phoneNumber: phoneNumber ,
        authProvider: 'email'
      }
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// POST /api/v1/auth/login (Standard Email/Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches 
    // IMPORTANT: In production, compare hashed passwords!
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token || !JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: 'Please login to continue'
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please login again'
    });
  }
}

// PATCH /api/v1/auth/phone - Save or update user phone number
router.patch('/phone', authenticateUser, async (req, res) => {
  try {
    const phoneNumber = String(req.body.phoneNumber || '').trim();

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { phoneNumber },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Mobile number saved successfully',
      user
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already registered'
      });
    }

    console.error('Save phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save mobile number',
      error: error.message
    });
  }
});

// ==========================================
// SUPER ADMIN & VENDOR ACCESS CONTROL AUTH
// ==========================================

// POST /api/v1/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password are required' });
    }

    // Default Super Admin credentials or database admin user
    const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@hipro.in';
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'hipro@admin2026';

    let isAdminValid = false;
    let adminUser = null;

    if (email.toLowerCase() === defaultAdminEmail.toLowerCase() && password === defaultAdminPassword) {
      isAdminValid = true;
      adminUser = {
        id: 'super_admin_01',
        name: 'Super Administrator',
        email: defaultAdminEmail,
        role: 'ADMIN'
      };
    } else {
      // Check database users with ADMIN role
      const dbUser = await prisma.user.findFirst({
        where: { email: email.toLowerCase() }
      });
      if (dbUser && dbUser.password === password) {
        isAdminValid = true;
        adminUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: 'ADMIN'
        };
      }
    }

    if (!isAdminValid || !adminUser) {
      return res.status(401).json({ success: false, message: 'Invalid Super Admin credentials' });
    }

    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: 'ADMIN'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Super Admin authenticated successfully',
      token,
      user: adminUser
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Admin authentication failed', error: error.message });
  }
});

// POST /api/v1/auth/vendor/login
router.post('/vendor/login', async (req, res) => {
  try {
    const { phone, email, passcode } = req.body;
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Vendor phone or email is required' });
    }

    let vendor = null;

    // 1. Check database Vendor table
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      vendor = await prisma.vendor.findFirst({
        where: {
          phone: { contains: cleanPhone.slice(-10) }
        }
      });
    } else if (email) {
      vendor = await prisma.vendor.findFirst({
        where: { email: email.toLowerCase() }
      });
    }

    // 2. Fallback to registered Adventure & Service operators if not in DB yet
    if (!vendor) {
      const PRESET_OPERATORS = [
        { id: 'v_adv_01', name: 'Captain Arvind Negi', businessName: 'Himalayan Sky Gliders & Air Safari', phone: '+91 98290 88801', city: 'Dehradun', specialization: 'Paragliding & Air Sports' },
        { id: 'v_adv_02', name: 'Fateh Singh Bhati', businessName: 'Thar Royal Desert Safari & Camps', phone: '+91 94141 77702', city: 'Jaisalmer', specialization: 'Desert Safari & Dune Bashing' },
        { id: 'v_adv_03', name: 'Rakesh Rawat', businessName: 'Ganga White Water Adventure Club', phone: '+91 98370 66603', city: 'Rishikesh', specialization: 'River Rafting & Kayaking' },
        { id: 'v_1', name: 'Rajesh Kumar', businessName: 'Rajesh Construction & Repairs', phone: '+91 98765 43210', city: 'Bhilwara', specialization: 'Waterproofing & Leakage' }
      ];

      const cleanInput = (phone || email || '').toLowerCase().replace(/\D/g, '');
      vendor = PRESET_OPERATORS.find(p =>
        (p.phone && p.phone.replace(/\D/g, '').includes(cleanInput.slice(-10))) ||
        (email && p.name.toLowerCase().includes(email.toLowerCase()))
      ) || PRESET_OPERATORS[0];
    }

    const token = jwt.sign(
      {
        id: vendor.id,
        vendorId: vendor.id,
        name: vendor.name,
        businessName: vendor.businessName,
        phone: vendor.phone,
        role: 'VENDOR'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Vendor authenticated successfully',
      token,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        businessName: vendor.businessName,
        phone: vendor.phone,
        city: vendor.city,
        specialization: vendor.specialization,
        role: 'VENDOR'
      }
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ success: false, message: 'Vendor authentication failed', error: error.message });
  }
});

module.exports = router;
