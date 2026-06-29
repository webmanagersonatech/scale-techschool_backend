import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db';

import contactRoutes from './modules/contact/routes';
import joinersRoutes from './modules/joiners/routes';
import authRoutes from './modules/auth/auth.routes';
import settingsRoutes from './modules/settings/routes';
import otpRoutes from './modules/otp/routes';

import { logger } from './middlewares/logger';


dotenv.config();

const app = express();


// Database
connectDB();


// CORS
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://160.187.54.80:3000",
        "http://161.248.37.193:3005",
        "https://scale-certifications.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// Middlewares
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.use(logger);


// Static uploads
app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'))
);


// Routes
app.use('/api/auth', authRoutes);

app.use('/api/joiner', joinersRoutes);

app.use('/api/contacts', contactRoutes);

app.use('/api/otp', otpRoutes);

app.use('/api/settings', settingsRoutes);


// Health check
app.get('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Techs API is running'
    });
});


export default app;