# Next.js Routing Implementation Plan for Tasks App

This document provides a detailed implementation plan to fix routing issues in the Tasks App. It includes code examples, file modifications, and a step-by-step approach to improve navigation, data fetching, and state management.

## Implementation Overview

We'll implement proper Next.js routing in three phases:

1. **Fix Navigation Methods** - Replace direct browser navigation with Next.js primitives
2. **Implement Data Fetching** - Add server-side rendering and proper data fetching
3. **Clean Up & Optimize** - Refactor for consistency and performance

## Phase 1: Fix Navigation Methods

### Step 1: Update Task List Navigation

#### File: `/src/pages/tasks.tsx`

Current problematic code:
```jsx
// Using direct browser navigation - problematic
const openTaskDetail = (taskId: string, task?: Task) => {
  if (task) {
    localStorage.setItem(`task_cache_${taskId}`, JSON.stringify(task));
  }
  window.location.href = `/task-detail?id=${taskId}`;
};
```

Fix with Next.js router:
```jsx
import { useRouter } from 'next/router';

// At component level
const router = useRouter();

// Replace with Next.js navigation
const openTaskDetail = (taskId: string) => {
  router.push(`/task/${taskId}`);
};
```

### Step 2: Update Task Component Click Handlers

For the `CompactTaskItem` component:

```jsx
// Replace this:
<div 
  className="flex-grow font-medium truncate cursor-pointer" 
  onClick={() => openTaskDetail(task.id, task)}
  title="Open task details"
>
  {task.title}
</div>

// With this:
<div 
  className="flex-grow font-medium truncate cursor-pointer" 
  onClick={() => openTaskDetail(task.id)}
  title="Open task details"
>
  {task.title}
</div>
```

### Step 3: Create Compatibility Redirects

Create a new file to handle legacy URLs:

#### File: `/src/pages/task-detail.tsx`

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

## Phase 2: Implement Proper Data Fetching

### Step 1: Add Server-Side Rendering for Task Detail Page

#### File: `/src/pages/task/[id].tsx`

Add SSR data fetching:

```jsx
import { GetServerSideProps } from 'next';
import { getTask } from '@/services/taskApiService';

// Add this function to enable server-side rendering
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  try {
    const task = await getTask(id);
    
    if (!task) {
      return {
        props: {
          initialTask: null,
          error: 'Task not found'
        }
      };
    }
    
    return {
      props: {
        initialTask: task,
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    return {
      props: {
        initialTask: null,
        error: 'Failed to load task. Please try again later.'
      }
    };
  }
};
```

### Step 2: Update Task Detail Component

```jsx
// Update the SingleTaskPage component
interface TaskDetailProps {
  initialTask: Task | null;
  error: string | null;
}

export default function SingleTaskPage({ initialTask, error: initialError }: TaskDetailProps) {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState<Task | null>(initialTask);
  const [loading, setLoading] = useState(!initialTask);
  const [error, setError] = useState<string | null>(initialError);
  
  useEffect(() => {
    // Only fetch if we don't have initial data and have an ID
    if (!initialTask && id) {
      const taskId = Array.isArray(id) ? id[0] : id;
      
      setLoading(true);
      getTask(taskId)
        .then(taskData => {
          if (taskData) {
            setTask(taskData);
          } else {
            setError('Task not found');
          }
        })
        .catch(err => {
          console.error('Error fetching task:', err);
          setError('Failed to load task. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, initialTask]);
  
  // Rest of component remains the same...
}
```

### Step 3: Remove LocalStorage Caching

1. Delete all localStorage related code from `task/[id].tsx`
2. Remove localStorage setting in the `openTaskDetail` function

## Phase 3: Implement SWR for Client-Side Data Fetching

### Step 1: Add SWR for Data Fetching

First, install SWR:

```bash
npm install swr
```

### Step 2: Create Task Fetching Hook

#### File: `/src/hooks/useFetchTask.ts`

```tsx
import useSWR from 'swr';
import { Task } from '@/types';
import { getTask } from '@/services/taskApiService';

// Custom fetcher for task data
const taskFetcher = async (id: string): Promise<Task> => {
  const data = await getTask(id);
  if (!data) {
    throw new Error('Task not found');
  }
  return data;
};

export function useFetchTask(id: string | undefined, initialData?: Task) {
  const { data, error, mutate } = useSWR(
    id ? [`task`, id] : null,
    () => id ? taskFetcher(id) : null,
    { 
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnMount: !initialData
    }
  );

  return {
    task: data,
    isLoading: !error && !data,
    isError: !!error,
    error: error?.message || null,
    mutate
  };
}
```

### Step 3: Update Task Detail Page to Use SWR

#### File: `/src/pages/task/[id].tsx`

```tsx
import { useFetchTask } from '@/hooks/useFetchTask';

export default function SingleTaskPage({ initialTask, error: initialError }: TaskDetailProps) {
  const router = useRouter();
  const { id } = router.query;
  const taskId = Array.isArray(id) ? id[0] : id;
  
  const { 
    task, 
    isLoading, 
    isError, 
    error 
  } = useFetchTask(taskId, initialTask);
  
  // Rest of component using task data...
}
```

## Phase 4: Clean Up and Optimize

### Step 1: Implement Optimistic UI Updates

For task status changes, implement optimistic updates:

```tsx
// In task list or detail component
const updateTaskStatus = async (taskId: string, newStatus: string) => {
  // Get current task data
  const currentTask = tasks.find(t => t.id === taskId);
  
  // Optimistically update UI
  mutate(
    // Update local data immediately
    tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
    // Options
    { revalidate: false }
  );
  
  try {
    // Send API request
    await apiUpdateTaskStatus(taskId, newStatus);
    // Revalidate data after successful update
    mutate();
  } catch (error) {
    // If error, revert to original data
    console.error('Failed to update task status:', error);
    mutate(tasks, { revalidate: false });
    // Show error notification
    showErrorToast('Failed to update task status');
  }
};
```

### Step 2: Implement Link Prefetching for Common Paths

Add prefetching for tasks that are likely to be clicked:

```jsx
// For items in task list
<Link href={`/task/${task.id}`} prefetch={true}>
  <a className="task-title">{task.title}</a>
</Link>
```

### Step 3: Add Loading Indicators

Create a consistent loading experience:

```jsx
// Create a LoadingIndicator component
const LoadingIndicator = () => (
  <div className="w-full h-1 bg-blue-500 animate-pulse fixed top-0 left-0 z-50"></div>
);

// Add Router events for global loading state
useEffect(() => {
  const handleStart = () => setIsLoading(true);
  const handleComplete = () => setIsLoading(false);

  router.events.on('routeChangeStart', handleStart);
  router.events.on('routeChangeComplete', handleComplete);
  router.events.on('routeChangeError', handleComplete);

  return () => {
    router.events.off('routeChangeStart', handleStart);
    router.events.off('routeChangeComplete', handleComplete);
    router.events.off('routeChangeError', handleComplete);
  };
}, [router]);
```

## Comprehensive Changes by File

### `/src/pages/tasks.tsx`

1. Import useRouter and add router instance
2. Remove localStorage caching in openTaskDetail
3. Replace window.location with router.push
4. Update click handlers to use new navigation
5. Add link prefetching for important tasks

### `/src/pages/task/[id].tsx`

1. Add getServerSideProps for SSR
2. Remove localStorage caching code
3. Update props interface to accept initialTask
4. Implement SWR for client-side data fetching
5. Add optimistic UI updates for task actions

### New file: `/src/pages/task-detail.tsx`

1. Create redirect component for backwards compatibility

### New file: `/src/hooks/useFetchTask.ts`

1. Create SWR hook for task data

### New file: `/src/components/LoadingIndicator.tsx`

1. Create consistent loading component

## Testing Plan

1. **Navigation Tests:**
   - Verify navigation from task list to detail preserves state
   - Confirm back button works correctly
   - Test task-detail legacy URL redirects correctly

2. **Data Fetching Tests:**
   - Verify SSR works by disabling JavaScript
   - Test that task detail loads with SSR data
   - Confirm client-side navigation fetches data correctly

3. **Performance Tests:**
   - Measure and compare page load times
   - Verify no full page reloads during navigation
   - Confirm state is preserved during navigation

## Conclusion

This implementation plan provides a comprehensive approach to fixing routing issues in the Tasks App. By following these steps, we'll create a more performant, reliable, and maintainable routing system that adheres to Next.js best practices.