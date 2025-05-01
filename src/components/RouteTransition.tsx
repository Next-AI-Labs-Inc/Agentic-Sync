import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

/**
 * @deprecated This component is deprecated. Please use the RouteTransition component 
 * from @ix/shared-tools instead. It provides enhanced features, better accessibility,
 * customizable styling, and improved performance.
 * 
 * Example usage:
 * ```tsx
 * import { RouteTransition } from '@ix/route-transition';
 * 
 * // In _app.tsx
 * function MyApp({ Component, pageProps }) {
 *   return (
 *     <RouteTransition>
 *       <Component {...pageProps} />
 *     </RouteTransition>
 *   );
 * }
 * ```
 */

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const router = useRouter();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Force opacity back to 100 after a timeout to prevent stuck UI
  const clearTransitionState = () => {
    setIsRouteChanging(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Only set route changing if it's a different route
      if (url !== router.asPath) {
        setIsRouteChanging(true);
        
        // Set a maximum timeout for the transition effect
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsRouteChanging(false);
        }, 1000); // Force reset after 1 second max
      }
    };

    const handleRouteChangeComplete = () => {
      clearTransitionState();
    };

    const handleRouteChangeError = () => {
      clearTransitionState();
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    // Force to opacity 100 on initial render
    setIsRouteChanging(false);

    return () => {
      clearTransitionState();
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  // Immediately render content with full opacity
  useEffect(() => {
    setIsRouteChanging(false);
  }, []);

  return (
    <div className="page-transition-container">
      {isRouteChanging && (
        <div className="fixed top-0 left-0 z-50 w-full h-1">
          <div className="h-full bg-primary-600 animate-progress-bar"></div>
        </div>
      )}
      <div 
        key={router.pathname}
        className={`page-content opacity-100 transition-opacity duration-300`}
      >
        {children}
      </div>
    </div>
  );
};

export default RouteTransition;