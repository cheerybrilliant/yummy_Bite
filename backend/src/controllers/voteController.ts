import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// POST /api/votes/ballot — Admin publishes a new ballot
export const createBallot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { weekLabel, dishIds } = req.body;

    // Close any existing open ballot first
    await prisma.ballot.updateMany({
      where: { isOpen: true },
      data: { isOpen: false },
    });

    // Create new ballot and connect dishes
    const ballot = await prisma.ballot.create({
      data: {
        weekLabel,
        options: {
          connect: dishIds.map((id: number) => ({ id })),
        },
      },
      include: { options: true },
    });

    res.status(201).json({ message: 'Ballot created successfully', ballot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET /api/votes/ballot — Students fetch the current open ballot
export const getCurrentBallot = async (req: Request, res: Response): Promise<void> => {
  try {
    const ballot = await prisma.ballot.findFirst({
      where: { isOpen: true },
      include: { options: true },
    });

    if (!ballot) {
      res.status(404).json({ message: 'No active ballot found' });
      return;
    }

    res.status(200).json({ ballot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// POST /api/votes — Student submits their votes (max 3 dishes)
export const submitVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, ballotId, dishIds } = req.body;

    // Enforce max 3 votes
    if (!Array.isArray(dishIds) || dishIds.length > 3 || dishIds.length < 1) {
      res.status(400).json({ message: 'You must vote for 1 to 3 dishes' });
      return;
    }

    // Check if student has already voted
    const existing = await prisma.vote.findUnique({ where: { studentId } });
    if (existing) {
      res.status(400).json({ message: 'You have already voted' });
      return;
    }

    const vote = await prisma.vote.create({
      data: { studentId, ballotId, dishIds },
    });

    res.status(201).json({ message: 'Vote submitted successfully', vote });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// GET /api/votes/results — Admin sees voting results ranked by votes
export const getVoteResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const votes = await prisma.vote.findMany();

    // Count how many times each dish was voted for
    const tally: Record<number, number> = {};
    votes.forEach((vote) => {
      const ids = vote.dishIds as number[];
      ids.forEach((dishId) => {
        tally[dishId] = (tally[dishId] || 0) + 1;
      });
    });

    // Sort dishes by vote count descending
    const ranked = Object.entries(tally)
      .map(([dishId, count]) => ({ dishId: parseInt(dishId), votes: count }))
      .sort((a, b) => b.votes - a.votes);

    res.status(200).json({ results: ranked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// PUT /api/votes/confirm — Admin confirms next week's menu from results
export const confirmMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ballotId } = req.body;

    const ballot = await prisma.ballot.update({
      where: { id: ballotId },
      data: {
        isOpen: false,
        confirmedAt: new Date(),
      },
    });

    res.status(200).json({ message: 'Menu confirmed successfully', ballot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};