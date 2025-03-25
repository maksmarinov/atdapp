import { mockFetch } from "../utils/mockFetch";

async function DashboardPage() {
  // Mock data fetching with delay
  const data = await mockFetch("", 1000);
  return (
    <div
      className="flex h-screen w-full items-center justify-center
    text-7xl"
    >
      <h1>Dashboard</h1>
    </div>
  );
}

export default DashboardPage;
