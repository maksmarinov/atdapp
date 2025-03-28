"use server";
import { TaskType } from "../types/task";

// Helper function to generate random date timestamps (between now and 30 days from now)
function getRandomDueDate(): number {
  const now = Date.now();
  const randomDays = Math.floor(Math.random() * 30) + 1; // 1-30 days
  return now + randomDays * 24 * 60 * 60 * 1000;
}

// Helper function to generate sample tasks
function generateSampleTasks(count: number): TaskType[] {
  const tasks: TaskType[] = [];
  const now = Date.now();

  const taskTitles = [
    "Complete project proposal",
    "Review documentation",
    "Update website content",
    "Fix bug in authentication",
    "Prepare presentation slides",
    "Schedule team meeting",
    "Research new technologies",
    "Create data backup",
    "Optimize database queries",
    "Test mobile compatibility",
  ];

  for (let i = 0; i < count; i++) {
    tasks.push({
      id: i + 1,
      createdAt: now - i * 24 * 60 * 60 * 1000, // Each task created 1 day apart
      title: taskTitles[i % taskTitles.length],
      description: `This is a sample task description for task ${
        i + 1
      }. This task is for demonstration purposes.`,
      dueDate: getRandomDueDate(),
      status: Math.random() > 0.5, // Randomly set as complete or not
      user: "current-user-id",
    });
  }

  return tasks;
}

export default async function getUserTasks(
  limit: number = 10
): Promise<TaskType[]> {
  try {
    // In a real app, you would fetch from database
    // For now, we'll generate sample data
    const tasks = generateSampleTasks(limit);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return []; // Return empty array on error
  }
}
