import { Router } from 'express'
import { activateDailyMenu, getTodayMenu, updateDailyMenuStock } from '../controllers/dailyMenuController'
import { protect, restrictTo } from '../middleware/authMiddleware'

const router = Router()

router.post('/', protect, restrictTo('STAFF', 'ADMIN'), activateDailyMenu)
router.get('/today', getTodayMenu)
router.put('/:id', protect, restrictTo('STAFF', 'ADMIN'), updateDailyMenuStock)

export default router