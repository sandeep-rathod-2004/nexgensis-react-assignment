'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package2, LayoutGrid, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/products', label: 'Products', icon: LayoutGrid },
  { href: '/products/new', label: 'Add Product', icon: PlusCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="hidden lg:flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]">
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_12px_25px_rgba(15,23,42,0.2)]">
          <Package2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-[-0.03em] text-slate-900">Product Admin</span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive =
            item.href === '/products'
              ? pathname === '/products'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-slate-900 text-white shadow-[0_12px_25px_rgba(15,23,42,0.18)]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl border border-transparent transition-colors',
                isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
              )}>
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700 shadow-inner">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{user?.firstName?.[0] ?? 'U'}</span>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-slate-900">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="truncate text-[11px] text-slate-500">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
