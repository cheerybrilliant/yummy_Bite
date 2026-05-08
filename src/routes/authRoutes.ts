import { Router } from 'express'
import { register, login } from '../controllers/authController'

const router = Router()

router.post('/register', register)
router.post('/login', login)
// This is the end of the file. I just want to make sure that the code is complete and correct before I submit it.
export default router