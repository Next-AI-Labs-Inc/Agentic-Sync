import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const router = useRouter();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const [loadingKey, setLoadingKey] = useState('');

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      setIsRouteChanging(true);
      setLoadingKey(url);
    };

    const handleRouteChangeComplete = () => {
      setIsRouteChanging(false);
    };

    const handleRouteChangeError = () => {
      setIsRouteChanging(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  return (
    <div className="page-transition-container">
      {isRouteChanging && (
        <div className="fixed top-0 left-0 z-50 w-full h-1">
          <div className="h-full bg-primary-600 animate-progress-bar"></div>
        </div>
      )}
      <div 
        key={router.pathname}
        className={`page-content ${isRouteChanging ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      >
        {children}
      </div>
    </div>
  );
};

export default RouteTransition;