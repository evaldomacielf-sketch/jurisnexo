export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 font-medium text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
      </div>
    </div>
  );
}
