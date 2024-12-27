import { prisma } from '@/lib/db';
import PlaylistsClient from './PlaylistsClient';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PlaylistsPage() {
  try {
    logger.info('Fetching playlists for management page');
    
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
    return <PlaylistsClient initialPlaylists={playlists} />;
  } catch (error) {
    logger.error('Failed to fetch playlists:', error);
    throw new Error('Failed to load playlists. Please try again later.');
  }
} 