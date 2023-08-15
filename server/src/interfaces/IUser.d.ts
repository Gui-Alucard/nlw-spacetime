import { Prisma } from '@prisma/client'

export interface INewUser {
  githubId: number
  name: string
  login: string
  avatarUrl: string
}

export type UserArgs = string &
  number &
  INewUser &
  Partial<Prisma.UserFindManyArgs>
