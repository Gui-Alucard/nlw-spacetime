import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const app = fastify()
const prisma = new PrismaClient()
const port: number = 3333

app.get('/users', async () => {
  const users = await prisma.user.findMany()
  return users
})

app.listen({ port }).then(() => {
  console.log(`🚀 HTTP server running on port: ${port}`)
})
