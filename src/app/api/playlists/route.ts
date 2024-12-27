import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { suggestIcon } from '@/lib/icons';

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
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
    
    // Add suggested icon based on playlist name
    const icon = suggestIcon(data.name);
    const playlistData = {
      ...data,
      icon
    };
    
    const playlist = await prisma.playlist.create({
      data: playlistData,
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
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    await prisma.playlist.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
} 