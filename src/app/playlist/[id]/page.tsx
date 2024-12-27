import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PlaylistTimer from './PlaylistTimer';

export default async function PlaylistPage({
  params
}: {
  params: { id: string }
}) {
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
    notFound();
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">{playlist.name}</h1>
      <PlaylistTimer playlist={playlist} />
    </main>
  );
} 