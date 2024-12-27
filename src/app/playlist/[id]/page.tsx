'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PlaylistWithTasks } from '@/types/playlist';
import { getPlaylistById, updateTaskStatus } from '../../../lib/playlist';
import { logger } from '../../../lib/logger';

interface TaskWithTimer {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  order: number;
  playlistId: string;
  createdAt: Date;
  updatedAt: Date;
  timeLeft: number;
}

export default function ActivePlaylistPage() {
  const params = useParams();
  const [playlist, setPlaylist] = useState<PlaylistWithTasks | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<TaskWithTimer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        logger.info('Loading playlist:', params.id);
        const data = await getPlaylistById(params.id as string);
        if (data) {
          logger.debug('Playlist loaded:', data);
          setPlaylist(data);
          setTasks(data.tasks.map(task => ({
            ...task,
            timeLeft: task.duration * 60
          } as TaskWithTimer)));
        }
      } catch (err) {
        logger.error('Failed to load playlist:', err);
        setError(err instanceof Error ? err.message : 'Failed to load playlist');
      }
    };
    loadPlaylist();
  }, [params.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && tasks[currentTaskIndex]?.timeLeft > 0) {
      timer = setInterval(() => {
        setTasks(prev => prev.map((task, index) => 
          index === currentTaskIndex 
            ? { ...task, timeLeft: task.timeLeft - 1 }
            : task
        ));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, currentTaskIndex, tasks]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  
  const handleComplete = () => {
    setIsRunning(false);
    setTasks(prev => prev.map((task, index) => 
      index === currentTaskIndex 
        ? { ...task, isCompleted: true }
        : task
    ));
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  if (!playlist) return <div>Loading...</div>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">{playlist.name}</h1>
      
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`
              border rounded-lg transition-all duration-300
              ${index === currentTaskIndex ? 'p-6 border-blue-500' : 'p-4 border-gray-200'}
              ${task.isCompleted ? 'bg-green-50' : ''}
              ${index > currentTaskIndex ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{task.title}</h3>
              {task.isCompleted && (
                <span className="text-green-500">✓</span>
              )}
            </div>
            
            {index === currentTaskIndex && !task.isCompleted && (
              <div className="mt-4">
                <div className="text-2xl font-bold mb-4">
                  {Math.floor(task.timeLeft / 60)}:{(task.timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="space-x-2">
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={handleComplete}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
} 