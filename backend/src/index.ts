import express from 'express';
import dotenv from 'dotenv';
import reviewRoutes from './routes/reviewRoutes';
import voteRoutes from './routes/voteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Yummy Bite API is running 🍽️' });
});

// Your routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/votes', voteRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;