import { Response } from 'express';

import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const createBallot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { week } = req.body as { week: string };

    await prisma.ballot.updateMany({
      where: { isOpen: true },
      data: { isOpen: false },
    });

    const ballot = await prisma.ballot.upsert({
      where: { week },
      update: { isOpen: true },
      create: { week, isOpen: true },
    });

    res.status(201).json({ message: 'Ballot created successfully', ballot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCurrentBallot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ballot = await prisma.ballot.findFirst({
      where: { isOpen: true },
      orderBy: { createdAt: 'desc' },
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

export const submitVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const { dishIds } = req.body as { dishIds: string[] };

    if (!Array.isArray(dishIds) || dishIds.length < 1 || dishIds.length > 3) {
      res.status(400).json({ message: 'You must vote for 1 to 3 dishes' });
      return;
    }

    const openBallot = await prisma.ballot.findFirst({
      where: { isOpen: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!openBallot) {
      res.status(400).json({ message: 'No active ballot available' });
      return;
    }

    const existingVotes = await prisma.vote.findFirst({
      where: {
        studentId,
        week: openBallot.week,
      },
    });

    if (existingVotes) {
      res.status(400).json({ message: 'You have already voted this week' });
      return;
    }

    await prisma.vote.createMany({
      data: dishIds.map((dishId) => ({
        studentId,
        dishId,
        week: openBallot.week,
        count: 1,
      })),
    });

    res.status(201).json({ message: 'Vote submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getVoteResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const weekFromQuery = req.query.week as string | undefined;
    const openBallot = await prisma.ballot.findFirst({
      where: { isOpen: true },
      orderBy: { createdAt: 'desc' },
    });
    const week = weekFromQuery ?? openBallot?.week;

    if (!week) {
      res.status(400).json({ message: 'No week provided and no active ballot found' });
      return;
    }

    const grouped = await prisma.vote.groupBy({
      by: ['dishId'],
      where: { week },
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
    });

    const dishIds = grouped.map((row) => row.dishId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
      select: { id: true, name: true },
    });
    const dishMap = new Map(dishes.map((dish) => [dish.id, dish.name]));

    const results = grouped.map((row) => ({
      dishId: row.dishId,
      dishName: dishMap.get(row.dishId) ?? 'Unknown Dish',
      votes: row._sum.count ?? 0,
    }));

    res.status(200).json({ week, results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const confirmMenu = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { week } = req.body as { week?: string };
    const where = week ? { week } : { isOpen: true };

    const updated = await prisma.ballot.updateMany({
      where,
      data: { isOpen: false },
    });

    if (updated.count === 0) {
      res.status(404).json({ message: 'No matching ballot found' });
      return;
    }

    res.status(200).json({ message: 'Menu confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
