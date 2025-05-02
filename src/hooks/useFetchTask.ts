import useSWR from 'swr';
import { Task } from '@/types';
import { getTask } from '@/services/taskApiService';

/**
 * Custom fetcher for task data
 * @param id Task ID
 * @returns Task data
 */
const taskFetcher = async (id: string): Promise<Task> => {
  const data = await getTask(id);
  if (!data) {
    throw new Error('Task not found');
  }
  return data;
};

/**
 * Custom hook for fetching and caching task data using SWR
 * This provides:
 * - Automatic caching
 * - Revalidation on focus
 * - Seamless integration with SSR
 * - Consistent loading/error states
 * 
 * @param id Task ID to fetch
 * @param initialData Optional initial data from server-side rendering
 */
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

/**
 * Update task data optimistically
 * 
 * @param id Task ID
 * @param updateFn Function to apply the update
 * @param apiCall API call to perform the update on the server
 */
export function useOptimisticTaskUpdate() {
  const { mutate } = useSWR('tasks');
  
  const updateTaskOptimistically = async (
    taskId: string, 
    updateFn: (task: Task) => Task, 
    apiCall: () => Promise<any>
  ) => {
    // Get current task data
    const currentTask = await getTask(taskId);
    if (!currentTask) return;
    
    // Apply the update locally
    const updatedTask = updateFn(currentTask);
    
    // Update the SWR cache optimistically
    mutate(
      async () => {
        try {
          // Call the API to perform the update on the server
          await apiCall();
          // Return the updated task for the cache
          return updatedTask;
        } catch (error) {
          // If the API call fails, throw an error to revert the optimistic update
          console.error('Task update failed:', error);
          throw error;
        }
      },
      {
        optimisticData: updatedTask,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false
      }
    );
  };
  
  return { updateTaskOptimistically };
}