import { Router } from 'express';

import {
  getAllOrders,
  getOrderById,
  getStudentOrders,
  placeOrder,
  updateOrderStatus,
} from '../controllers/orderController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, restrictTo('STUDENT'), placeOrder);
router.get('/', protect, restrictTo('STAFF', 'ADMIN'), getAllOrders);
router.get('/student/:studentId', protect, getStudentOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, restrictTo('STAFF', 'ADMIN'), updateOrderStatus);

export default router;
