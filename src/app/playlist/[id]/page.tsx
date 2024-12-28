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
      <div>
        <div className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-6 py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                  {playlist.name}
                </h1>
                <span className="text-xs text-gray-500 mt-0.5 block">
                  {hours > 0 ? `${hours}h ` : ''}{minutes}m total
                </span>
              </div>

              <div className="flex items-center gap-3 min-w-[120px] pt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(playlist.tasks.filter((t: Task) => t.isCompleted).length / playlist.tasks.length) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                  {playlist.tasks.filter((t: Task) => t.isCompleted).length}/{playlist.tasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-3xl mx-auto p-6">
          <PlaylistTimer playlist={playlist} />
        </main>
      </div>
    );
  } catch (error) {
    logger.error('Failed to load playlist:', error);
    throw new Error('Failed to load playlist. Please try again later.');
  }
} 