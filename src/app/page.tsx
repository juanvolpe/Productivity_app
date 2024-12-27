import Link from "next/link";
import { prisma } from '@/lib/db';
import type { Playlist } from '@prisma/client';

type PlaylistWithTasks = Playlist & {
  tasks: {
    id: string;
    title: string;
    duration: number;
    isCompleted: boolean;
    order: number;
    playlistId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

async function getTodaysPlaylists(): Promise<PlaylistWithTasks[]> {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  
  return await prisma.playlist.findMany({
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
}

export default async function Home() {
  try {
    const playlists = await getTodaysPlaylists();
    
    return (
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-6">Today's Playlists</h1>
        
        <div className="space-y-4">
          {playlists.length > 0 && playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <h2 className="text-lg font-semibold">{playlist.name}</h2>
              <p className="text-sm text-gray-600">
                {playlist.tasks.length} tasks
              </p>
            </Link>
          ))}
        </div>

        <div className="fixed bottom-4 right-4 flex gap-4">
          <Link
            href="/playlists/new"
            className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
            title="Create New Playlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
          <Link
            href="/playlists"
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="Manage Playlists"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Link>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Home page error:', error);
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">
          Failed to load playlists. Please try again later.
        </p>
        <div className="mt-4 space-x-4">
          <Link
            href="/playlists/new"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Create Playlist
          </Link>
          <Link
            href="/playlists"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Manage Playlists
          </Link>
        </div>
      </div>
    );
  }
} 