import { AdminNavbar } from "@/components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <AdminNavbar />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}
