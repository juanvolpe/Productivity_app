'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { PlaylistWithTasks } from '@/types/playlist';

export default function Home() {
  const [playlists, setPlaylists] = useState<PlaylistWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists/today');
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        const data = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error('Failed to load playlists:', error);
        setError('Failed to load playlists. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadPlaylists();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error</h2>
          <p className="text-red-600 mt-1">{error}</p>
          <div className="mt-4">
            <Link
              href="/playlists"
              className="text-blue-500 hover:text-blue-600"
            >
              Go to All Playlists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Today's Playlists</h1>
        <div className="flex gap-4">
          <Link
            href="/playlists/new"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Playlist
          </Link>
          <Link
            href="/playlists"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Manage Playlists
          </Link>
        </div>
      </div>
      
      <div className="space-y-4">
        {playlists.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No playlists scheduled for today</p>
            <Link
              href="/playlists/new"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Create your first playlist
            </Link>
          </div>
        ) : (
          playlists.map((playlist) => (
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
          ))
        )}
      </div>
    </main>
  );
} 