import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    logger.info('Cleaning up tasks for playlist:', params.id);

    await prisma.task.updateMany({
      where: {
        playlistId: params.id
      },
      data: {
        isCompleted: false
      }
    });

    logger.info('Tasks cleaned up successfully');
    
    return NextResponse.json({ message: 'Tasks cleaned up successfully' });
  } catch (error) {
    logger.error('Failed to clean up tasks:', error);
    return NextResponse.json(
      { error: 'Failed to clean up tasks' },
      { status: 500 }
    );
  }
} 