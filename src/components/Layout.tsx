import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
            <Link href="/" className="text-2xl font-bold text-gray-800">
              IX <span className="text-primary-600">Tasks</span>
            </Link>
            <nav className="mt-2 md:mt-0">
              <ul className="flex space-x-4">
                <li>
                  <Link 
                    href="/" 
                    className={`${
                      router.pathname === '/' 
                        ? 'text-primary-600 font-bold' 
                        : 'text-gray-600'
                    } hover:text-primary-600 hover:underline`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/initiatives" 
                    className={`${
                      router.pathname === '/initiatives' 
                        ? 'text-primary-600 font-bold' 
                        : 'text-gray-600'
                    } hover:text-primary-600 hover:underline`}
                  >
                    Initiatives
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tasks" 
                    className={`${
                      router.pathname === '/tasks' 
                        ? 'text-primary-600 font-bold' 
                        : 'text-gray-600'
                    } hover:text-primary-600 hover:underline`}
                  >
                    Tasks
                  </Link>
                </li>
                {/* KPI feature removed */}
                <li>
                  <Link 
                    href="/docs" 
                    className={`${
                      router.pathname === '/docs' || router.pathname.startsWith('/docs/') 
                        ? 'text-primary-600 font-bold' 
                        : 'text-gray-600'
                    } hover:text-primary-600 hover:underline`}
                  >
                    Docs
                  </Link>
                </li>
              </ul>
            </nav>
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
            IX Project Tasks Dashboard &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
      
      {/* User Task Tracker */}
      <UserTaskTracker />
    </div>
  );
}