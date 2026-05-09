import { Router } from 'express';
import {
  createReview,
  getReviewsByDish,
  getReviewByOrder,
} from '../controllers/reviewController';

const router = Router();

// POST /api/reviews
router.post('/', createReview);

// GET /api/reviews/dish/:dishId
router.get('/dish/:dishId', getReviewsByDish);

// GET /api/reviews/order/:orderId
router.get('/order/:orderId', getReviewByOrder);

export default router;