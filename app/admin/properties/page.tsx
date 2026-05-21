export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Welcome to Tripura Property Admin Panel.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Properties</p>
          <h2 className="mt-2 text-2xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Free Listings</p>
          <h2 className="mt-2 text-2xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Premium Listings</p>
          <h2 className="mt-2 text-2xl font-bold">0</h2>
        </div>
      </div>
    </div>
  );
}