import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PlaylistTimer from './PlaylistTimer';
import { logger } from '@/lib/logger';
import { PlaylistWithTasks } from '@/types/playlist';

type Task = PlaylistWithTasks['tasks'][0];

export default async function PlaylistPage({
  params
}: {
  params: { id: string }
}) {
  try {
    logger.info('Loading playlist:', params.id);
    
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
      logger.warn('Playlist not found:', params.id);
      notFound();
    }

    logger.info('Playlist loaded successfully:', playlist.name);

    // Calculate total duration
    const totalDuration = playlist.tasks.reduce((acc: number, task: Task) => acc + task.duration, 0);
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="sticky top-4 z-50 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{playlist.name}</h1>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-sm font-medium text-blue-600 mb-1">Total Duration</h2>
              <p className="text-2xl font-bold text-blue-900">
                {hours > 0 ? `${hours}h ` : ''}{minutes}m
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Progress Overview</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(playlist.tasks.filter((t: Task) => t.isCompleted).length / playlist.tasks.length) * 100}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {playlist.tasks.filter((t: Task) => t.isCompleted).length}/{playlist.tasks.length} Tasks
              </span>
            </div>
          </div>
        </div>

        <PlaylistTimer playlist={playlist} />
      </main>
    );
  } catch (error) {
    logger.error('Failed to load playlist:', error);
    throw new Error('Failed to load playlist. Please try again later.');
  }
} 