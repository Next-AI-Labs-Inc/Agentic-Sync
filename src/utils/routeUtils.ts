import Router from 'next/router';

/**
 * Manually register a dynamic route with the Next.js router
 * 
 * This is a utility function to help fix issues with dynamic routes
 * not being properly registered in certain scenarios.
 */
export const registerDynamicRoute = (route: string, paramName: string, paramValue: string) => {
  console.log(`Manually registering dynamic route ${route} with ${paramName}=${paramValue}`);
  
  try {
    // First try to prefetch the route to load its component
    Router.prefetch(route)
      .then(() => {
        console.log(`Successfully prefetched route: ${route}`);
        
        // Set the param explicitly to ensure it's registered
        Router.router?.setPageParam(paramName, paramValue);
        
        // Force a route change event to update router state
        Router.events.emit('routeChangeComplete', Router.router?.asPath || '/');
        
        return true;
      })
      .catch(err => {
        console.error(`Error prefetching route ${route}:`, err);
        return false;
      });
  } catch (error) {
    console.error(`Failed to register dynamic route ${route}:`, error);
    return false;
  }
};

/**
 * Register all known dynamic routes
 * 
 * This function prefetches and registers all dynamic routes in the application
 * to prevent issues with routes not being recognized.
 */
export const registerAllDynamicRoutes = () => {
  console.log('Registering all dynamic routes');
  
  // List of all dynamic routes and their parameter names
  const routes = [
    { route: '/task/[id]', param: 'id', testValue: 'test-task-id' },
    { route: '/test/[testId]', param: 'testId', testValue: 'test-route-id' },
    { route: '/debug/[debugId]', param: 'debugId', testValue: 'debug-route-id' }
  ];
  
  // Register each route
  const promises = routes.map(({ route, param, testValue }) => 
    registerDynamicRoute(route, param, testValue)
  );
  
  return Promise.all(promises)
    .then(() => {
      console.log('All dynamic routes registered successfully');
      return true;
    })
    .catch(err => {
      console.error('Error registering dynamic routes:', err);
      return false;
    });
};

/**
 * Force the router to recognize a specific path before navigation
 * 
 * This function should be called before navigating to a dynamic route
 * to ensure the router has the route properly registered.
 */
export const prepareForDynamicNavigation = (path: string) => {
  // Extract the route type and parameter value
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length >= 2) {
    const routeType = segments[0]; // e.g., 'task', 'test', 'debug'
    const paramValue = segments[1]; // The actual ID
    
    // Map route type to parameter name
    const paramMap: Record<string, string> = {
      task: 'id',
      test: 'testId',
      debug: 'debugId'
    };
    
    const paramName = paramMap[routeType];
    
    if (paramName) {
      const routePath = `/${routeType}/[${paramName}]`;
      return registerDynamicRoute(routePath, paramName, paramValue);
    }
  }
  
  return Promise.resolve(false);
};

/**
 * Safe navigation to dynamic routes
 * 
 * A wrapper around router.push that ensures dynamic routes are properly registered
 * before attempting navigation.
 */
export const safeRouterPush = (path: string, options = {}) => {
  return prepareForDynamicNavigation(path)
    .then(() => {
      console.log(`Safe navigation to: ${path}`);
      return Router.push(path, undefined, options);
    })
    .catch(err => {
      console.error(`Error during safe navigation to ${path}:`, err);
      // Fall back to standard navigation
      return Router.push(path, undefined, options);
    });
};