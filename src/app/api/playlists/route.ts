import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Fetching all playlists');

    const playlists = await prisma.playlist.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    logger.info(`Found ${playlists.length} playlists`);
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
    const body = await request.json();
    logger.info('Received request body:', body);

    // Extract name and handle both formats of day selection
    const { 
      name, 
      selectedDays,
      monday, tuesday, wednesday, thursday, friday, saturday, sunday 
    } = body;

    // Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      logger.error('Invalid name:', { name });
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    // Convert individual day booleans to selectedDays array if needed
    const daysArray = selectedDays || [
      monday && 'monday',
      tuesday && 'tuesday',
      wednesday && 'wednesday',
      thursday && 'thursday',
      friday && 'friday',
      saturday && 'saturday',
      sunday && 'sunday'
    ].filter(Boolean);

    // Validate days
    if (!daysArray.length) {
      logger.error('No days selected');
      return NextResponse.json(
        { error: 'At least one day must be selected' },
        { status: 400 }
      );
    }

    // Validate days format
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const invalidDays = daysArray.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      logger.error('Invalid days:', { invalidDays });
      return NextResponse.json(
        { error: `Invalid days: ${invalidDays.join(', ')}` },
        { status: 400 }
      );
    }

    logger.info('Creating playlist with:', { name, days: daysArray });

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        monday: daysArray.includes('monday'),
        tuesday: daysArray.includes('tuesday'),
        wednesday: daysArray.includes('wednesday'),
        thursday: daysArray.includes('thursday'),
        friday: daysArray.includes('friday'),
        saturday: daysArray.includes('saturday'),
        sunday: daysArray.includes('sunday'),
      }
    });

    logger.info('Created playlist:', playlist);
    return NextResponse.json(playlist);
  } catch (error) {
    logger.error('Failed to create playlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create playlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Playlist ID is required', { status: 400 });
    }

    await prisma.playlist.delete({
      where: { id }
    });

    return new NextResponse('Playlist deleted successfully');
  } catch (error) {
    logger.error('Failed to delete playlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 