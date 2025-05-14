'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FileUp, Home, BookOpen, Calendar, User } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { href: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { href: '/dashboard/test-upload', icon: <FileUp className="h-5 w-5" />, label: 'Upload Test Results' },
    { href: '/dashboard/courses', icon: <BookOpen className="h-5 w-5" />, label: 'Courses' },
    { href: '/dashboard/schedule', icon: <Calendar className="h-5 w-5" />, label: 'Schedule' },
    { href: '/profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Sidebar - hidden on mobile, shown on MD and up */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold">CFIPros</h1>
          </div>
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>
      </aside>
      
      {/* Mobile navigation bar - shown on small screens */}
      <div className="md:hidden border-b bg-background p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">CFIPros</h1>
          {/* Mobile menu button would go here if needed */}
        </div>
        <div className="flex overflow-x-auto py-2 gap-2">
          {navigation.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-xs whitespace-nowrap",
                pathname === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
