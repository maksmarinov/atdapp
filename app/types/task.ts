import { TaskStatus } from "@prisma/client";

export type TaskData = {
  title: string;
  description: string;
  dueDate: Date | string;
  status?: TaskStatus;
};
