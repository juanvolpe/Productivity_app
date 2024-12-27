import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const data = await request.json();
    const task = await prisma.task.update({
      where: { 
        id: params.taskId,
        playlistId: params.id
      },
      data: {
        isCompleted: data.isCompleted
      },
      select: {
        id: true,
        isCompleted: true
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    logger.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 