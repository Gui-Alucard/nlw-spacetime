import { Prisma, PrismaClient, User } from '@prisma/client'
import { INewUser, UserArgs } from '../interfaces/IUser'
import { PrismaMethods } from '../libs/Prisma.methods'

export default class UserModel implements PrismaMethods<UserArgs, User> {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query'],
    })
  }

  async create(data: INewUser): Promise<User> {
    return await this.prisma.user.create({ data })
  }

  async update(id: string, data: INewUser): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data })
  }

  async findUniqueOrThrow(id: string): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } })
    if (!user) {
      throw new Error(`Memory with ID ${id} not found.`)
    }
    return user
  }

  async findByGithubId(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { githubId: id } })
  }

  async findMany(args: Partial<Prisma.UserFindManyArgs>): Promise<User[]> {
    return await this.prisma.user.findMany(args)
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.prisma.user.delete({ where: { id } })
    return !!user
  }
}
