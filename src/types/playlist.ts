import { Prisma } from '@prisma/client';

export type PlaylistWithTasks = Prisma.PlaylistGetPayload<{
  include: { tasks: true }
}>;

export type PlaylistCreateInput = Omit<Prisma.PlaylistCreateInput, 'tasks'> & {
  tasks: {
    create: Omit<Prisma.TaskCreateInput, 'playlist'>[]
  }
}; 