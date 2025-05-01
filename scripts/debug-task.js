// Script to debug a task by directly accessing the API
const axios = require('axios');
const fs = require('fs');
const taskId = process.argv[2]; // Get the task ID from command line args

if (!taskId) {
  console.error('Please provide a task ID as a command line argument');
  process.exit(1);
}

const API_URL = 'http://localhost:3040/api/developer/tasks'; // API URL

// Sample markdown data
const exampleMarkdown = `# Task Markdown Example - Modified

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

*This example was added to directly debug markdown rendering.*
`;

// Create a test file with the markdown content
fs.writeFileSync('debug-markdown.md', exampleMarkdown);
console.log('Created debug-markdown.md file with test content');

async function getTask() {
  try {
    // Add API key for developer tasks
    const headers = {
      'x-api-key': 'dev-api-key',
      'Content-Type': 'application/json'
    };
    
    const response = await axios.get(`${API_URL}/${taskId}`, { headers });
    
    // Check only the data property for markdown
    if (response.data && response.data.data) {
      console.log('Task Data Found');
      
      // Specifically check for markdown
      console.log('\nMarkdown field:', response.data.data.markdown ? 'PRESENT' : 'MISSING');
      if (response.data.data.markdown) {
        console.log('\nMarkdown content (first 100 chars):');
        console.log(response.data.data.markdown.substring(0, 100) + '...');
      }

      // Update the task with new markdown content
      console.log('\nUpdating task with new markdown content...');
      try {
        const updateResponse = await axios.put(
          `${API_URL}/${taskId}`,
          { markdown: exampleMarkdown },
          { headers }
        );
        
        console.log('✅ Task updated successfully');
        console.log(`View task at: http://localhost:3020/task/${taskId}`);
      } catch (updateError) {
        console.error('Error updating task:', updateError.message);
      }
    } else {
      console.log('Response data structure is not as expected:', response.data);
    }
    
  } catch (error) {
    console.error('Error getting task:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
  }
}

getTask();