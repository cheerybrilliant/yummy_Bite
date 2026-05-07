import { Router } from 'express'
import {
  placeOrder,
  getAllOrders,
  getOrderById,
  getStudentOrders,
  updateOrderStatus
} from '../controllers/orderController'
import { protect, restrictTo } from '../middleware/authMiddleware'

const router = Router()

// Student places an order
router.post('/', protect, restrictTo('STUDENT'), placeOrder)

// Staff sees all orders
router.get('/', protect, restrictTo('STAFF', 'ADMIN'), getAllOrders)

// Student sees their own orders
router.get('/student/:studentId', protect, getStudentOrders)

// Get one specific order
router.get('/:id', protect, getOrderById)

// Update order status
router.put('/:id/status', protect, restrictTo('STAFF', 'ADMIN'), updateOrderStatus)

export default router