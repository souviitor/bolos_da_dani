'use client';
// src/app/admin/layout.tsx
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Cake } from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/orders',    label: 'Pedidos',     icon: ShoppingBag },
  { href: '/admin/products',  label: 'Produtos',    icon: Package },
  { href: '/admin/settings',  label: 'Configurações', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (status === 'loading') return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Cake className="w-8 h-8 text-rose animate-pulse" />
    </div>
  );
  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-espresso text-cream flex flex-col shrink-0">
        <div className="p-6 border-b border-cream/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose flex items-center justify-center">
              <Cake className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-cream text-sm">Bolos da Dani</p>
              <p className="font-body text-cream/40 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all ${
                  active
                    ? 'bg-rose text-white font-bold shadow-sm'
                    : 'text-cream/60 hover:text-cream hover:bg-cream/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-cream/10">
          <div className="px-3 py-2 mb-2">
            <p className="font-body text-xs text-cream/40">Logado como</p>
            <p className="font-body text-sm text-cream font-medium truncate">{session.user?.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-cream/60 hover:text-cream hover:bg-cream/10 transition-all text-sm font-body"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
