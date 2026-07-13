'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, Settings, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockNotifications } from '@/lib/mock-data';
import MobileNav from './MobileNav';

export default function TopNav() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-6 gap-4">
      {/* Left: Mobile nav + Search */}
      <div className="flex items-center gap-3 flex-1">
        <MobileNav />
        <div className="relative hidden sm:block max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="pl-10 h-10 bg-secondary/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            )}
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            </div>
            <ScrollArea className="h-[300px]">
              {mockNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      notif.type === 'error' ? 'bg-destructive' :
                      notif.type === 'warning' ? 'bg-amber-500' :
                      notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <button className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="w-[18px] h-[18px]" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent transition-colors ml-1 cursor-pointer"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium leading-none">Admin Demo</p>
              <p className="text-xs text-muted-foreground mt-0.5">admin</p>
            </div>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Backdrop click helper */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50 origin-top-right"
                >
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">My Account</div>
                  <Separator className="my-1" />
                  <button onClick={() => setMenuOpen(false)} className="w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-accent transition-colors">Profile</button>
                  <button onClick={() => setMenuOpen(false)} className="w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-accent transition-colors">Settings</button>
                  <Separator className="my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium cursor-pointer"
                  >
                    Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
