'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaylistWithTasks } from '@/types/playlist';
import SuccessAnimation from '@/components/SuccessAnimation';

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
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to clean up all playlists? This will mark all tasks as incomplete.')) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateString = today.toISOString().split('T')[0];

      await Promise.all(playlists.map(async (playlist) => {
        const response = await fetch(`/api/playlists/${playlist.id}/tasks/cleanup?date=${dateString}`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to cleanup tasks');
        }
      }));

      router.refresh();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to cleanup tasks:', error);
      alert('Failed to cleanup tasks. Please try again.');
    }
  };

  const handleComplete = async () => {
    // Your completion logic here
    setShowSuccess(true);
    // Hide the animation after 2 seconds
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateString = today.toISOString().split('T')[0];

  return (
    <>
      {showSuccess && <SuccessAnimation onComplete={() => setShowSuccess(false)} />}
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="page-title mb-4">Manage Playlists</h1>
        <div className="flex gap-4 mb-8 w-full">
          <a
            href="/playlists/new"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-center"
          >
            Create Playlist
          </a>
          <button
            onClick={handleCleanup}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Clean Up All
          </button>
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
              <a
                href="/playlists/new"
                className="text-indigo-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2"
              >
                <span>Create your first playlist</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/playlist/${playlist.id}/${dateString}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-500 block truncate"
                    >
                      {playlist.name}
                    </a>
                    <div className="mt-1 text-sm text-gray-500">
                      {playlist.tasks.length} tasks
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/playlists/${playlist.id}/edit`}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(playlist.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
} 