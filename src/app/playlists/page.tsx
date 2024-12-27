'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaylistWithTasks } from '@/types/playlist';
import { getAllPlaylists, deletePlaylist } from '@/lib/playlist';

export default function PlaylistsPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<PlaylistWithTasks[]>([]);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await getAllPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error('Failed to load playlists:', error);
      }
    };
    loadPlaylists();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await deletePlaylist(id);
      setPlaylists(playlists.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Playlists</h1>
        <Link
          href="/playlists/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Playlist
        </Link>
      </div>

      <div className="space-y-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{playlist.name}</h2>
              <div className="space-x-2">
                <Link
                  href={`/playlists/${playlist.id}/edit`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 