import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

import path from 'path';
import contactRoutes from './modules/contact/routes';
import joinersRoutes from './modules/joiners/routes'

import settingsRoutes from './modules/settings/routes';

import { logger } from './middlewares/logger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/joiner', joinersRoutes);
app.use("/api/contacts", contactRoutes);
app.use('/api/settings', settingsRoutes);
app.get('/', (req, res) => res.json({ ok: true, message: ' Tech API is running' }));

export default app;
