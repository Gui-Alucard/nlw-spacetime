import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

import { FastifyReply, FastifyRequest } from 'fastify'
import { MultipartFile } from '@fastify/multipart'

const pump = promisify(pipeline)

export default class UploadsService {
  private static async handleFileName(upload: MultipartFile): Promise<string> {
    const fileId = randomUUID()
    const extension = extname(upload.fieldname)
    const fileName = fileId.concat(extension)

    return fileName
  }

  async upload(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const upload = await request.file({
        limits: {
          fileSize: 15_728_640, // 15mb
        },
      })

      if (!upload) {
        return reply.code(400).send({ message: 'No file.' })
      }

      const mimeTypeRegex = /^(image|video)\/[a-zA-A]+/
      const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

      if (!isValidFileFormat) {
        return reply.code(415).send({ message: 'Please, insert a valid file.' })
      }

      const fileName = await UploadsService.handleFileName(upload)

      // Amazon S3, Google GSC, etc for production
      // https://github.com/fastify/fastify-multipart#usage
      await pump(
        upload.file,
        createWriteStream(resolve(__dirname, '../../uploads/', fileName)),
      )

      const fullUrl = request.protocol.concat('://').concat(request.hostname)
      const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

      return reply.code(200).send({ fileUrl })
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }
}
