import { prisma } from '@/lib/db';
import PlaylistsClient from './PlaylistsClient';

export default async function PlaylistsPage() {
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

  return <PlaylistsClient initialPlaylists={playlists} />;
} 