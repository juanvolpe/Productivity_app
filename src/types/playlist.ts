import { Prisma } from '@prisma/client';

export type PlaylistWithTasks = Prisma.PlaylistGetPayload<{
  include: { tasks: true }
}>;

export type PlaylistCreateInput = Prisma.PlaylistCreateInput & {
  tasks: Prisma.TaskCreateInput[];
}; 