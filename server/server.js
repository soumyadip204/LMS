import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import forumRoutes from './routes/forum.routes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ── Security Middleware ──
app.use(helmet());                       // Sets secure HTTP headers (CSP, X-Frame-Options, etc.)

// Global rate limiter – 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,                 // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api', globalLimiter);

// Strict auth limiter – 10 attempts per 15 minutes per IP (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login/register attempts. Please try again after 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// ── General Middleware ──
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/forums', forumRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EdStream API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

import http from 'http';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 EdStream server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
