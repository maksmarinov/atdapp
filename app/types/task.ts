export interface TaskType {
  id: number;
  createdAt: number;
  title: string;
  description: string;
  dueDate: number;
  status: boolean;
  user: string;
}
