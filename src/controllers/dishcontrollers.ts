import { Request, Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middleware/authMiddleware'

export const createDish = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, image } = req.body

    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        price: Number(price),
        category,
        image
      }
    })

    res.status(201).json({
      message: 'Dish created successfully',
      dish
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const getAllDishes = async (req: Request, res: Response) => {
  try {
    const dishes = await prisma.dish.findMany({
      orderBy: { name: 'asc' }
    })
    res.json(dishes)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const updateDish = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, price, category, image } = req.body

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        category,
        image
      }
    })

    res.json({ message: 'Dish updated', dish })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const deleteDish = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    await prisma.dish.delete({ where: { id } })
    res.json({ message: 'Dish deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}