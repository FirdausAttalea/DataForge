import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
