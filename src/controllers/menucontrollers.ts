import { Request, Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middleware/authMiddleware'

export const activateDailyMenu = async (req: AuthRequest, res: Response) => {
  try {
    const { date, items } = req.body 
    // items = [{ dishId: string, quantity: number }, ...]

    // Delete old menu for this date
    await prisma.dailyMenu.deleteMany({
      where: { date: new Date(date) }
    })

    const dailyMenus = await prisma.$transaction(
      items.map((item: any) =>
        prisma.dailyMenu.create({
          data: {
            date: new Date(date),
            quantity: item.quantity,
            isActive: true,
            dishId: item.dishId
          }
        })
      )
    )

    res.status(201).json({
      message: 'Daily menu activated successfully',
      dailyMenus
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const getTodayMenu = async (req: Request, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menu = await prisma.dailyMenu.findMany({
      where: {
        date: today,
        isActive: true,
        quantity: { gt: 0 }
      },
      include: {
        dish: true
      }
    })

    res.json(menu)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const updateDailyMenuStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { quantity, isActive } = req.body

    const dailyMenu = await prisma.dailyMenu.update({
      where: { id },
      data: { quantity, isActive },
      include: { dish: true }
    })

    res.json({ message: 'Stock updated', dailyMenu })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}