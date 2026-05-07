import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import prisma from './prisma'
import authRoutes from './routes/authRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Epic Bite API is running' })
})

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