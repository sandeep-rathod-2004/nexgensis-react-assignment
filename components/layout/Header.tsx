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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-100">
              <Avatar className="h-8 w-8">
                {user?.image && <AvatarImage src={user.image} alt={user?.firstName ?? 'User'} />}
                <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:flex text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
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
