import { getPlaylist } from '@/lib/playlist';
import { notFound } from 'next/navigation';
import PlaylistTimer from './PlaylistTimer';

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {playlist.title}
          </h1>
          <p className="text-gray-500">
            {playlist.description}
          </p>
        </div>
        
        <PlaylistTimer playlist={playlist} />
      </div>
    </div>
  );
} 