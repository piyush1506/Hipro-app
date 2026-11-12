const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const OFFERS_FILE = path.join(__dirname, '../../uploads/offers.json');
const REDEMPTIONS_FILE = path.join(__dirname, '../../uploads/coupon_redemptions.json');

function readOffers() {
  try {
    if (!fs.existsSync(OFFERS_FILE)) {
      fs.mkdirSync(path.dirname(OFFERS_FILE), { recursive: true });
      fs.writeFileSync(OFFERS_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(OFFERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading offers file:', err);
    return [];
  }
}

function writeOffers(offers) {
  try {
    fs.mkdirSync(path.dirname(OFFERS_FILE), { recursive: true });
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing offers file:', err);
    return false;
  }
}

function readRedemptions() {
  try {
    if (!fs.existsSync(REDEMPTIONS_FILE)) {
      fs.mkdirSync(path.dirname(REDEMPTIONS_FILE), { recursive: true });
      fs.writeFileSync(REDEMPTIONS_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(REDEMPTIONS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading redemptions file:', err);
    return [];
  }
}

function writeRedemptions(redemptions) {
  try {
    fs.mkdirSync(path.dirname(REDEMPTIONS_FILE), { recursive: true });
    fs.writeFileSync(REDEMPTIONS_FILE, JSON.stringify(redemptions, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing redemptions file:', err);
    return false;
  }
}

function normalizePhone(p) {
  if (!p) return null;
  const digits = String(p).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Checks whether a customer has already used a specific coupon code.
 * Matches by userId, 10-digit phone, or email to prevent duplicate usage.
 */
function hasCustomerUsedCoupon(couponCode, { userId, phone, email } = {}) {
  if (!couponCode || typeof couponCode !== 'string') return false;
  const cleanCode = couponCode.trim().toUpperCase();
  const redemptions = readRedemptions();

  const cleanPhone = normalizePhone(phone);
  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  const cleanUserId = userId ? String(userId).trim() : null;

  return redemptions.some(r => {
    if ((r.couponCode || '').trim().toUpperCase() !== cleanCode) return false;

    // 1. Match by userId
    if (cleanUserId && r.userId && String(r.userId).trim() === cleanUserId) {
      return true;
    }

    // 2. Match by 10-digit phone number
    if (cleanPhone && r.phone) {
      const rPhone = normalizePhone(r.phone);
      if (rPhone && rPhone === cleanPhone) return true;
    }

    // 3. Match by email address
    if (cleanEmail && r.email && String(r.email).trim().toLowerCase() === cleanEmail) {
      return true;
    }

    return false;
  });
}

/**
 * Persists a coupon redemption record when a booking or quotation payment completes.
 */
function recordCouponRedemption({ couponCode, userId, phone, email, orderId, bookingNumber, quotationId } = {}) {
  if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) return;
  const cleanCode = couponCode.trim().toUpperCase();

  // Guard against duplicate records
  if (hasCustomerUsedCoupon(cleanCode, { userId, phone, email })) {
    return;
  }

  const redemptions = readRedemptions();
  redemptions.push({
    id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    couponCode: cleanCode,
    userId: userId ? String(userId).trim() : null,
    phone: normalizePhone(phone),
    email: email ? String(email).trim().toLowerCase() : null,
    orderId: orderId || null,
    bookingNumber: bookingNumber || null,
    quotationId: quotationId || null,
    redeemedAt: new Date().toISOString()
  });

  writeRedemptions(redemptions);
}

function calculateDiscount(discountStr, amount) {
  if (!discountStr || typeof discountStr !== 'string') return 0;
  const str = discountStr.toUpperCase().trim();
  
  // Percentage match e.g. "20% OFF", "15%", "FLAT 25%"
  const percentMatch = str.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    if (!isNaN(pct) && pct > 0) {
      return Math.round((amount * pct) / 100);
    }
  }

  // Flat rupee match e.g. "₹500 OFF", "RS 500", "500 OFF", "FLAT 200"
  const rupeeMatch = str.match(/(?:₹|RS\.?|FLAT)?\s*(\d+(?:\.\d+)?)/i);
  if (rupeeMatch) {
    const flat = parseFloat(rupeeMatch[1]);
    if (!isNaN(flat) && flat > 0) {
      return Math.min(amount, flat);
    }
  }

  // Free visit match
  if (str.includes('FREE')) {
    return amount;
  }

  return 0;
}

// POST /api/v1/offers/validate - Validate coupon code & compute discount
router.post('/validate', optionalAuth, (req, res) => {
  try {
    const { code, amount, section, userId, phone, email } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const trimmedCode = code.trim().toUpperCase();
    const orderAmount = parseFloat(amount || 0);

    const offers = readOffers();
    const offer = offers.find(o => (o.code || '').trim().toUpperCase() === trimmedCode);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: `Coupon "${trimmedCode}" is invalid.`
      });
    }

    if (offer.isActive === false) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${trimmedCode}" is no longer active.`
      });
    }

    // Check one-time per customer restriction
    const customerUserId = req.user?.id || userId;
    const customerPhone = phone || req.body.customerPhone || req.user?.phoneNumber || req.user?.phone;
    const customerEmail = email || req.body.customerEmail || req.user?.email;

    if (hasCustomerUsedCoupon(trimmedCode, { userId: customerUserId, phone: customerPhone, email: customerEmail })) {
      return res.status(400).json({
        success: false,
        message: `You have already used coupon "${trimmedCode}". Each coupon can only be used once per customer.`
      });
    }

    // Section validation (Separation between Services & Entertainment/Adventure)
    if (section && typeof section === 'string') {
      const targetSec = section.toLowerCase().trim();
      const offerSec = (offer.section || 'services').toLowerCase().trim();

      if (targetSec === 'adventure' || targetSec === 'ent' || targetSec === 'entertainment') {
        if (offerSec === 'services' || offerSec === 'service') {
          return res.status(400).json({
            success: false,
            message: `Coupon "${trimmedCode}" is valid only for Home Services bookings, not for Adventure bookings.`
          });
        }
      } else if (targetSec === 'services' || targetSec === 'service') {
        if (offerSec === 'adventure' || offerSec === 'ent' || offerSec === 'entertainment') {
          return res.status(400).json({
            success: false,
            message: `Coupon "${trimmedCode}" is valid only for Adventure & Entertainment bookings, not for Home Services.`
          });
        }
      }
    }

    // Check minimum order amount if specified
    const minAmount = parseFloat(offer.minAmount || 0);
    if (minAmount > 0 && orderAmount > 0 && orderAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Coupon requires a minimum booking amount of ₹${minAmount.toLocaleString('en-IN')}. (Current: ₹${orderAmount.toLocaleString('en-IN')})`
      });
    }

    // Calculate discount amount
    let discountAmount = calculateDiscount(offer.discount, orderAmount);
    if (orderAmount > 0) {
      discountAmount = Math.min(orderAmount, discountAmount);
    }
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return res.json({
      success: true,
      valid: true,
      coupon: {
        id: offer.id,
        code: offer.code,
        title: offer.title,
        subtitle: offer.subtitle,
        category: offer.category,
        section: offer.section || 'services',
        discount: offer.discount,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
        minAmount,
        terms: offer.terms || ''
      },
      message: `Coupon "${trimmedCode}" applied successfully! You save ₹${discountAmount.toLocaleString('en-IN')}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon', error: err.message });
  }
});

// GET /api/v1/offers - Public endpoint for mobile app
router.get('/', optionalAuth, (req, res) => {
  try {
    const { section, phone, userId, email } = req.query;
    const offers = readOffers();
    let active = offers
      .filter(o => o.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (section && typeof section === 'string') {
      const sec = section.toLowerCase().trim();
      if (sec === 'adventure' || sec === 'ent' || sec === 'entertainment') {
        active = active.filter(o => 
          (o.section && (o.section.toLowerCase() === 'adventure' || o.section.toLowerCase() === 'ent' || o.section.toLowerCase() === 'entertainment')) ||
          (o.category && (o.category.toLowerCase().includes('adventure') || o.category.toLowerCase().includes('safari') || o.category.toLowerCase().includes('sports')))
        );
      } else if (sec === 'services' || sec === 'service') {
        active = active.filter(o => 
          !o.section || 
          o.section.toLowerCase() === 'services' || 
          o.section.toLowerCase() === 'service' ||
          (o.section.toLowerCase() !== 'adventure' && o.section.toLowerCase() !== 'ent')
        );
      }
    }

    // Filter out coupons that this customer has ALREADY redeemed
    const customerUserId = req.user?.id || userId;
    const customerPhone = phone || req.user?.phoneNumber || req.user?.phone;
    const customerEmail = email || req.user?.email;

    if (customerUserId || customerPhone || customerEmail) {
      active = active.filter(o => !hasCustomerUsedCoupon(o.code, {
        userId: customerUserId,
        phone: customerPhone,
        email: customerEmail
      }));
    }

    return res.json({
      success: true,
      count: active.length,
      offers: active
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve offers', error: err.message });
  }
});
    return res.status(500).json({ success: false, message: 'Failed to retrieve offers', error: err.message });
  }
});

// GET /api/v1/offers/admin - Admin endpoint for all offers
router.get('/admin', authenticate, requireAdmin, (req, res) => {
  try {
    const offers = readOffers();
    return res.json({
      success: true,
      count: offers.length,
      offers: offers.sort((a, b) => (a.order || 0) - (b.order || 0))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve offers', error: err.message });
  }
});

// POST /api/v1/offers - Create new offer
router.post(['/', '/admin'], authenticate, requireAdmin, (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      discount,
      code,
      badge,
      imageUrl,
      minAmount,
      validTill,
      targetRoute,
      terms,
      order,
      isActive
    } = req.body;

    if (!title || !code) {
      return res.status(400).json({ success: false, message: 'Title and Coupon Code are required' });
    }

    const offers = readOffers();
    const newOffer = {
      id: `offer_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      category: category ? category.trim() : '',
      discount: discount ? discount.trim() : '',
      code: code.trim().toUpperCase(),
      badge: badge ? badge.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      minAmount: Number(minAmount) || 0,
      validTill: validTill ? validTill.trim() : '',
      targetRoute: targetRoute ? targetRoute.trim() : '',
      terms: terms ? terms.trim() : '',
      order: Number(order) || (offers.length + 1),
      isActive: isActive !== false,
      createdAt: new Date().toISOString()
    };

    offers.push(newOffer);
    writeOffers(offers);

    return res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer: newOffer
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create offer', error: err.message });
  }
});

// PUT /api/v1/offers/:id - Update offer
router.put(['/:id', '/admin/:id'], authenticate, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const offers = readOffers();
    const index = offers.findIndex(o => o.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const updated = {
      ...offers[index],
      ...req.body,
      id: offers[index].id,
      updatedAt: new Date().toISOString()
    };

    if (req.body.code) {
      updated.code = req.body.code.trim().toUpperCase();
    }

    offers[index] = updated;
    writeOffers(offers);

    return res.json({
      success: true,
      message: 'Offer updated successfully',
      offer: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update offer', error: err.message });
  }
});

// DELETE /api/v1/offers/:id - Delete offer
router.delete(['/:id', '/admin/:id'], authenticate, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    let offers = readOffers();
    const initialLength = offers.length;
    offers = offers.filter(o => o.id !== id);

    if (offers.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    writeOffers(offers);
    return res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete offer', error: err.message });
  }
});

router.readOffers = readOffers;
router.calculateDiscount = calculateDiscount;
router.hasCustomerUsedCoupon = hasCustomerUsedCoupon;
router.recordCouponRedemption = recordCouponRedemption;
module.exports = router;
