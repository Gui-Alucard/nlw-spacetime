import { FastifyInstance } from 'fastify'
import MemoriesService from '../services/Memories.service'

export default class MemoriesRoutes {
  async routes(app: FastifyInstance) {
    const memoriesService = new MemoriesService()

    app.addHook('preHandler', async (request) => {
      await request.jwtVerify()
    })

    app.get('/memories', async (request, reply) => {
      return await memoriesService.findMany(request, reply)
    })
    app.get('/memories/:id', async (request, reply) => {
      return await memoriesService.findUniqueOrThrow(request, reply)
    })
    app.post('/memories', async (request, reply) => {
      return await memoriesService.create(request, reply)
    })
    app.put('/memories/:id', async (request, reply) => {
      return await memoriesService.update(request, reply)
    })
    app.delete('/memories/:id', async (request, reply) => {
      return await memoriesService.delete(request, reply)
    })
  }
}
