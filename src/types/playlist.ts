export interface TaskCompletion {
  id: string;
  taskId: string;
  date: Date;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  order: number;
  playlistId: string;
  createdAt: Date;
  updatedAt: Date;
  completions: TaskCompletion[];
}

export interface PlaylistWithTasks {
  id: string;
  name: string;
  tasks: Task[];
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PlaylistCreateInput = Omit<PlaylistWithTasks, 'id' | 'createdAt' | 'updatedAt' | 'tasks'> & {
  tasks: {
    create: Omit<PlaylistWithTasks['tasks'][0], 'id' | 'playlistId' | 'createdAt' | 'updatedAt'>[];
  };
}; 