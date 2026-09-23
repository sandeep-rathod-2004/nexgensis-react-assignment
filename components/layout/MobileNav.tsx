'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package2, LayoutGrid, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/products', label: 'Products', icon: LayoutGrid },
  { href: '/products/new', label: 'Add Product', icon: PlusCircle },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Package2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">Product Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Mobile navigation">
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
                    onClick={close}
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 overflow-hidden">
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
                onClick={() => {
                  close();
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
