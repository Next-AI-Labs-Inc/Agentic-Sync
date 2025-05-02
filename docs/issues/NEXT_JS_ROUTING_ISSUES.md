# Next.js Routing Issues in Tasks App

## Executive Summary

The Tasks App currently implements a non-standard, inconsistent approach to Next.js routing that causes performance problems, breaks the SPA experience, and results in unnecessary full-page reloads. This document outlines the current issues, provides examples of correct implementation, and presents a detailed plan to fix these issues systematically.

## Current Issues

### 1. Inconsistent Navigation Methods

**Problem:** The app mixes different navigation methods:
- Direct browser navigation with `window.location.href`
- Next.js `Link` component 
- Next.js `router.push()`

**Impact:** This inconsistency creates a fragmented user experience, causes full page reloads that destroy React state, and adds significant performance overhead.

**Example in `/src/pages/tasks.tsx`:**
```jsx
// Direct browser navigation (problematic)
const openTaskDetail = (taskId: string, task?: Task) => {
  // Store task data in localStorage to avoid unnecessary API calls
  if (task) {
    localStorage.setItem(`task_cache_${taskId}`, JSON.stringify(task));
  }
  
  // Use the standard query parameter format
  window.location.href = `/task-detail?id=${taskId}`;
};
```

### 2. Improper State Management

**Problem:** The app uses localStorage as a workaround for state loss during navigation.

**Impact:** This creates a fragile state synchronization mechanism that:
- Is prone to errors and race conditions
- Creates unnecessary caching/cleanup logic
- Requires complex serialization/deserialization
- Adds code complexity and maintenance burden

**Example:**
```jsx
// In task/[id].tsx
useEffect(() => {
  // First check if we have cached task data
  const cachedTaskJson = localStorage.getItem(`task_cache_${taskId}`);
  
  if (cachedTaskJson) {
    try {
      // Try to parse the cached task data
      const cachedTask = JSON.parse(cachedTaskJson);
      
      // Check if the cached task has sufficient data
      if (cachedTask && cachedTask.id) {
        console.log('Using cached task data:', cachedTask);
        
        // Set the task from cache
        setTask(normalizedTask);
        // Clean up the cache after using it
        localStorage.removeItem(`task_cache_${taskId}`);
      }
    } catch (cacheError) {
      console.error('Error parsing cached task data:', cacheError);
    }
  }
}, [id]);
```

### 3. URL Structure Inconsistency

**Problem:** The app has inconsistent URL patterns:
- Task detail page uses query parameters (`/task-detail?id=123`) in some places
- Task detail page uses dynamic routes (`/task/[id]`) in others

**Impact:**
- Makes URLs less SEO-friendly and harder to bookmark
- Creates confusion in codebase and for developers
- Requires additional logic to handle both formats

### 4. Missing Next.js Data Patterns

**Problem:** The app doesn't utilize Next.js data fetching methods:
- No use of `getServerSideProps` or `getStaticProps`
- Unnecessary client-side data fetching for pre-renderable content

**Impact:**
- Slower initial page loads
- Poor SEO as content isn't available during server rendering
- Missed opportunities for optimization

## Correct Next.js Routing Approach

### 1. Consistent Navigation with Next.js Primitives

**Principles:**
- Always use Next.js navigation primitives 
- Never use direct DOM APIs like `window.location`
- Preserve application state during navigation

**Correct Implementation:**

```jsx
// For declarative navigation (in JSX):
<Link href={`/task/${taskId}`}>
  View Task
</Link>

// For programmatic navigation (in event handlers, etc.):
const router = useRouter();
const viewTask = (taskId) => {
  router.push(`/task/${taskId}`);
};
```

### 2. Optimized Data Fetching

**Principles:**
- Use server-side data fetching when possible
- Implement proper client-side data fetching with SWR/React Query
- Cache data appropriately at the app level

**Correct Implementation:**

```jsx
// In /pages/task/[id].tsx
export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const task = await getTask(id);
    return { props: { initialTask: task || null } };
  } catch (error) {
    console.error('Error fetching task:', error);
    return { props: { error: 'Failed to load task', initialTask: null } };
  }
}

function TaskPage({ initialTask, error }) {
  // Use SWR for real-time updates after initial load
  const { data: task, error: fetchError } = useSWR(
    `/api/tasks/${id}`,
    fetcher,
    { initialData: initialTask }
  );
  
  // Component code...
}
```

### 3. Consistent URL Structure

**Principles:**
- Use dynamic segments for resource identifiers
- Follow REST-like patterns for URLs
- Maintain consistent URL structure across the app

**Correct Structure:**

```
/tasks                 // Tasks list
/task/:id              // Task detail by ID
/api/tasks             // API endpoint for tasks
/api/tasks/:id         // API endpoint for individual task
```

### 4. State Management Best Practices

**Principles:**
- Store shared state in context providers
- Use React Query/SWR for server state management
- Avoid storing complex state in localStorage
- Leverage Next.js data fetching patterns

**Correct Implementation:**

```jsx
// In _app.tsx
function MyApp({ Component, pageProps }) {
  return (
    <TasksProvider>
      <Component {...pageProps} />
    </TasksProvider>
  );
}

// In task detail component
function TaskDetail() {
  const { id } = useRouter().query;
  const { task } = useTasks(id);
  
  // Component code using task data...
}
```

## Implementation Plan

### Phase 1: Create Consistent URL Structure

1. **Standardize on Dynamic Routes:**
   - Consolidate all task detail URLs to use `/task/[id]` pattern
   - Add proper redirects for any legacy URLs

2. **Fix Navigation Methods:**
   - Replace all `window.location.href` calls with Next.js `router.push()`
   - Update all direct links to use `<Link>` component
   - Create shared utility functions for common navigation patterns

### Phase 2: Implement Proper Data Fetching

1. **Add Server-Side Rendering:**
   - Implement `getServerSideProps` for all task detail pages
   - Ensure proper error handling and loading states

2. **Remove LocalStorage Caching:**
   - Eliminate task caching in localStorage
   - Implement proper state management using context or SWR/React Query

3. **Optimize Data Flow:**
   - Implement proper data fetching hooks
   - Use SWR or React Query for client-side data management

### Phase 3: Refine and Optimize

1. **Clean Up Legacy Code:**
   - Remove redundant state management
   - Clean up URL parameter handling
   - Ensure consistent patterns throughout the codebase

2. **Implement Advanced Patterns:**
   - Add prefetching for common navigation paths
   - Implement optimistic UI updates for actions
   - Add proper loading indicators

## Specific Files to Modify

### 1. `/src/pages/tasks.tsx`

```jsx
// REPLACE THIS:
const openTaskDetail = (taskId: string, task?: Task) => {
  if (task) {
    localStorage.setItem(`task_cache_${taskId}`, JSON.stringify(task));
  }
  window.location.href = `/task-detail?id=${taskId}`;
};

// WITH THIS:
const openTaskDetail = (taskId: string) => {
  router.push(`/task/${taskId}`);
};
```

### 2. `/src/pages/task/[id].tsx`

```jsx
// ADD SERVER-SIDE RENDERING:
export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const task = await getTask(id);
    return { 
      props: { 
        initialTask: task || null,
        error: task ? null : 'Task not found'
      } 
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    return { 
      props: { 
        error: 'Failed to load task', 
        initialTask: null 
      } 
    };
  }
}

// REMOVE ALL LOCALSTORAGE RELATED CODE:
// Delete the entire useEffect block that checks for cached task data
```

### 3. Add `/src/pages/task-detail.tsx` (for backwards compatibility)

```jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TaskDetailRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Redirect to the new URL pattern
      router.replace(`/task/${id}`);
    }
  }, [id, router]);

  return (
    <div className="p-8 text-center">
      <p>Redirecting to new task page...</p>
    </div>
  );
}
```

## Technical Implementation Guidelines

### Navigation Principles

1. **Always use Next.js navigation primitives:**
   - Use `<Link>` for user-clickable links
   - Use `router.push()` for programmatic navigation
   - Use `router.replace()` for redirects
   - Never manipulate browser history or location directly

2. **Preserve the SPA experience:**
   - Ensure navigation doesn't trigger full page reloads
   - Maintain scroll position appropriately
   - Keep UI responsive during navigation

### Data Fetching Patterns

1. **Server-side rendering for initial data:**
   - Use `getServerSideProps` for dynamic data
   - Use `getStaticProps` + `getStaticPaths` for static data
   - Properly handle loading and error states

2. **Client-side data fetching for updates:**
   - Use SWR or React Query for data fetching
   - Implement proper caching strategy
   - Add optimistic UI updates for actions

### State Management

1. **Global state:**
   - Use React Context for app-wide state
   - Ensure providers are at the appropriate level

2. **Server state:**
   - Use SWR/React Query for server data
   - Implement proper revalidation strategies

3. **Page/Component state:**
   - Use useState/useReducer for local component state
   - Leverage Next.js router for URL-driven state

## Conclusion

The current routing implementation in the Tasks App creates unnecessary complexity and performance issues. By adopting proper Next.js patterns, we can significantly improve the user experience, performance, and code maintainability.

This implementation plan provides a systematic approach to fixing the routing issues while ensuring backward compatibility and minimal disruption to users.