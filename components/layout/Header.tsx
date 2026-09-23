'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, ChevronDown } from 'lucide-react';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition-shadow duration-200 lg:px-6">
      <div className="flex min-w-0 flex-col">
        <h1 className="text-xl font-bold tracking-[-0.04em] text-slate-900">{title}</h1>
        {subtitle && <p className="hidden text-sm text-slate-500 sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-xl px-2 hover:bg-slate-100">
              <Avatar className="h-8 w-8 ring-2 ring-slate-100">
                {user?.image && <AvatarImage src={user.image} alt={user?.firstName ?? 'User'} />}
                <AvatarFallback className="bg-slate-200 text-xs font-semibold text-slate-700">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:flex">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs font-normal text-slate-500">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-xl text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
