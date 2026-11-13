import { DailyTask, StatsData, Todo } from "@/types/todo";

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "https://todo-app-backend-e8ws.vercel.app").replace(/\/$/, "");

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json.data;
}

export const api = {
  // Todos
  getTodos: async (params?: {
    filter?: "all" | "pending" | "completed" | "today";
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<Todo[]> => {
    const query = new URLSearchParams();
    if (params?.filter) query.append("filter", params.filter);
    if (params?.category) query.append("category", params.category);
    if (params?.priority) query.append("priority", params.priority);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return request<Todo[]>(`/api/todos${queryString}`);
  },

  createTodo: async (data: {
    title: string;
    notes?: string;
    priority?: string;
    category?: string;
    dueDate?: string | null;
    dueTime?: string | null;
    reminderEnabled?: boolean;
  }): Promise<Todo> => {
    return request<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleTodo: async (id: number): Promise<Todo> => {
    return request<Todo>(`/api/todos/${id}/toggle`, {
      method: "PATCH",
    });
  },

  updateTodo: async (
    id: number,
    data: {
      title?: string;
      notes?: string;
      priority?: string;
      category?: string;
      dueDate?: string | null;
      dueTime?: string | null;
      reminderEnabled?: boolean;
    }
  ): Promise<Todo> => {
    return request<Todo>(`/api/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTodo: async (id: number): Promise<{ id: number }> => {
    return request<{ id: number }>(`/api/todos/${id}`, {
      method: "DELETE",
    });
  },

  clearCompletedTodos: async (): Promise<number> => {
    const res = await request<{ count: number }>("/api/todos/clear-completed", {
      method: "DELETE",
    });
    return (res as any)?.count || 0;
  },

  // Daily Tasks
  getDailyTasks: async (): Promise<DailyTask[]> => {
    return request<DailyTask[]>("/api/daily");
  },

  createDailyTask: async (data: {
    title: string;
    category?: string;
    frequency?: string;
  }): Promise<DailyTask> => {
    return request<DailyTask>("/api/daily", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleDailyTask: async (id: number): Promise<DailyTask> => {
    return request<DailyTask>(`/api/daily/${id}/toggle`, {
      method: "PATCH",
    });
  },

  deleteDailyTask: async (id: number): Promise<{ id: number }> => {
    return request<{ id: number }>(`/api/daily/${id}`, {
      method: "DELETE",
    });
  },

  // Stats
  getStats: async (): Promise<StatsData> => {
    return request<StatsData>("/api/stats");
  },
};
