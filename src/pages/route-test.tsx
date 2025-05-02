import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Router from 'next/router';
import Head from 'next/head';
import { registerAllDynamicRoutes, safeRouterPush } from '@/utils/routeUtils';

/**
 * Route Test Component
 * 
 * This component demonstrates various dynamic route navigation options
 * to help debug Next.js routing issues.
 */
export default function RouteTest() {
  const router = useRouter();
  
  useEffect(() => {
    // Log router state for debugging
    console.log('Router state in RouteTest component:', {
      pathname: router.pathname,
      asPath: router.asPath,
      query: router.query,
      isReady: router.isReady,
      components: Object.keys(router.components || {})
    });
  }, [router.isReady]);
  
  // Sample task ID for testing routes
  const sampleTaskId = "test-task-123";
  const testId = "test-dynamic-123";
  const debugId = "debug-route-123";
  
  // Additional test to validate our debug route
  useEffect(() => {
    console.log("Testing route registration for new debug route:");
    console.log("Router components:", Object.keys(router.components || {}));
    
    // Check if our routes are registered
    const hasTaskRoute = Object.keys(router.components || {}).includes('/task/[id]');
    const hasTestRoute = Object.keys(router.components || {}).includes('/test/[testId]');
    const hasDebugRoute = Object.keys(router.components || {}).includes('/debug/[debugId]');
    
    console.log("Route registration status:", {
      "/task/[id]": hasTaskRoute,
      "/test/[testId]": hasTestRoute,
      "/debug/[debugId]": hasDebugRoute
    });
    
    // If any routes are missing, register them all
    if (!hasTaskRoute || !hasTestRoute || !hasDebugRoute) {
      console.log("Some routes are not registered, attempting to register all routes");
      registerAllDynamicRoutes()
        .then(() => {
          console.log("Route registration completed");
          // Check again after registration
          const components = Object.keys(router.components || {});
          console.log("Router components after registration:", components);
        });
    }
  }, [router.isReady]);
  
  return (
    <>
      <Head>
        <title>Route Testing | IX Tasks</title>
        <meta name="description" content="Route testing page for debugging dynamic routes" />
      </Head>
      
      <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Route Testing Page</h1>
          <p className="text-gray-600 mt-2">
            This page allows testing various routing mechanisms to help debug dynamic routes
          </p>
        </div>
        
        {/* Task Route Testing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Task Route Tests</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Standard Next.js Link Component</h3>
              <p className="text-sm text-gray-600 mb-3">
                This uses the Next.js Link component which should work with dynamic routes
              </p>
              <Link 
                href={`/task/${sampleTaskId}`} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Task (Link)
              </Link>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Router.push Method</h3>
              <p className="text-sm text-gray-600 mb-3">
                This uses the router.push method which is the programmatic way to navigate
              </p>
              <button 
                onClick={() => router.push(`/task/${sampleTaskId}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                View Task (router.push)
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Hard Navigation (window.location)</h3>
              <p className="text-sm text-gray-600 mb-3">
                This performs a hard navigation which bypasses Next.js router
              </p>
              <button 
                onClick={() => {
                  console.log('Navigating via window.location');
                  window.location.href = `/task/${sampleTaskId}`;
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                View Task (window.location)
              </button>
            </div>
          </div>
        </div>
        
        {/* Test Route Testing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Dynamic Route Tests</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Test Route (Link)</h3>
              <Link 
                href={`/test/${testId}`} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Route (Link)
              </Link>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Test Route (router.push)</h3>
              <button 
                onClick={() => router.push(`/test/${testId}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Route (router.push)
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Test Route (safe router.push)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Using our safe navigation utility that ensures routes are registered
              </p>
              <button 
                onClick={() => safeRouterPush(`/test/${testId}`)}
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
              >
                Test Route (safe push)
              </button>
            </div>
          </div>
        </div>
        
        {/* Debug Route Testing */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">New Debug Route Tests</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Debug Route (Link)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Testing our newly created diagnostic dynamic route
              </p>
              <Link 
                href={`/debug/${debugId}`} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Debug Route (Link)
              </Link>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Prefetch Debug Route</h3>
              <p className="text-sm text-gray-600 mb-3">
                Manually prefetch the debug route to ensure it's registered
              </p>
              <button 
                onClick={() => {
                  try {
                    // Cannot directly prefetch with pattern, use an actual URL
                    Router.prefetch(`/debug/${debugId}`);
                    console.log('Manually prefetched debug route');
                  } catch (e) {
                    console.error('Error prefetching debug route:', e);
                  }
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Prefetch Debug Route
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Initialize All Routes</h3>
              <p className="text-sm text-gray-600 mb-3">
                Attempt to initialize all dynamic routes simultaneously 
              </p>
              <button 
                onClick={() => {
                  console.log('Initializing all dynamic routes...');
                  
                  // Prefetch all routes with actual URLs, not patterns
                  Promise.all([
                    Router.prefetch(`/task/${sampleTaskId}`),
                    Router.prefetch(`/test/${testId}`),
                    Router.prefetch(`/debug/${debugId}`)
                  ]).then(() => {
                    console.log('All routes prefetched successfully');
                    
                    // Check registration status
                    const components = Object.keys(router.components || {});
                    console.log('Route components after prefetch:', components);
                  }).catch(e => {
                    console.error('Error during route initialization:', e);
                  });
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Initialize All Routes
              </button>
            </div>
          </div>
        </div>
        
        {/* Router Debugging */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Router Debugging</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Current Router State</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify({
                pathname: router.pathname,
                asPath: router.asPath,
                query: router.query,
                isReady: router.isReady,
                availableRoutes: Object.keys(router.components || {})
              }, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <button 
              onClick={() => {
                console.log('Full router object:', router);
                // Check if the router has the task/[id] route
                const hasTaskRoute = Object.keys(router.components || {}).some(
                  path => path === '/task/[id]' || path.includes('/task/')
                );
                console.log('Has task route?', hasTaskRoute);
                // Check what routes are available
                console.log('Available routes:', Object.keys(router.components || {}));
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Log Full Router (Check Console)
            </button>
          </div>
        </div>
        
        {/* Return to Tasks */}
        <div className="text-center mt-8">
          <Link 
            href="/tasks" 
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Return to Tasks
          </Link>
        </div>
      </div>
    </>
  );
}