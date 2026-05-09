import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// POST /api/reviews — Student submits a review after order is collected
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, orderId, dishId, rating, comment } = req.body;

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    // Check if student already reviewed this order
    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      res.status(400).json({ message: 'You have already reviewed this order' });
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

// GET /api/reviews/dish/:dishId — Get all reviews for a dish
export const getReviewsByDish = async (req: Request, res: Response): Promise<void> => {
  try {
 const dishId = parseInt(req.params.dishId as string);

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

// GET /api/reviews/order/:orderId — Get review for a specific order
export const getReviewByOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.orderId as string);

    const review = await prisma.review.findUnique({
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