import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
// Export the Prisma client for use in other parts of the application       
export default prisma   
