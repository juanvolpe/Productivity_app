import { getPlaylist } from '@/lib/playlist';
import { notFound } from 'next/navigation';
import PlaylistTimer from './PlaylistTimer';
import { getIconPath } from '@/lib/icons';

interface PlaylistPageProps {
  params: {
    id: string;
  };
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const playlist = await getPlaylist(params.id);

  if (!playlist) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconPath(playlist.icon)} />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {playlist.name}
            </h1>
          </div>
          {playlist.description && (
            <p className="text-gray-500">
              {playlist.description}
            </p>
          )}
        </div>
        
        <PlaylistTimer playlist={playlist} />
      </div>
    </div>
  );
} 