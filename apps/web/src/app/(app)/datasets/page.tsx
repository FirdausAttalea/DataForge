export default function DatasetsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Datasets</h1>
        <p className="text-slate-600">Browse and manage connected datasets and schemas.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Coming soon in this prototype</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          The Datasets page is under development. Connected schemas are shown on the dashboard.
        </p>
      </div>
    </div>
  );
}
