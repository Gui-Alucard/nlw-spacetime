import 'dotenv/config'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import myFolderPublic from '@fastify/static'
import { resolve } from 'node:path'

import MemoriesRoutes from './routes/memories'
import AuthRoutes from './routes/auth'
import UploadRoutes from './routes/upload'

const app = Fastify()
const port: number = 3333
const host: string = '0.0.0.0' // MOBILE

const auth = new AuthRoutes()
const memories = new MemoriesRoutes()
const upload = new UploadRoutes()

app.register(multipart)

app.register(myFolderPublic, {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'spacetime_jwt',
})

app.register(auth.routes)
app.register(memories.routes)
app.register(upload.routes)

app.listen({ port, host }).then(() => {
  console.log(`🚀 HTTP server running on port: ${port}`)
})
