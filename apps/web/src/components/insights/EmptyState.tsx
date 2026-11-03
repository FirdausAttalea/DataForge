export default function EmptyState({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">No Saved Query Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Run and save a query in SQL Lab first to generate insights and charts.
      </p>
      <a
        href={`/projects/${projectId}/sql-lab`}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Go to SQL Lab
      </a>
    </div>
  );
}
