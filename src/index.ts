 import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import prisma from './prisma'

// Existing Routes
import authRoutes from './routes/authRoutes'
import orderRoutes from './routes/orderRoutes'

// Member 2 Routes (Your Work)
import dishRoutes from './routes/dishroutes'
import dailyMenuRoutes from './routes/dailymenuroutes'
import paymentRoutes from './routes/paymentroutes'
import receiptRoutes from './routes/recieptroutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// ====================== ROUTES ======================

// Auth & Orders (Member 1)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

// Menu Management + Payment + Receipt (Member 2 - You)
app.use('/api/dishes', dishRoutes)
app.use('/api/daily-menu', dailyMenuRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/receipts', receiptRoutes)

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Epic Bite API is running' })
})

// ====================== SERVER START ======================
async function main() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

main()