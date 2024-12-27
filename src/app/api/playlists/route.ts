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
    return new NextResponse('Internal Server Error', { status: 500 });
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