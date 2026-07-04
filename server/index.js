require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const ocrRouter = require('./routes/ocr');
const gamesRouter = require('./routes/games');

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
const DEFAULT_ALLOWED_ORIGINS = ['https://jhojhagames.com', 'https://www.jhojhagames.com', 'http://localhost:5000', 'http://localhost:5001'];

const getAllowedOrigins = () => {
  const configured = String(process.env.CORS_ORIGIN || '').split(',').map(v => v.trim()).filter(Boolean);
  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured])];
};

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-password'],
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, admin: !!process.env.ADMIN_PASSWORD });
});

app.use('/api', gamesRouter);
app.use('/api', ordersRouter);
app.use('/api', ocrRouter);
app.use('/api/admin', adminRouter);

const distPath = path.join(__dirname, '..', 'dist');
const fs       = require('fs');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Serving static frontend from dist/');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Jhojha Games backend running on port ${PORT}`);
  console.log(`Admin:    ${process.env.ADMIN_PASSWORD ? '✅ configured' : '❌ not configured'}`);
});
