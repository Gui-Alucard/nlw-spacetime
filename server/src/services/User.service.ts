import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import UserModel from '../models/User.model'
import axios, { AxiosResponse } from 'axios'

export default class UserService {
  public readonly _userModel: UserModel

  constructor() {
    this._userModel = new UserModel()
  }

  private static async gitAxiosAccessToken(code: string) {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )
    return response
  }

  private static async gitAxiosUserResponse(
    access_token: string,
  ): Promise<AxiosResponse<any, any>> {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    return response
  }

  async register(
    request: FastifyRequest,
    reply: FastifyReply,
    app: FastifyInstance,
  ): Promise<FastifyReply> {
    try {
      const bodySchema = z.object({ code: z.string() })
      const { code } = bodySchema.parse(request.body)

      const accessTokenResponse = await UserService.gitAxiosAccessToken(code)
      const { access_token } = accessTokenResponse.data

      const userResponse = await UserService.gitAxiosUserResponse(access_token)

      const userSchema = z.object({
        id: z.number(),
        login: z.string(),
        name: z.string() || null,
        avatar_url: z.string().url(),
      })
      const userInfo = userSchema.parse(userResponse.data)

      let user = await this._userModel.findByGithubId(userInfo.id)

      if (!user) {
        user = await this._userModel.create({
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        })
      }

      // Aqui nós escolhemos as informações e isso não é um padrão para o TypeScript
      // Por esse motivo declaramos o module Auth.d.ts [https://github.com/fastify/fastify-jwt#typescript]
      const token = app.jwt.sign(
        {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        {
          sub: user.id,
          expiresIn: '30 days',
        },
      )

      return reply.code(200).send({ token })
    } catch (error) {
      return reply.code(503).send({
        message: `Sorry, something went wrong. Follow the error ==> ${error}`,
      })
    }
  }
}
