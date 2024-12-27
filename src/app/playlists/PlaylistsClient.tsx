'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaylistWithTasks } from '@/types/playlist';

function getScheduleDays(playlist: PlaylistWithTasks): string[] {
  const days = [];
  if (playlist.monday) days.push('Monday');
  if (playlist.tuesday) days.push('Tuesday');
  if (playlist.wednesday) days.push('Wednesday');
  if (playlist.thursday) days.push('Thursday');
  if (playlist.friday) days.push('Friday');
  if (playlist.saturday) days.push('Saturday');
  if (playlist.sunday) days.push('Sunday');
  return days;
}

interface PlaylistsClientProps {
  initialPlaylists: PlaylistWithTasks[];
}

export default function PlaylistsClient({ initialPlaylists }: PlaylistsClientProps) {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<PlaylistWithTasks[]>(initialPlaylists);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const response = await fetch(`/api/playlists?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }
      
      setPlaylists(playlists.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to delete ALL playlists? This action cannot be undone.')) return;
    if (!confirm('This will permanently delete all your playlists and tasks. Are you really sure?')) return;
    
    try {
      setIsCleaningUp(true);
      const response = await fetch('/api/playlists/cleanup', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clean up playlists');
      }
      
      setPlaylists([]);
      router.refresh();
    } catch (error) {
      console.error('Failed to clean up playlists:', error);
      alert('Failed to clean up playlists. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Manage Playlists</h1>
        <div className="flex gap-4">
          <Link href="/playlists/new" className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Playlist
          </Link>
          <button
            onClick={handleCleanup}
            disabled={isCleaningUp || playlists.length === 0}
            className="btn-secondary bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isCleaningUp ? 'Cleaning...' : 'Clean Up All'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {playlists.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No playlists yet</p>
            <Link
              href="/playlists/new"
              className="text-indigo-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2"
            >
              <span>Create your first playlist</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/playlist/${playlist.id}`}
                    className="hover:text-indigo-600"
                  >
                    <h2 className="text-lg font-semibold hover:text-indigo-600 transition-colors">{playlist.name}</h2>
                  </Link>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {playlist.tasks.length} tasks
                    </p>
                    <p className="text-sm text-indigo-500">
                      Scheduled: {getScheduleDays(playlist).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/playlists/edit/${playlist.id}`}
                    className="text-indigo-500 hover:text-indigo-600 inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="text-red-500 hover:text-red-600 inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
} 