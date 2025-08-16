import React, { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import UserTaskTracker from './UserTaskTracker';

// Using proper Next.js Link component while maintaining backward compatibility
const SafeLink = ({ href, className, children }: { href: string, className?: string, children: ReactNode }) => {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

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
            <Link href="/tasks" className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="align-middle">IX <span className="text-primary-600">Tasks</span></span>
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
IX Tasks &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
      
      {/* User Task Tracker - To avoid test bugs in development, don't show in /docs pages */}
      {!router.pathname.startsWith('/docs') && <UserTaskTracker />}
    </div>
  );
}