export interface UserType {
  id: string;
  email: string;
  password?: string;
}

export interface UserAuthDataType {
  id: string;
  userId: string;
  token: string
  created_at: Date
}

// Расширяем стандартный тип Request
// Это позволит нам добавлять новые свойства
declare module 'express-serve-static-core' {
  interface Request {
    user: UserAuthDataType;
  }
}

export type TodoStatus = "pending" | "in progress" | "completed";

export type TodoPriority = 1 | 2 | 3 | 4 | 5;

export interface TodoType {
  id: string;
  title: string;
  description: string;
  created_at: number;
  updated_at: number;
  deadline_date: number;
  status: TodoStatus;
  priority: TodoPriority;
  color: string;
  user_id: string;
}
