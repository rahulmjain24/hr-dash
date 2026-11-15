import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-slate-800">
          HR Dash
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="block p-2 hover:bg-slate-800 rounded">
            Overview
          </Link>
          <Link href="/departments" className="block p-2 hover:bg-slate-800 rounded">
            Departments
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 text-black">
        {children}
      </main>
    </div>
  );
}