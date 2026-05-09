import { Router } from 'express';
import {
  createBallot,
  getCurrentBallot,
  submitVote,
  getVoteResults,
  confirmMenu,
} from '../controllers/voteController';

const router = Router();

// POST /api/votes/ballot — Admin creates a new ballot
router.post('/ballot', createBallot);

// GET /api/votes/ballot — Students fetch current open ballot
router.get('/ballot', getCurrentBallot);

// POST /api/votes — Student submits votes
router.post('/', submitVote);

// GET /api/votes/results — Admin sees ranked results
router.get('/results', getVoteResults);

// PUT /api/votes/confirm — Admin confirms next week's menu
router.put('/confirm', confirmMenu);

export default router;