import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, isUsingMysql } from './backend/config/db.mjs';
import authRoutes from './backend/routes/authRoutes.mjs';
import kegiatanRoutes from './backend/routes/kegiatanRoutes.mjs';
import presensiRoutes from './backend/routes/presensiRoutes.mjs';
import userRoutes from './backend/routes/userRoutes.mjs';

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);

  const allowedOrigin = process.env.APP_URL;
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigin && origin === allowedOrigin) {
          callback(null, true);
          return;
        }
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          callback(null, true);
          return;
        }
        if (
          /^https:\/\/[a-z0-9-]+\.asia-[a-z0-9-]+\.run\.app$/.test(origin) ||
          /^https:\/\/[a-z0-9-]+\.run\.app$/.test(origin)
        ) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin tidak diizinkan oleh kebijakan CORS'));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // RESTful API Routes (Arsitektur MVC)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/kegiatan', kegiatanRoutes);
  app.use('/api/presensi', presensiRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: isUsingMysql() ? 'mysql' : 'sandbox-store',
    });
  });

  // Integrasi Vite Middleware (Development) atau Static Build (Production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Sambung Jama'ah berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Gagal memulai server:', err);
  process.exit(1);
});
