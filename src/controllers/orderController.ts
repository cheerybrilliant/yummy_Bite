import { Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middleware/authMiddleware'

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id
    const { items } = req.body

    let totalAmount = 0
    for (const item of items) {
      const dailyMenu = await prisma.dailyMenu.findFirst({
        where: { dishId: item.dishId, isActive: true },
        include: { dish: true }
      })
      if (!dailyMenu) {
        return res.status(400).json({ message: `Dish is not available today` })
      }
      if (dailyMenu.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${dailyMenu.dish.name}` })
      }
      totalAmount += dailyMenu.dish.price * item.quantity
    }

    const order = await prisma.order.create({
      data: {
        student: { connect: { id: studentId } },
        totalAmount,
        status: 'PENDING_PAYMENT',
        items: {
          create: items.map((item: { dishId: string; quantity: number }) => ({
            dish: { connect: { id: item.dishId } },
            quantity: item.quantity,
            price: 0
          }))
        }
      },
      include: { items: true }
    })

    for (const item of items) {
      await prisma.dailyMenu.updateMany({
        where: { dishId: item.dishId, isActive: true },
        data: { quantity: { decrement: item.quantity } }
      })
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order.id,
      totalAmount: order.totalAmount,
      status: order.status
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { dish: { select: { id: true, name: true, price: true } } } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { dish: { select: { id: true, name: true, price: true } } } },
        payment: true,
        receipt: true
      }
    })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const getStudentOrders = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId as string
    const orders = await prisma.order.findMany({
      where: { student: { id: studentId } },
      include: {
        items: { include: { dish: { select: { id: true, name: true, price: true } } } },
        payment: true,
        receipt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { status } = req.body

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    })

    if (status === 'COMPLETED') {
      const existingReceipt = await prisma.receipt.findUnique({
        where: { orderId: id }
      })
      if (!existingReceipt) {
        await prisma.receipt.create({
          data: { order: { connect: { id } } }
        })
      }
    }
//thi s is the end of the file, I just want to make sure that the code is complete and correct before I submit it.
    res.json({ message: 'Order status updated', order })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}