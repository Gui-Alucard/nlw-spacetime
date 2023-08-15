import { Prisma } from '@prisma/client'

export interface INewMemory {
  content: string
  coverUrl: string
  isPublic: boolean
  memoryDate: string
  userId: string
}

export type MemoriesArgs = string &
  INewMemory &
  Partial<Prisma.MemoryFindManyArgs>
