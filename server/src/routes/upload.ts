import { FastifyInstance } from 'fastify'
import UploadsService from '../services/Uploads.service'

export default class UploadRoutes {
  async routes(app: FastifyInstance) {
    const uploadsService = new UploadsService()

    app.post('/upload', async (request, reply) => {
      return await uploadsService.upload(request, reply)
    })
  }
}
