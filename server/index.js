require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    admin: !!process.env.ADMIN_PASSWORD,
  });
});

app.use('/api', ordersRouter);
app.use('/api/admin', adminRouter);

const distPath = path.join(__dirname, '..', 'dist');
const fs = require('fs');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Serving static frontend from dist/');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Jhojha Games backend running on port ${PORT}`);
  console.log(`Admin:    ${process.env.ADMIN_PASSWORD ? '✅ configured' : '❌ not configured'}`);
});
