import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10)

    // Save user to database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'STUDENT'
      }
    })

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error })
  }
}