import { redirect } from 'next/navigation';
import { getUser, logout } from '@/actions/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 md:px-8">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">EventKaro</h1>
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form>
              <button
                formAction={logout}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
