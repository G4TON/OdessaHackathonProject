import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'LearnLoop Backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// In production, serve frontend dist
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 LearnLoop API Server is running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛠️ Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);
  console.log(`=========================================`);
});
