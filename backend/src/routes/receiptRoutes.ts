import { Router } from 'express';

import { getReceipt } from '../controllers/receiptController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/:orderId', protect, getReceipt);

export default router;
