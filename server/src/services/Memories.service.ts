import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import MemoriesModel from '../models/Memories.model'

const pump = promisify(pipeline)

export default class MemoriesService {
  public readonly _memoriesModel: MemoriesModel

  constructor() {
    this._memoriesModel = new MemoriesModel()
  }

  async create(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false),
        memoryDate: z.string(),
      })

      const { content, coverUrl, isPublic, memoryDate } = bodySchema.parse(
        request.body,
      )

      const created = await this._memoriesModel.create({
        content,
        coverUrl,
        isPublic,
        memoryDate,
        userId: request.user.sub,
      })

      return reply.code(201).send({ data: created })
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }

  async update(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = paramsSchema.parse(request.params)

      const bodySchema = z.object({
        content: z.string(),
        coverUrl: z.string(),
        isPublic: z.coerce.boolean().default(false),
        memoryDate: z.string(),
      })
      const { content, coverUrl, isPublic, memoryDate } = bodySchema.parse(
        request.body,
      )

      let memory = await this._memoriesModel.findUniqueOrThrow(id)
      if (memory.userId !== request.user.sub) {
        return reply.code(401).send({
          message: `This memory does not belong to user ${request.user.sub}.`,
        })
      }

      memory = await this._memoriesModel.update(id, {
        content,
        coverUrl,
        isPublic,
        memoryDate,
        userId: memory.userId,
      })

      return reply.code(204).send(memory)
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }

  async findUniqueOrThrow(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const paramsSchema = z.object({ id: z.string().uuid() })
      const { id } = paramsSchema.parse(request.params)

      const memory = await this._memoriesModel.findUniqueOrThrow(id)

      if (!memory.isPublic && memory.userId !== request.user.sub) {
        return reply.code(401).send({
          message: `This memory is not public and does not belong to user ${request.user.sub}.`,
        })
      }

      return reply.code(200).send({ data: memory })
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }

  async findMany(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const memories = await this._memoriesModel.findMany({
        where: { userId: request.user.sub },
        orderBy: { createdAt: 'asc' },
      })
      const shortMemories = memories.map((memory) => {
        return {
          id: memory.id,
          coverUrl: memory.coverUrl,
          memoryDate: memory.memoryDate,
          createdAt: memory.createdAt,
          content:
            memory.content.length > 115
              ? memory.content.substring(0, 115).concat('...')
              : memory.content,
        }
      })
      return reply.code(200).send(shortMemories)
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }

  async upload(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const upload = await request.file({
        limits: {
          fileSize: 5_242_880, // 5mb
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

      // TO DO - separar em um util
      const fileId = randomUUID()
      const extension = extname(upload.fieldname)
      const fileName = fileId.concat(extension)

      const writeStream = createWriteStream(
        resolve(__dirname, '../../uploads/', fileName),
      )

      // Amazon S3, Google GSC, etc for production

      // https://github.com/fastify/fastify-multipart#usage
      await pump(upload.file, writeStream)

      const fullUrl = request.protocol.concat('://').concat(request.hostname)
      const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

      return reply.code(200).send(fileUrl)
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }

  async delete(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = paramsSchema.parse(request.params)

      const memory = await this._memoriesModel.findUniqueOrThrow(id)
      if (memory.userId !== request.user.sub) {
        return reply.code(401).send({
          message: `This memory does not belong to user ${request.user.sub}.`,
        })
      }

      return reply.code(200).send(await this._memoriesModel.delete(id))
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }
}
