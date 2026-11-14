const express = require('express');
const router = express.Router();
const axios = require('axios');
const prisma = require('../prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Default Seed Data for Category-to-API Mappings
const DEFAULT_CATEGORIES = [
  {
    slug: 'hipro',
    name: 'Hipro',
    subtitle: 'Construction & Home Services',
    moduleType: 'service_booking',
    tagline: 'Reliable on-site construction, repair & maintenance',
    themeColor: '#1864E8',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png',
    badge: 'Verified Lead',
    displayOrder: 1,
    isActive: true
  },
  {
    slug: 'freshinbasket',
    name: 'FreshInBasket',
    subtitle: 'Fruits & Vegetables',
    moduleType: 'ecommerce',
    tagline: 'Farm-fresh organic fruits, vegetables & greens',
    themeColor: '#16A34A',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3724/3724720.png',
    badge: 'Express 15m Delivery',
    displayOrder: 2,
    isActive: true
  },
  {
    slug: 'fashion_basket',
    name: 'Fashion Basket',
    subtitle: 'Fashion & Lifestyle',
    moduleType: 'ecommerce',
    tagline: 'Trending ethnic wear, daily style & lifestyle accessories',
    themeColor: '#DB2777',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png',
    badge: 'New Arrivals',
    displayOrder: 3,
    isActive: true
  },
  {
    slug: 'adventure',
    name: 'Adventure',
    subtitle: 'Travel & Experiences',
    moduleType: 'experience_booking',
    tagline: 'Exciting outdoor activities, local tours & attractions',
    themeColor: '#EA580C',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991201.png',
    badge: 'Weekend Special',
    displayOrder: 4,
    isActive: true
  }
];

// In-Memory Fallback Catalog Data for High Reliability (e.g. if external Django/Fashion servers are in setup)
const MOCK_GROCERY_PRODUCTS = [
  {
    id: 'fib-001',
    name: 'Shimla Fresh Royal Gala Apples',
    category: 'Fruits',
    price: 160,
    mrp: 220,
    unit: '1 kg',
    rating: 4.9,
    reviewsCount: 342,
    inStock: true,
    tag: 'Bestseller',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp, juicy and naturally sweet red apples harvested directly from Himachal orchards.'
  },
  {
    id: 'fib-002',
    name: 'Fresh Organic Baby Spinach (Palak)',
    category: 'Vegetables',
    price: 35,
    mrp: 50,
    unit: '250 g',
    rating: 4.8,
    reviewsCount: 189,
    inStock: true,
    tag: 'Organic',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    description: 'Hand-picked tender leafy greens, washed and ozone-sanitized.'
  },
  {
    id: 'fib-003',
    name: 'Farm Fresh Ripe Robusta Bananas',
    category: 'Fruits',
    price: 48,
    mrp: 65,
    unit: '1 Dozen',
    rating: 4.7,
    reviewsCount: 420,
    inStock: true,
    tag: 'Daily Need',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    description: 'Naturally ripened, rich in potassium and instant energy.'
  },
  {
    id: 'fib-004',
    name: 'Local Desi Tomatoes (Hybrid)',
    category: 'Vegetables',
    price: 28,
    mrp: 40,
    unit: '1 kg',
    rating: 4.6,
    reviewsCount: 512,
    inStock: true,
    tag: 'Essential',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: 'Firm, juicy red tomatoes sourced from local Rajasthan greenhouse farmers.'
  },
  {
    id: 'fib-005',
    name: 'Organic Hass Avocado',
    category: 'Exotics',
    price: 140,
    mrp: 199,
    unit: '1 pc (approx 200g)',
    rating: 4.8,
    reviewsCount: 94,
    inStock: true,
    tag: 'Superfood',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
    description: 'Creamy Hass avocados perfect for breakfast salads and guacamole.'
  },
  {
    id: 'fib-006',
    name: 'Crisp English Cucumber',
    category: 'Vegetables',
    price: 32,
    mrp: 45,
    unit: '500 g',
    rating: 4.7,
    reviewsCount: 160,
    inStock: true,
    tag: 'Fresh',
    imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80',
    description: 'Crunchy cucumbers packed with hydration.'
  }
];

const MOCK_FASHION_PRODUCTS = [
  {
    id: 'fas-001',
    name: 'Embroidered Chanderi Silk Kurta Set',
    category: 'Ethnic Wear',
    price: 1899,
    mrp: 3499,
    unit: 'Sizes: S, M, L, XL',
    rating: 4.8,
    reviewsCount: 128,
    inStock: true,
    tag: 'Trending',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    description: 'Premium Chanderi silk with intricate thread embroidery and matched dupatta.'
  },
  {
    id: 'fas-002',
    name: 'Classic Casual Linen Shirt - Sky Blue',
    category: 'Men',
    price: 999,
    mrp: 1899,
    unit: 'Sizes: 38, 40, 42, 44',
    rating: 4.7,
    reviewsCount: 210,
    inStock: true,
    tag: 'Best Fit',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    description: '100% breathable pure linen tailored for all-day comfort.'
  },
  {
    id: 'fas-003',
    name: 'Handcrafted Rajasthani Mojari Footwear',
    category: 'Footwear',
    price: 749,
    mrp: 1299,
    unit: 'Sizes: 6, 7, 8, 9, 10',
    rating: 4.9,
    reviewsCount: 88,
    inStock: true,
    tag: 'Artisan',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic genuine leather mojaris with traditional handcrafted brass tilla work.'
  }
];

// Helper: Ensure default database records exist
async function ensureSeedData() {
  try {
    const count = await prisma.businessIntegration.count();
    if (count === 0) {
      console.log('Seeding default BusinessIntegrations & CategoryApiMappings...');
      
      const hiproInteg = await prisma.businessIntegration.create({
        data: {
          name: 'Hipro Core Node.js Engine',
          connectorKey: 'hipro_node',
          baseUrl: 'https://app.hindustanprojects.in',
          authType: 'BEARER',
          description: 'Core construction & maintenance service booking backend'
        }
      });

      const freshInteg = await prisma.businessIntegration.create({
        data: {
          name: 'FreshInBasket Grocery Engine',
          connectorKey: 'freshinbasket_django',
          baseUrl: 'https://app.hindustanprojects.in',
          authType: 'API_KEY',
          description: 'Hyperlocal e-commerce engine for fresh fruits, vegetables and dairy'
        }
      });

      const fashionInteg = await prisma.businessIntegration.create({
        data: {
          name: 'Fashion Basket Engine',
          connectorKey: 'fashion_basket_api',
          baseUrl: 'https://app.hindustanprojects.in',
          authType: 'BEARER',
          description: 'Lifestyle & apparel e-commerce backend'
        }
      });

      const adventureInteg = await prisma.businessIntegration.create({
        data: {
          name: 'Adventure & Experiences Engine',
          connectorKey: 'adventure_api',
          baseUrl: 'https://app.hindustanprojects.in',
          authType: 'BEARER',
          description: 'Tourism, outdoor sports and venue booking engine'
        }
      });

      // Seed Mappings
      await prisma.categoryApiMapping.createMany({
        data: [
          {
            categorySlug: 'hipro',
            integrationId: hiproInteg.id,
            moduleType: 'service_booking',
            resourceKey: 'feed',
            endpointPath: '/api/v1/services',
            httpMethod: 'GET'
          },
          {
            categorySlug: 'freshinbasket',
            integrationId: freshInteg.id,
            moduleType: 'ecommerce',
            resourceKey: 'feed',
            endpointPath: '/api/v1/platform/mock/freshinbasket/products',
            httpMethod: 'GET'
          },
          {
            categorySlug: 'fashion_basket',
            integrationId: fashionInteg.id,
            moduleType: 'ecommerce',
            resourceKey: 'feed',
            endpointPath: '/api/v1/platform/mock/fashion/products',
            httpMethod: 'GET'
          },
          {
            categorySlug: 'adventure',
            integrationId: adventureInteg.id,
            moduleType: 'experience_booking',
            resourceKey: 'feed',
            endpointPath: '/api/v1/ent',
            httpMethod: 'GET'
          }
        ],
        skipDuplicates: true
      });
      console.log('Seeded default API integrations & mappings.');
    }
  } catch (err) {
    console.error('ensureSeedData error:', err.message);
  }
}
ensureSeedData();

// =========================================================================
// 1. PUBLIC PLATFORM API FOR FLUTTER & WEB
// =========================================================================

/**
 * GET /api/v1/platform/categories
 * Returns active categories with their module type, theme, and API feed endpoints.
 */
router.get('/categories', async (req, res) => {
  try {
    const mappings = await prisma.categoryApiMapping.findMany({
      include: { integration: true }
    });

    const categoriesWithEndpoints = DEFAULT_CATEGORIES.map((cat) => {
      const mapping = mappings.find((m) => m.categorySlug === cat.slug && m.resourceKey === 'feed');
      return {
        ...cat,
        integrationKey: mapping?.integration?.connectorKey || `${cat.slug}_default`,
        integrationName: mapping?.integration?.name || `${cat.name} Backend`,
        feedEndpoint: `/api/v1/platform/categories/${cat.slug}/feed`,
        searchEndpoint: `/api/v1/platform/search?category=${cat.slug}`
      };
    });

    return res.json({
      success: true,
      categories: categoriesWithEndpoints,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.json({
      success: true,
      categories: DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        feedEndpoint: `/api/v1/platform/categories/${c.slug}/feed`,
        searchEndpoint: `/api/v1/platform/search?category=${c.slug}`
      }))
    });
  }
});

/**
 * GET /api/v1/platform/categories/:slug/feed
 * Dynamic Gateway Proxy that forwards the request to the configured backend.
 */
router.get('/categories/:slug/feed', async (req, res) => {
  const { slug } = req.params;

  try {
    const mapping = await prisma.categoryApiMapping.findFirst({
      where: { categorySlug: slug, resourceKey: 'feed' },
      include: { integration: true }
    });

    // 1. If mapping exists and points to external endpoint
    if (mapping && mapping.integration && mapping.integration.baseUrl) {
      const targetBase = mapping.integration.baseUrl.replace(/\/+$/, '');
      const path = mapping.endpointPath.startsWith('/') ? mapping.endpointPath : `/${mapping.endpointPath}`;
      const targetUrl = `${targetBase}${path}`;

      // Avoid infinite loop if pointing to self mock
      if (!targetUrl.includes('/api/v1/platform/mock/')) {
        try {
          const response = await axios({
            method: mapping.httpMethod || 'GET',
            url: targetUrl,
            params: req.query,
            timeout: 7000,
            headers: {
              'Accept': 'application/json',
              ...(mapping.integration.apiKey
                ? { 'Authorization': `Bearer ${mapping.integration.apiKey}` }
                : {})
            }
          });
          return res.json({
            success: true,
            source: mapping.integration.name,
            moduleType: mapping.moduleType,
            data: response.data
          });
        } catch (apiErr) {
          console.warn(`Gateway proxy to ${targetUrl} failed: ${apiErr.message}. Falling back to internal catalog.`);
        }
      }
    }

    // 2. High-performance Internal Resolver
    if (slug === 'freshinbasket') {
      return res.json({
        success: true,
        source: 'FreshInBasket Engine',
        moduleType: 'ecommerce',
        banner: {
          title: 'Farm Fresh Harvest',
          subtitle: 'Organic & Hand-Picked Daily',
          imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'
        },
        tags: ['All', 'Fruits', 'Vegetables', 'Exotics'],
        products: MOCK_GROCERY_PRODUCTS
      });
    }

    if (slug === 'fashion_basket') {
      return res.json({
        success: true,
        source: 'Fashion Basket Engine',
        moduleType: 'ecommerce',
        banner: {
          title: 'Festive & Daily Elegance',
          subtitle: 'Curated Ethnic & Modern Styles',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
        },
        tags: ['All', 'Ethnic Wear', 'Men', 'Footwear'],
        products: MOCK_FASHION_PRODUCTS
      });
    }

    if (slug === 'hipro') {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        include: { subServices: { where: { isActive: true } } },
        orderBy: { rating: 'desc' }
      });
      return res.json({
        success: true,
        source: 'Hipro Core Engine',
        moduleType: 'service_booking',
        services
      });
    }

    return res.status(404).json({
      success: false,
      message: `Category '${slug}' has no active API connector.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Mock feed endpoints for test/preview
 */
router.get('/mock/freshinbasket/products', (req, res) => {
  res.json({
    success: true,
    source: 'FreshInBasket Engine (Mock)',
    moduleType: 'ecommerce',
    products: MOCK_GROCERY_PRODUCTS
  });
});

router.get('/mock/fashion/products', (req, res) => {
  res.json({
    success: true,
    source: 'Fashion Basket Engine (Mock)',
    moduleType: 'ecommerce',
    products: MOCK_FASHION_PRODUCTS
  });
});

/**
 * GET /api/v1/platform/search?q=...&city=...
 * Universal Federated Search across All Modules!
 */
router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const city = (req.query.city || '').trim();

  if (!query) {
    return res.json({ success: true, count: 0, results: [] });
  }

  const results = [];

  try {
    // 1. Search Hipro Construction & Home Services
    try {
      const services = await prisma.service.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            {
              subServices: {
                some: {
                  OR: [
                    { titleEn: { contains: query, mode: 'insensitive' } },
                    { desc: { contains: query, mode: 'insensitive' } }
                  ]
                }
              }
            }
          ]
        },
        include: { subServices: true },
        take: 5
      });

      for (const s of services) {
        results.push({
          id: `hipro_${s.id}`,
          title: s.name,
          subtitle: s.description || 'Verified Home Service',
          categorySlug: 'hipro',
          categoryName: 'Hipro Services',
          moduleType: 'service_booking',
          badge: `★ ${s.rating.toFixed(1)}`,
          imageUrl: s.imageUrl || '',
          actionLabel: 'Book Service',
          payload: { serviceId: s.id, serviceName: s.name }
        });
      }
    } catch (_) {}

    // 2. Search FreshInBasket Grocery
    const matchingGrocery = MOCK_GROCERY_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    for (const p of matchingGrocery) {
      results.push({
        id: `fresh_${p.id}`,
        title: p.name,
        subtitle: `₹${p.price} / ${p.unit} • ${p.category}`,
        categorySlug: 'freshinbasket',
        categoryName: 'FreshInBasket',
        moduleType: 'ecommerce',
        badge: p.tag || 'Fresh',
        imageUrl: p.imageUrl,
        price: p.price,
        actionLabel: 'Add to Cart',
        payload: { productId: p.id, product: p }
      });
    }

    // 3. Search Fashion Basket
    const matchingFashion = MOCK_FASHION_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
    for (const p of matchingFashion) {
      results.push({
        id: `fashion_${p.id}`,
        title: p.name,
        subtitle: `₹${p.price} • ${p.unit}`,
        categorySlug: 'fashion_basket',
        categoryName: 'Fashion Basket',
        moduleType: 'ecommerce',
        badge: p.tag || 'Fashion',
        imageUrl: p.imageUrl,
        price: p.price,
        actionLabel: 'View Style',
        payload: { productId: p.id, product: p }
      });
    }

    return res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Persistence for Platform Orders (e.g. FreshInBasket, Fashion Basket)
const fs = require('fs');
const path = require('path');
const ordersDir = path.join(__dirname, '../data');
if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir, { recursive: true });
const PLATFORM_ORDERS_FILE = path.join(ordersDir, 'platform_orders.json');

function loadPlatformOrders() {
  try {
    if (fs.existsSync(PLATFORM_ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(PLATFORM_ORDERS_FILE, 'utf8'));
    }
  } catch (_) {}
  return [];
}

function savePlatformOrders(orders) {
  try {
    fs.writeFileSync(PLATFORM_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (_) {}
}

/**
 * POST /api/v1/platform/orders
 * Creates a new express order for FreshInBasket (or other platform categories)
 */
router.post('/orders', async (req, res) => {
  try {
    const {
      categorySlug,
      categoryTitle,
      customerName,
      customerPhone,
      deliveryAddress,
      city,
      items,
      totalAmount,
      paymentMethod
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Basket items are required' });
    }

    const prefix = (categorySlug === 'freshinbasket' ? 'FIB' : 'ORD');
    const orderNumber = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderNumber,
      categorySlug: categorySlug || 'freshinbasket',
      categoryTitle: categoryTitle || 'FreshInBasket',
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '',
      deliveryAddress: deliveryAddress || 'Selected Location',
      city: city || 'Bhilwara',
      items,
      totalAmount: totalAmount || 0,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING_ON_DELIVERY',
      status: 'CONFIRMED',
      estimatedDelivery: '25 - 30 minutes',
      deliveryHero: 'Rajesh Sen • Express Rider',
      createdAt: new Date().toISOString()
    };

    const existingOrders = loadPlatformOrders();
    existingOrders.unshift(newOrder);
    savePlatformOrders(existingOrders);

    return res.json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/platform/orders
 * Retrieves past platform orders
 */
router.get('/orders', async (req, res) => {
  try {
    const phone = req.query.phone;
    let orders = loadPlatformOrders();
    if (phone) {
      orders = orders.filter((o) => o.customerPhone && o.customerPhone.includes(phone));
    }
    return res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 2. ADMIN API: INTEGRATION & MAPPING MANAGEMENT
// =========================================================================

/**
 * GET /api/v1/platform/admin/integrations
 */
router.get('/admin/integrations', async (req, res) => {
  try {
    const integrations = await prisma.businessIntegration.findMany({
      include: {
        mappings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, integrations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/platform/admin/integrations
 */
router.post('/admin/integrations', async (req, res) => {
  try {
    const { name, connectorKey, baseUrl, apiKey, authType, description, isActive } = req.body;
    if (!name || !connectorKey || !baseUrl) {
      return res.status(400).json({ success: false, message: 'name, connectorKey and baseUrl are required' });
    }

    const created = await prisma.businessIntegration.create({
      data: {
        name,
        connectorKey,
        baseUrl,
        apiKey: apiKey || null,
        authType: authType || 'NONE',
        description: description || null,
        isActive: isActive !== false
      }
    });
    res.json({ success: true, integration: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/v1/platform/admin/integrations/:id
 */
router.put('/admin/integrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, connectorKey, baseUrl, apiKey, authType, description, isActive } = req.body;

    const updated = await prisma.businessIntegration.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(connectorKey && { connectorKey }),
        ...(baseUrl && { baseUrl }),
        ...(apiKey !== undefined && { apiKey }),
        ...(authType && { authType }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });
    res.json({ success: true, integration: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/platform/admin/integrations/:id
 */
router.delete('/admin/integrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.businessIntegration.delete({ where: { id } });
    res.json({ success: true, message: 'Integration deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/platform/admin/mappings
 */
router.get('/admin/mappings', async (req, res) => {
  try {
    const mappings = await prisma.categoryApiMapping.findMany({
      include: { integration: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, mappings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/platform/admin/mappings
 */
router.post('/admin/mappings', async (req, res) => {
  try {
    const { categorySlug, integrationId, moduleType, resourceKey, endpointPath, httpMethod, config } = req.body;
    if (!categorySlug || !integrationId || !resourceKey || !endpointPath) {
      return res.status(400).json({ success: false, message: 'Missing required mapping parameters' });
    }

    const mapping = await prisma.categoryApiMapping.upsert({
      where: {
        categorySlug_resourceKey: {
          categorySlug,
          resourceKey
        }
      },
      update: {
        integrationId,
        moduleType: moduleType || 'service_booking',
        endpointPath,
        httpMethod: httpMethod || 'GET',
        config: config || null
      },
      create: {
        categorySlug,
        integrationId,
        moduleType: moduleType || 'service_booking',
        resourceKey,
        endpointPath,
        httpMethod: httpMethod || 'GET',
        config: config || null
      },
      include: { integration: true }
    });

    res.json({ success: true, mapping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/platform/admin/test-connection
 * Tests if the given baseUrl responds to a health/ping request
 */
router.post('/admin/test-connection', async (req, res) => {
  const { baseUrl, apiKey } = req.body;
  if (!baseUrl) {
    return res.status(400).json({ success: false, message: 'baseUrl is required' });
  }

  const startTime = Date.now();
  try {
    const response = await axios.get(baseUrl, {
      timeout: 5000,
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      }
    });

    return res.json({
      success: true,
      status: response.status,
      responseTimeMs: Date.now() - startTime,
      message: 'Connection successful!'
    });
  } catch (err) {
    return res.json({
      success: false,
      responseTimeMs: Date.now() - startTime,
      message: `Failed: ${err.message}`
    });
  }
});

module.exports = router;

