'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package2, LayoutGrid, PlusCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/products', label: 'Products', icon: LayoutGrid },
  { href: '/products/new', label: 'Add Product', icon: PlusCircle },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Package2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-[-0.03em] text-slate-900">Product Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-950/45"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-[0_0_36px_rgba(15,23,42,0.16)]">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <span className="text-sm font-bold text-slate-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                aria-label="Close navigation menu"
                className="rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Mobile navigation">
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
                      'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl',
                      isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                    )}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

          </div>
        </div>
      )}
    </>
  );
}
