'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaylistCreateInput } from '@/types/playlist';

interface TaskInput {
  title: string;
  duration: number;
  isCompleted: boolean;
  order: number;
}

export default function NewPlaylistPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [activeDays, setActiveDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        title: '',
        duration: 5,
        isCompleted: false,
        order: tasks.length + 1,
      },
    ]);
  };

  const handleTaskChange = (index: number, field: keyof TaskInput, value: any) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    if (!Object.values(activeDays).some(day => day)) {
      alert('Please select at least one active day');
      return;
    }

    try {
      setIsSubmitting(true);
      const playlistData: PlaylistCreateInput = {
        name,
        ...activeDays,
        tasks: {
          create: tasks.map(task => ({
            title: task.title,
            duration: task.duration,
            isCompleted: false,
            order: task.order,
          }))
        }
      };

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playlistData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create playlist');
      }

      router.push('/playlists');
      router.refresh();
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Playlist Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Active Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(activeDays).map(([day, isActive]) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDays(prev => ({ ...prev, [day]: !isActive }))}
              className={`p-2 text-sm rounded ${
                isActive ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {day.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Tasks</h3>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                placeholder="Task name"
                className="flex-1 rounded-md border-gray-300"
                required
              />
              <input
                type="number"
                value={task.duration}
                onChange={(e) => handleTaskChange(index, 'duration', parseInt(e.target.value) || 0)}
                placeholder="Minutes"
                className="w-20 rounded-md border-gray-300"
                required
                min="1"
              />
              <button
                type="button"
                onClick={() => setTasks(prev => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTask}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
          >
            Add Task
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 
          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Creating...' : 'Create Playlist'}
      </button>
    </form>
  );
} 