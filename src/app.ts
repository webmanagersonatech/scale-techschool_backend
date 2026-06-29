import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import path from 'path';
import contactRoutes from './modules/contact/routes';
import joinersRoutes from './modules/joiners/routes';
import authRoutes from './modules/auth/auth.routes';
import settingsRoutes from './modules/settings/routes';
import otpRoutes from './modules/otp/routes';
import { logger } from './middlewares/logger';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

connectDB();

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.use(logger);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/joiner', joinersRoutes);
app.use("/api/contacts", contactRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
    res.json({ 
        ok: true, 
        message: 'Tech API is running'
    });
});

export default app;