import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import prisma from './lib/prisma';
import authRoutes from './routes/authRoutes';
import dailyMenuRoutes from './routes/dailyMenuRoutes';
import dishRoutes from './routes/dishRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import receiptRoutes from './routes/receiptRoutes';
import reviewRoutes from './routes/reviewRoutes';
import voteRoutes from './routes/voteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Yummy Bite API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/daily-menu', dailyMenuRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/votes', voteRoutes);

async function main() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

main();

export default app;
