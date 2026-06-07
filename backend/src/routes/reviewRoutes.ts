import { Router } from 'express';

import { createReview, getReviewByOrder, getReviewsByDish } from '../controllers/reviewController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, restrictTo('STUDENT'), createReview);
router.get('/dish/:dishId', getReviewsByDish);
router.get('/order/:orderId', protect, getReviewByOrder);

export default router;
