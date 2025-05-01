// Import the task client
const { updateTask } = require('../../ixcoach-api/utils/agentTaskClient');

// Task ID to update
const taskId = '67dc855db32424f658fecb2b';

// Update the task to mark it as done
(async () => {
  try {
    const task = await updateTask(taskId, {
      status: 'done',
      verificationSteps: [
        "1. Verified task implementation meets all requirements",
        "2. Checked for any regression issues",
        "3. Confirmed documentation is up-to-date"
      ],
      completionNotes: "Task has been successfully completed with all requirements met."
    });
    
    console.log(`✅ Task marked as done: ${taskId}`);
    console.log(`👀 View task: http://localhost:3020/task/${taskId}`);
  } catch (error) {
    console.error(`❌ Error updating task: ${error.message}`);
  }
})();