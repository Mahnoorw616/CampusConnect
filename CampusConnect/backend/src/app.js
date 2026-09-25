const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()) : ['http://localhost:5173'];

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => res.status(200).json({ success: true, message: 'CampusConnect API is running', environment: process.env.NODE_ENV || 'development' }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
