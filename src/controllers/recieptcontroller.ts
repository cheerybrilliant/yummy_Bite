import { Request, Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middleware/authMiddleware'

export const getReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params

    const receipt = await prisma.receipt.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            student: { select: { name: true, email: true, phone: true } },
            items: {
              include: { dish: { select: { name: true, price: true } } }
            }
          }
        }
      }
    })

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' })
    }

    res.json(receipt)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}