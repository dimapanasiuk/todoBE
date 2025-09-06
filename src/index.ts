import { Request, Response } from 'express';
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');

const todoRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');

// Определяем режим работы
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

const app = express();

// CORS настройки в зависимости от режима
const corsOptions = {
  origin: isProduction 
    ? process.env.CORS_ORIGIN || 'https://your-frontend-domain.com'
    : 'http://localhost:3001',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true 
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Todo App Backend is running!', status: 'OK' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use('/todo', authMiddleware, todoRouter);

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('An error has occurred:', err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📊 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`🌐 CORS Origin: ${corsOptions.origin}`);
}).on('error', (err: Error) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});