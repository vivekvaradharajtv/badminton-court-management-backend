import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import courtRoutes from './routes/courts';
import activityRoutes from './routes/activities';
import memberRoutes from './routes/members';
import billRoutes from './routes/bills';
import dashboardRoutes from './routes/dashboard';
import academyRoutes from './routes/academy';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
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
