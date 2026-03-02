import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import courtRoutes from './routes/courts';
import activityRoutes from './routes/activities';
import memberRoutes from './routes/members';
import billRoutes from './routes/bills';
import dashboardRoutes from './routes/dashboard';
import academyRoutes from './routes/academy';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';

const app = express();

app.use(cors());
app.use(express.json());

// Health check (no auth required) – for load balancers / Railway
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.get('/db-test', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: 'failed' });
  }
});

app.use('/auth', authRoutes);
app.use('/courts', courtRoutes);
app.use('/activities', activityRoutes);
app.use('/members', memberRoutes);
app.use(billRoutes); // GET /bills, GET /activities/:id/bills, POST /bills/:id/payments
app.use('/dashboard', dashboardRoutes);
app.use('/academy', academyRoutes);

// Must be last: catch all errors
app.use(errorHandler);

export default app;
