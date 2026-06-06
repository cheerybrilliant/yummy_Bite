import { Router } from 'express';

import { confirmMenu, createBallot, getCurrentBallot, getVoteResults, submitVote } from '../controllers/voteController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/ballot', protect, restrictTo('ADMIN'), createBallot);
router.get('/ballot', getCurrentBallot);
router.post('/', protect, restrictTo('STUDENT'), submitVote);
router.get('/results', protect, restrictTo('STAFF', 'ADMIN'), getVoteResults);
router.put('/confirm', protect, restrictTo('ADMIN'), confirmMenu);

export default router;
