import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PlaylistTimer from './PlaylistTimer';
import { logger } from '@/lib/logger';

export default async function PlaylistPage({
  params
}: {
  params: { id: string }
}) {
  try {
    logger.info('Loading playlist:', params.id);
    
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!playlist) {
      logger.warn('Playlist not found:', params.id);
      notFound();
    }

    logger.info('Playlist loaded successfully:', playlist.name);

    return (
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-6">{playlist.name}</h1>
        <PlaylistTimer playlist={playlist} />
      </main>
    );
  } catch (error) {
    logger.error('Failed to load playlist:', error);
    throw new Error('Failed to load playlist. Please try again later.');
  }
} 