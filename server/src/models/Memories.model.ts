import { Prisma, PrismaClient, Memory } from '@prisma/client'
import { INewMemory, MemoriesArgs } from '../interfaces/IMemories'
import { PrismaMethods } from '../libs/Prisma.methods'

export default class MemoriesModel
  implements PrismaMethods<MemoriesArgs, Memory>
{
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query'],
    })
  }

  async create(data: INewMemory): Promise<Memory> {
    return await this.prisma.memory.create({ data })
  }

  async update(id: string, data: INewMemory): Promise<Memory> {
    return await this.prisma.memory.update({ where: { id }, data })
  }

  async findUniqueOrThrow(id: string): Promise<Memory> {
    const memory = await this.prisma.memory.findUniqueOrThrow({ where: { id } })
    if (!memory) {
      throw new Error(`Memory with ID ${id} not found.`)
    }
    return memory
  }

  async findMany(args: Partial<Prisma.MemoryFindManyArgs>): Promise<Memory[]> {
    return await this.prisma.memory.findMany(args)
  }

  async delete(id: string): Promise<boolean> {
    const memory = await this.prisma.memory.delete({ where: { id } })
    return !!memory
  }
}
