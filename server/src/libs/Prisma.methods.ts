import { User, Memory } from '@prisma/client'

export type Models = User | Memory

export interface PrismaMethods<
  Args extends Record<string | number, any>,
  Entity,
> {
  create: (data: Entity) => Promise<Entity>
  update: (args: Args, data: Entity) => Promise<Entity>
  findUniqueOrThrow: (args: Args) => Promise<Entity>
  findByGithubId?: (args: Args) => Promise<Entity | null>
  findMany: (args: Args) => Promise<Entity[]>
  delete: (args: Args) => Promise<boolean>
}
