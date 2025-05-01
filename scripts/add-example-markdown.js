// Script to add example markdown content to a task
const axios = require('axios');
const taskId = process.argv[2]; // Get the task ID from command line args

if (!taskId) {
  console.error('Please provide a task ID as a command line argument');
  process.exit(1);
}

const API_URL = 'http://localhost:3040/api/developer/tasks'; // API URL - use correct port & path for developer tasks

const exampleMarkdown = `# Task Markdown Example

This is an example of rich markdown content for a task. This feature allows for detailed documentation with formatting.

## Features

* **Bold text** for emphasis
* *Italic text* for subtle emphasis
* Lists for organization
* Code blocks for technical details

## Code Example

\`\`\`javascript
// Example code
function processTask(taskId) {
  return fetchTask(taskId)
    .then(task => {
      console.log(\`Processing task: \${task.title}\`);
      return task;
    });
}
\`\`\`

## Implementation Details

The markdown field can be used to:

1. Document implementation steps
2. Provide technical context
3. Show examples and use cases
4. Include diagrams or visual explanations

> This feature enhances the ability to document tasks with rich formatting.

---

*This example was added automatically to demonstrate markdown rendering.*
`;

async function updateTask() {
  try {
    // Add API key for developer tasks
    const headers = {
      'x-api-key': 'dev-api-key',
      'Content-Type': 'application/json'
    };
    
    const response = await axios.put(`${API_URL}/${taskId}`, {
      markdown: exampleMarkdown
    }, { headers });
    
    console.log(`✅ Task updated: ${taskId}`);
    console.log('Task updated with example markdown content');
    console.log(`View updated task: http://localhost:3020/task/${taskId}`);
    console.log('Update complete');
  } catch (error) {
    console.error('Error updating task:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

updateTask();