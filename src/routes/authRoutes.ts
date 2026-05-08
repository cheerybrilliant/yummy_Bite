import { Router } from 'express'
import { register, login } from '../controllers/authController'

const router = Router()

router.post('/register', register)
router.post('/login', login)
// This is the end of the file.
export default router