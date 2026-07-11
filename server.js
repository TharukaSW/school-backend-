require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./src/middleware/error');

const app = express();
let dbReady = false;

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'school-management-api',
    database: dbReady ? 'connected' : 'unavailable',
    time: new Date().toISOString(),
  });
});

app.use('/api', (req, res, next) => {
  if (dbReady) {
    return next();
  }

  return res.status(503).json({
    message: 'Database connection is unavailable. Start MongoDB locally or whitelist your IP in Atlas and restart the server.',
  });
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

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
