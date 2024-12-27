import { prisma } from './db';
import { Playlist, Task } from '@prisma/client';
import { PlaylistWithTasks, PlaylistCreateInput } from '@/types/playlist';

export class PlaylistError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PlaylistError';
  }
}

export async function getTodaysPlaylists(): Promise<PlaylistWithTasks[]> {
  try {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    
    return await prisma.playlist.findMany({
      where: {
        [today]: true
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch today\'s playlists:', error);
    throw new PlaylistError('Failed to fetch playlists', 'FETCH_ERROR');
  }
}

export async function getAllPlaylists(): Promise<PlaylistWithTasks[]> {
  try {
    return await prisma.playlist.findMany({
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch all playlists:', error);
    throw new PlaylistError('Failed to fetch playlists', 'FETCH_ERROR');
  }
}

export async function getPlaylistById(id: string): Promise<PlaylistWithTasks | null> {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!playlist) {
      throw new PlaylistError('Playlist not found', 'NOT_FOUND');
    }

    return playlist;
  } catch (error) {
    if (error instanceof PlaylistError) throw error;
    console.error('Failed to fetch playlist:', error);
    throw new PlaylistError('Failed to fetch playlist', 'FETCH_ERROR');
  }
}

export async function createPlaylist(data: PlaylistCreateInput): Promise<PlaylistWithTasks> {
  try {
    const { tasks, activeDays, ...playlistData } = data;
    
    return await prisma.$transaction(async (tx) => {
      const playlist = await tx.playlist.create({
        data: {
          ...playlistData,
          ...activeDays
        }
      });

      await tx.task.createMany({
        data: tasks.map((task, index) => ({
          ...task,
          playlistId: playlist.id,
          order: index + 1
        }))
      });

      return await tx.playlist.findUnique({
        where: { id: playlist.id },
        include: { tasks: true }
      }) as PlaylistWithTasks;
    });
  } catch (error) {
    console.error('Failed to create playlist:', error);
    throw new PlaylistError('Failed to create playlist', 'CREATE_ERROR');
  }
}

export async function deletePlaylist(id: string): Promise<void> {
  try {
    await prisma.playlist.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to delete playlist:', error);
    throw new PlaylistError('Failed to delete playlist', 'DELETE_ERROR');
  }
}

export async function updateTaskStatus(taskId: string, isCompleted: boolean): Promise<Task> {
  try {
    return await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted }
    });
  } catch (error) {
    console.error('Failed to update task status:', error);
    throw new PlaylistError('Failed to update task', 'UPDATE_ERROR');
  }
} 