import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    const dayName = getDayName(date);
    
    logger.info('Fetching playlists for:', dayName, date.toDateString());

    const playlists = await prisma.playlist.findMany({
      where: {
        [dayName]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: true
          }
        }
      }
    });

    logger.info(`Found ${playlists.length} playlists for ${dayName}`);
    return NextResponse.json(playlists);
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
} 