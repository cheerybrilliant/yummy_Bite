import { Response } from 'express';

import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const { orderId, dishId, rating, comment } = req.body as {
      orderId: string;
      dishId: string;
      rating: number;
      comment?: string;
    };

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.studentId !== studentId) {
      res.status(403).json({ message: 'Invalid order for review' });
      return;
    }

    const alreadyReviewed = await prisma.review.findFirst({ where: { orderId } });
    if (alreadyReviewed) {
      res.status(400).json({ message: 'You have already reviewed this order' });
      return;
    }

    const orderedDish = order.items.some((item) => item.dishId === dishId);
    if (!orderedDish) {
      res.status(400).json({ message: 'Dish was not part of this order' });
      return;
    }

    const review = await prisma.review.create({
      data: { studentId, orderId, dishId, rating, comment },
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getReviewsByDish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dishId = req.params.dishId as string;

    const reviews = await prisma.review.findMany({
      where: { dishId },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getReviewByOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;

    const review = await prisma.review.findFirst({
      where: { orderId },
      include: { student: { select: { id: true, name: true } } },
    });

    if (!review) {
      res.status(404).json({ message: 'No review found for this order' });
      return;
    }

    res.status(200).json({ review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
