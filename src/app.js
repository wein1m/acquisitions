import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } })
);

app.use(securityMiddleware);

app.get('/', (req, res) => {
  logger.info('Hellowww~');

  res.status(200).send('Yokosoo~');
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'The API is Running perfectly~' });
});

app.use('/api/auth', authRoutes);

app.get('/api/status', (req, res) => {
  logger.info('API Status: Okieee~');

  res.status(200).send({
    status: 'UP',
    message: 'The API is up and running perfectly fine!!!!!!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default app;
