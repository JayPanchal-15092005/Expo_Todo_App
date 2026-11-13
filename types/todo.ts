export type Priority = "low" | "medium" | "high";

export type Category = "Personal" | "Work" | "Health" | "Study" | "Finance" | "Urgent";

export interface Todo {
  id: number;
  title: string;
  notes?: string | null;
  priority: Priority;
  category: Category | string;
  due_date?: string | null;
  due_time?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  id: number;
  title: string;
  category: string;
  frequency: "daily" | "weekdays" | "weekends";
  streak: number;
  last_completed_date?: string | null;
  is_completed_today: boolean;
  created_at: string;
}

export interface StatsData {
  totalTodos: number;
  pendingTodos: number;
  completedTodos: number;
  completedToday: number;
  highPriority: number;
  dueToday: number;
  todoCompletionRate: number;
  totalHabits: number;
  completedHabits: number;
  maxStreak: number;
  habitCompletionRate: number;
}
