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
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Package2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">Product Admin</span>
          <span className="text-xs text-slate-500">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
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
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 overflow-hidden">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{user?.firstName?.[0] ?? 'U'}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-900 truncate">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-slate-500 truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
