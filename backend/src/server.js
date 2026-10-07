const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload & public directories exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const publicAdminDir = path.join(__dirname, '../public/admin');
if (!fs.existsSync(publicAdminDir)) {
  fs.mkdirSync(publicAdminDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(uploadDir));
app.use('/admin', express.static(publicAdminDir));

// API Routes
app.use('/api/v1/services', require('./routes/services'));
app.use('/api/v1/requests', require('./routes/requests'));
app.use('/api/v1/quotations', require('./routes/quations'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/upload',require('./routes/upload'))

// Root redirect to Admin Panel
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    message: 'Hipro Backend API & Admin Suite is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Hipro Backend & Admin Server running on port ${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📡 API Base:    http://localhost:${PORT}/api/v1`);
  console.log(`=========================================`);
});