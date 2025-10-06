import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS configuration — replace the default app.use(cors())
app.use(cors({
  origin: [
    'https://tender-system-dwzf.vercel.app', // your Vercel frontend
    'https://srv1006127.hstgr.cloud',        // your backend API domain (Hostinger VPS)
    'http://localhost:5173',                 // optional: local dev frontend (Vite)
    'http://localhost:3000'                  // optional: local dev backend
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ✅ Static uploads
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// ✅ Routers
import basicsRouter from './routes/basics.js';
import tendersRouter from './routes/tenders.js';
import projectsRouter from './routes/projects.js';
import combinedRouter from './routes/combined.js';
import seedRouter from './routes/seed.js';

app.use('/api/basics', basicsRouter);
app.use('/api/tenders', tendersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/combined', combinedRouter);
app.use('/api/seed', seedRouter);

// ✅ Health checks
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: 'server', port: process.env.PORT || 5175 });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
