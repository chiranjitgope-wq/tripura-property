export default function AdminPlansPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        Listing Plans
      </h1>

      <p className="mt-2 text-gray-600">
        Manage Free and Premium listing plans.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Free Plan
          </h2>

          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• 2 Photos</li>
            <li>• Basic Listing</li>
            <li>• No YouTube Video</li>
          </ul>

          <div className="mt-6 rounded-xl bg-gray-100 px-4 py-3 text-sm">
            Current Price: ₹0
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Premium Plan
          </h2>

          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• 5 Photos</li>
            <li>• Premium Badge</li>
            <li>• Featured Listing</li>
            <li>• YouTube Video Link</li>
          </ul>

          <div className="mt-6 rounded-xl bg-yellow-100 px-4 py-3 text-sm text-yellow-700">
            Current Price: ₹499
          </div>
        </div>
      </div>
    </div>
  );
}