export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  priority: TaskPriority;
  goal_id?: string | null;
  goal_title?: string | null;
  estimated_minutes: number;
  actual_minutes?: number | null;
  reminder_time: string | null;
  repeat: 'none' | 'daily' | 'weekly';
  is_completed: number;
  completed_at: string | null;
  is_priority: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTaskDTO {
  title: string;
  notes?: string | null;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  category?: string;
  priority?: TaskPriority;
  goal_id?: string | null;
  estimated_minutes?: number;
  actual_minutes?: number | null;
  reminder_time?: string | null;
  repeat?: 'none' | 'daily' | 'weekly';
  is_priority?: number;
}
