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

  const calculateProgress = () => {
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    return (completedTasks / tasks.length) * 100;
  };

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

  const handleTaskSelect = (index: number) => {
    if (index === currentTaskIndex) return;
    setIsRunning(false);
    setCurrentTaskIndex(index);
  };

  const handleRestart = async () => {
    try {
      setIsRunning(false);
      
      const response = await fetch(`/api/playlists/${playlist.id}/tasks/${tasks[currentTaskIndex].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks(prev => prev.map((task, index) => 
        index === currentTaskIndex 
          ? { ...task, isCompleted: false, timeLeft: task.duration * 60 }
          : task
      ));
    } catch (error) {
      console.error('Failed to restart task:', error);
      alert('Failed to restart task. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          onClick={() => handleTaskSelect(index)}
          className={`
            border rounded-xl shadow-sm transition-all duration-300 cursor-pointer
            ${index === currentTaskIndex ? 'ring-2 ring-blue-500 bg-white' : 'bg-white hover:border-gray-300'}
            ${task.isCompleted ? 'bg-green-50' : ''}
            ${index === currentTaskIndex ? 'p-6' : 'p-4'}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium">
                {index + 1}
              </span>
              <h3 className="font-medium text-gray-900">{task.title}</h3>
            </div>
            {task.isCompleted ? (
              <span className="flex items-center text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <span className="text-gray-500 text-sm">
                {formatTime(task.timeLeft)}
              </span>
            )}
          </div>
          
          {index === currentTaskIndex && (
            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-3xl font-bold text-gray-900 text-center">
                  {formatTime(task.timeLeft)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(task.timeLeft / (task.duration * 60)) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-3">
                {task.isCompleted ? (
                  <button
                    onClick={handleRestart}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restart Task
                  </button>
                ) : (
                  <>
                    {!isRunning ? (
                      <button
                        onClick={handleStart}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start
                      </button>
                    ) : (
                      <button
                        onClick={handlePause}
                        className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pause
                      </button>
                    )}
                    <button
                      onClick={handleComplete}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-center pt-8">
        <Link
          href="/"
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Today
        </Link>
      </div>
    </div>
  );
} 