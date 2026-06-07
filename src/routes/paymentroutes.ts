import { Router } from 'express'
import { submitPayment, verifyPayment, getPaymentByOrder, upload } from '../controllers/paymentController'
import { protect, restrictTo } from '../middleware/authMiddleware'

const router = Router()

router.post('/', protect, restrictTo('STUDENT'), upload.single('screenshot'), submitPayment)
router.put('/:id/verify', protect, restrictTo('STAFF', 'ADMIN'), verifyPayment)
router.get('/order/:orderId', protect, getPaymentByOrder)

export default router