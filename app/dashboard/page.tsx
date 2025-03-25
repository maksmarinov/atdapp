import { mockFetch } from "../utils/mockFetch";

async function DashboardPage() {
  // Mock data fetching with delay
  const data = await mockFetch("", 1000);
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

export default DashboardPage;
