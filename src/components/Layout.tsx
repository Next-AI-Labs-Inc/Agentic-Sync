import React, { ReactNode, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

// Custom navigation wrapper to prevent double-click issues
const SafeLink = ({ href, className, children }: { href: string, className?: string, children: ReactNode }) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isNavigating || router.pathname === href) return;
    
    setIsNavigating(true);
    router.push(href).finally(() => {
      // Reset after a delay to prevent multiple rapid clicks
      setTimeout(() => setIsNavigating(false), 500);
    });
  }, [href, router, isNavigating]);
  
  return (
    <a 
      href={href} 
      onClick={handleClick} 
      className={className}
      style={{ pointerEvents: isNavigating ? 'none' : 'auto' }}
    >
      {children}
    </a>
  );
};
import UserTaskTracker from './UserTaskTracker';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/tasks" className="text-2xl font-bold text-gray-800">
              IX <span className="text-primary-600">Agent Sync</span>
            </Link>
            <div className="flex items-center space-x-6">
              <nav className="mt-2 md:mt-0">
                <ul className="flex space-x-4">
                  <li>
                    <SafeLink 
                      href="/tasks" 
                      className={`${
                        router.pathname === '/tasks' 
                          ? 'text-primary-600 font-bold' 
                          : 'text-gray-600'
                      } hover:text-primary-600 hover:underline`}
                    >
                      Tasks
                    </SafeLink>
                  </li>
                  <li>
                    <SafeLink 
                      href="/settings" 
                      className={`${
                        router.pathname === '/settings' 
                          ? 'text-primary-600 font-bold' 
                          : 'text-gray-600'
                      } hover:text-primary-600 hover:underline`}
                    >
                      Settings
                    </SafeLink>
                  </li>
                </ul>
              </nav>
              
              <div className="ml-4">
                {/* Authentication removed */}
                <SafeLink 
                  href="/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Dashboard
                </SafeLink>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            Next AI Labs Inc. &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
      
      {/* User Task Tracker - To avoid test bugs in development, don't show in /docs pages */}
      {!router.pathname.startsWith('/docs') && <UserTaskTracker />}
    </div>
  );
}