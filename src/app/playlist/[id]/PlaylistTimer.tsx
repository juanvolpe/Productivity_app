'use client';

import { useState, useEffect } from 'react';
import { PlaylistWithTasks } from '@/types/playlist';
import Link from 'next/link';

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

interface PlaylistTimerProps {
  playlist: PlaylistWithTasks;
}

export default function PlaylistTimer({ playlist }: PlaylistTimerProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<TaskWithTimer[]>(() => 
    playlist.tasks.map(task => ({
      ...task,
      timeLeft: task.duration * 60
    }))
  );

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
  
  const handleComplete = async () => {
    try {
      setIsRunning(false);
      
      const response = await fetch(`/api/playlists/${playlist.id}/tasks/${tasks[currentTaskIndex].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks(prev => prev.map((task, index) => 
        index === currentTaskIndex 
          ? { ...task, isCompleted: true }
          : task
      ));

      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      alert('Failed to mark task as complete. Please try again.');
    }
  };

  const currentTask = tasks[currentTaskIndex];
  const progress = (tasks.filter(t => t.isCompleted).length / tasks.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {tasks.filter(t => t.isCompleted).length} of {tasks.length} tasks completed
          </span>
          <span className="text-sm font-medium text-indigo-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const isActive = index === currentTaskIndex;
          const isPast = index < currentTaskIndex;
          
          return (
            <div
              key={task.id}
              className={`
                rounded-xl transition-all duration-300 overflow-hidden
                ${isActive ? 'ring-2 ring-indigo-500 bg-white shadow-lg' : 'bg-white shadow-sm'}
                ${isPast ? 'opacity-50' : ''}
              `}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      ${task.isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isActive 
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {task.isCompleted ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    <h3 className={`font-medium ${isActive ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {task.title}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    {task.duration} min
                  </div>
                </div>

                {isActive && !task.isCompleted && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-indigo-600 font-mono tracking-wider">
                        {Math.floor(task.timeLeft / 60)}:{(task.timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Time Remaining
                      </div>
                    </div>
                    <div className="flex justify-center gap-3">
                      {!isRunning ? (
                        <button
                          onClick={handleStart}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start
                        </button>
                      ) : (
                        <button
                          onClick={handlePause}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pause
                        </button>
                      )}
                      <button
                        onClick={handleComplete}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-600 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Playlists
        </Link>
      </div>
    </div>
  );
} 