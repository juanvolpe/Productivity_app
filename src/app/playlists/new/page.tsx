'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaylistCreateInput } from '@/types/playlist';
import { suggestIcon } from '@/lib/icons';

export default function NewPlaylist() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([{ title: '', duration: 0 }]);
  const [activeDays, setActiveDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = () => {
    setTasks([...tasks, { title: '', duration: 0 }]);
  };

  const updateTask = (index: number, field: 'title' | 'duration', value: string | number) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const toggleDay = (day: keyof typeof activeDays) => {
    setActiveDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    if (!tasks[0].title.trim()) {
      setError('Please add at least one task');
      return;
    }

    if (!Object.values(activeDays).some(day => day)) {
      setError('Please select at least one active day');
      return;
    }

    try {
      setIsSubmitting(true);
      const playlistData: PlaylistCreateInput = {
        name,
        description,
        icon: suggestIcon(name),  // Automatically suggest icon based on playlist name
        ...activeDays,
        tasks: {
          create: tasks.map((task, index) => ({
            title: task.title,
            duration: Number(task.duration),
            isCompleted: false,
            order: index
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
        throw new Error('Failed to create playlist');
      }

      router.push('/');
    } catch (error) {
      console.error('Failed to create playlist:', error);
      setError('Failed to create playlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Playlist</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Playlist Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Morning Routine"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add a description for your playlist"
              rows={3}
            />
          </div>

          {/* Active Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Days
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeDays).map(([day, isActive]) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day as keyof typeof activeDays)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasks
            </label>
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder="Task title"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    value={task.duration}
                    onChange={(e) => updateTask(index, 'duration', parseInt(e.target.value) || 0)}
                    placeholder="Minutes"
                    min="1"
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTask}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Another Task
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium
                ${isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-indigo-700'
                }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 