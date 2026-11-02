export interface Task {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  reminder_time: string | null;
  repeat: 'none' | 'daily' | 'weekly';
  is_completed: number;
  completed_at: string | null;
  is_priority: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CreateTaskDTO = Omit<Task, 'id' | 'is_completed' | 'completed_at' | 'created_at' | 'updated_at' | 'deleted_at'>;
