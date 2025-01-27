import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      logger.error('Date parameter is missing');
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    const start = startOfDay(date);
    const end = endOfDay(date);

    logger.info('Fetching playlists for:', { date: date.toISOString(), day: date.getDay() });

    const playlists = await prisma.playlist.findMany({
      where: {
        [['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          },
          include: {
            completions: {
              where: {
                date: {
                  gte: start,
                  lte: end
                }
              }
            }
          }
        },
        completions: {
          where: {
            date: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    const playlistsWithStatus = playlists.map(playlist => ({
      ...playlist,
      isCompleted: playlist.completions.length > 0
    }));

    return NextResponse.json(playlistsWithStatus);
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
} 