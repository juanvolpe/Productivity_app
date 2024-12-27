'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { PlaylistWithTasks } from '@/types/playlist';

function formatDate() {
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[today.getDay()];
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const date = today.getDate().toString().padStart(2, '0');
  return { dayName, shortDate: `${month}/${date}` };
}

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

export default function Home() {
  const [playlists, setPlaylists] = useState<PlaylistWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dayName, shortDate } = formatDate();

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
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-indigo-100 rounded-lg w-1/4 mb-2"></div>
          <div className="h-6 bg-purple-100 rounded-lg w-1/6 mb-8"></div>
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 bg-white rounded-xl border border-indigo-100"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <h2 className="text-red-800 font-medium">Error</h2>
          <p className="text-red-600 mt-1">{error}</p>
          <div className="mt-4">
            <Link
              href="/playlists"
              className="text-indigo-500 hover:text-indigo-600 font-medium"
            >
              Go to All Playlists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="page-title mb-2">{dayName}</h2>
        <p className="subtitle">{shortDate}</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Today's Playlists</h1>
        <div className="flex gap-4">
          <Link href="/playlists/new" className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Playlist
          </Link>
          <Link href="/playlists" className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Manage Playlists
          </Link>
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
            <p className="text-gray-600 mb-4">No playlists scheduled for {dayName}</p>
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
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="card block hover:border-indigo-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-indigo-600 transition-colors">
                    {playlist.name}
                  </h2>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {playlist.tasks.length} tasks
                    </p>
                    <p className="text-sm text-indigo-500">
                      Scheduled: {getScheduleDays(playlist).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
} 