require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'school-management-api', time: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/teachers', require('./src/routes/teachers'));
app.use('/api/students', require('./src/routes/students'));
app.use('/api/subjects', require('./src/routes/subjects'));
app.use('/api/sports', require('./src/routes/sports'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/timetable', require('./src/routes/timetable'));
app.use('/api/marks', require('./src/routes/marks'));
app.use('/api/behavior', require('./src/routes/behavior'));
app.use('/api/dashboard', require('./src/routes/dashboard'));

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
