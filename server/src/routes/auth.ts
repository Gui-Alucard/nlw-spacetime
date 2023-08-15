import { FastifyInstance } from 'fastify'
import UserService from '../services/User.service'

export default class AuthRoutes {
  async routes(app: FastifyInstance) {
    const userService = new UserService()

    app.post('/register', async (request, reply) => {
      return await userService.register(request, reply, app)
    })
  }
}
