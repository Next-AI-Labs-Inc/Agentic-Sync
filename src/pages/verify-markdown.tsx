import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TaskMarkdown from '@/components/TaskCard/TaskMarkdown';
import { getTask } from '@/services/taskApiService';

/**
 * Test page to verify markdown rendering capabilities
 */
export default function VerifyMarkdownPage() {
  const router = useRouter();
  const { taskId } = router.query;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (taskId && typeof taskId === 'string') {
      setLoading(true);
      getTask(taskId)
        .then(taskData => {
          if (taskData) {
            const normalizedTask = {
              ...taskData,
              id: taskData._id || taskData.id
            };
            setTask(normalizedTask);
            
            // No redirect needed, just use the task data
          } else {
            setError('Task not found');
          }
        })
        .catch(err => {
          console.error('Error fetching task:', err);
          setError('Failed to load task');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [taskId, router]);
  
  // Sample task with markdown content (used if no taskId is provided)
  const sampleTask = {
    id: 'sample-task',
    project: 'tasks',
    markdown: `# Markdown Rendering Test

## Headers

# H1
## H2
### H3
#### H4
##### H5
###### H6

## Emphasis

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
  * Item 2a
  * Item 2b

### Ordered

1. Item 1
2. Item 2
3. Item 3
   1. Item 3a
   2. Item 3b

## Links

[Link to Example](https://example.com)

## Images

![Example image](https://via.placeholder.com/150)

## Blockquotes

> Blockquotes are very handy to emphasize information.
> This line is part of the same quote.

## Code

Inline \`code\` has \`back-ticks around\` it.

\`\`\`javascript
function example() {
  console.log("Hello world!");
}
\`\`\`

## Tables

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`
  };

  // Mock function for updating
  const handleUpdate = async (taskId: string, project: string, updates: any) => {
    console.log('Update task:', taskId, project, updates);
    alert(`Would update task ${taskId} with new markdown content`);
  };

  // Determine which task to use
  const displayTask = task || sampleTask;
  
  return (
    <>
      <Head>
        <title>{task ? `Markdown: ${task.title}` : 'Markdown Rendering Test'}</title>
      </Head>

      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link href="/tasks" className="text-primary-600 hover:underline">
            &larr; Back to Tasks
          </Link>
          {task && (
            <span className="mx-2">|</span>
          )}
          {task && (
            <Link href={`/task/${task.id}`} className="text-primary-600 hover:underline">
              View Task Details
            </Link>
          )}
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">
            {task ? task.title : 'Markdown Rendering Test'}
          </h1>
          <p className="text-gray-600 mb-4">
            {task 
              ? `Viewing markdown content for task #${task.id}`
              : 'This page tests the rendering of markdown content in the TaskMarkdown component.'}
          </p>
        </div>
        
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <TaskMarkdown 
              task={displayTask}
              onUpdateTask={handleUpdate}
              isExpanded={true}
            />
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Testing Notes</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All markdown elements should render correctly with proper styling</li>
            <li>The edit button should appear when hovering over the markdown content</li>
            <li>Clicking the edit button should show a textarea with the markdown source</li>
            <li>You should be able to edit the markdown and save changes</li>
          </ul>
        </div>
      </div>
    </>
  );
}