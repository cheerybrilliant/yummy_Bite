import { Request, Response } from 'express';

import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const activateDailyMenu = async (req: AuthRequest, res: Response) => {
  try {
    const { date, items } = req.body as {
      date: string;
      items: Array<{ dishId: string; quantity: number }>;
    };

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);

    await prisma.dailyMenu.deleteMany({
      where: {
        date: {
          gte: selectedDate,
          lt: nextDate,
        },
      },
    });

    const dailyMenus = await prisma.$transaction(
      items.map((item) =>
        prisma.dailyMenu.create({
          data: {
            date: selectedDate,
            quantity: item.quantity,
            isActive: true,
            dishId: item.dishId,
          },
        }),
      ),
    );

    res.status(201).json({
      message: 'Daily menu activated successfully',
      dailyMenus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export const getTodayMenu = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const menu = await prisma.dailyMenu.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        isActive: true,
        quantity: { gt: 0 },
      },
      include: {
        dish: true,
      },
    });

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export const updateDailyMenuStock = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { quantity, isActive } = req.body;

    const dailyMenu = await prisma.dailyMenu.update({
      where: { id },
      data: { quantity, isActive },
      include: { dish: true },
    });

    res.json({ message: 'Stock updated', dailyMenu });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
