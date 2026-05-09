import { Router } from 'express';

import { createDish, deleteDish, getAllDishes, updateDish } from '../controllers/dishController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, restrictTo('ADMIN'), createDish);
router.get('/', getAllDishes);
router.put('/:id', protect, restrictTo('ADMIN'), updateDish);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteDish);

export default router;
