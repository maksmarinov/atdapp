import TaskList from "../components/TaskList";
import NewTaskButton from "../components/NewTaskButton";

export default async function DashboardPage() {
  return (
    <div className="max-h-screen ">
      <div className="w-full mb-6 flex justify-between items-center">
        <h3 className="text-xl font-medium" style={{ color: "#2bff00" }}>
          Your Tasks
        </h3>
        <NewTaskButton />
      </div>

      <div className="flex w-full place-content-start">
        <TaskList />
      </div>
    </div>
  );
}
