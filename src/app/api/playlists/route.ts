import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    
    const playlists = await prisma.playlist.findMany({
      where: {
        [today]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json(playlists);
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const playlist = await prisma.playlist.create({
      data,
      include: {
        tasks: true
      }
    });
    
    return NextResponse.json(playlist);
  } catch (error) {
    logger.error('Failed to create playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
} 