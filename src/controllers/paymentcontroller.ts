import { Request, Response } from 'express'
import prisma from '../prisma'
import { AuthRequest } from '../middleware/authMiddleware'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: 'uploads/payments/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

export const upload = multer({ storage })

export const submitPayment = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id
    const { orderId, transactionId } = req.body
    const screenshot = req.file?.path

    if (!screenshot) {
      return res.status(400).json({ message: 'Payment screenshot is required' })
    }

    // Verify order belongs to student
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order || order.studentId !== studentId) {
      return res.status(403).json({ message: 'Invalid order' })
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        screenshot,
        transactionId,
        status: 'PENDING'
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'AWAITING_VERIFICATION' }
    })

    res.status(201).json({
      message: 'Payment screenshot submitted successfully',
      payment
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status, rejectedReason } = req.body // status: VERIFIED or REJECTED

    const payment = await prisma.payment.update({
      where: { id },
      data: { status, rejectedReason }
    })

    const orderStatus = status === 'VERIFIED' ? 'PAYMENT_CONFIRMED' : 'PENDING_PAYMENT'

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus }
    })

    res.json({
      message: `Payment ${status.toLowerCase()}`,
      payment
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

export const getPaymentByOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params

    const payment = await prisma.payment.findUnique({
      where: { orderId }
    })

    res.json(payment)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}