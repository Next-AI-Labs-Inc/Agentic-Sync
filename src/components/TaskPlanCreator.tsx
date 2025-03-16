import React, { useEffect } from 'react';
import { useInitiatives } from '@/contexts/InitiativeContext';
import { useTasks } from '@/contexts/TaskContext';
import { TaskFormData } from '@/types';

export default function TaskPlanCreator() {
  const { createInitiative, initiatives } = useInitiatives();
  const { addTask } = useTasks();

  useEffect(() => {
    const createTaskPlan = async () => {
      // Create the UI enhancement initiative if it doesn't exist
      if (!initiatives.some(i => i.name === "UI/UX Improvements for Task System")) {
        const initiativeData = {
          name: "UI/UX Improvements for Task System",
          description: "Enhance the task management interface with improved card interaction, better loading states, and more intuitive filtering.",
          status: "in-progress" as const,
          priority: "high" as const,
          startDate: "2025-03-15",
          targetDate: "2025-03-20",
          tags: ["ui", "ux", "task-management"],
          keyRisks: ["Loading state transitions may cause UI flickering", "Card expansion might disrupt scrolling position"],
          linkedProjects: ["tasks"]
        };
        
        await createInitiative(initiativeData);
      }

      // Create the required tasks
      const initiativeName = "UI/UX Improvements for Task System";
      
      const tasks: TaskFormData[] = [
        {
          title: "Replace 'Show More' with Click-to-Expand on Task Cards",
          description: "Modify TaskCard component to expand when clicked instead of using a dedicated 'Show More' button. This creates a more intuitive user experience and reduces visual clutter.",
          priority: "high",
          project: "tasks",
          initiative: initiativeName,
          tags: "ui, interaction, task-card",
          verificationSteps: "1. Click on a task card\n2. Verify it expands to show details\n3. Click again and verify it collapses\n4. Verify the 'Show More/Less' button is removed",
          nextSteps: "Add visual indicator to show card is expandable"
        },
        {
          title: "Make All Cards Have Hover Effect",
          description: "Add hover effects to all card elements in the system including tasks, initiatives, and KPIs to provide visual feedback for interactive elements.",
          priority: "medium",
          project: "tasks",
          initiative: initiativeName,
          tags: "ui, interaction, visual-feedback",
          verificationSteps: "1. Hover over different cards\n2. Verify hover effect is consistent\n3. Test on different screen sizes",
          nextSteps: "Consider adding subtle animation for hover transitions"
        },
        {
          title: "Add Quick Actions to Non-Expanded Task Cards",
          description: "Add ability to mark tasks as tested or delete them directly from the main view without expanding, improving task management efficiency.",
          priority: "medium",
          project: "tasks",
          initiative: initiativeName,
          tags: "ui, interaction, task-management",
          verificationSteps: "1. Hover over a task card\n2. Verify quick action buttons appear\n3. Test marking a task as tested\n4. Test deleting a task",
          nextSteps: "Consider adding more quick action options"
        },
        {
          title: "Make Pending and Completed Tasks Clickable in Dashboard",
          description: "Enhance the dashboard by making the pending and completed task sections clickable to quickly filter the task view accordingly.",
          priority: "medium",
          project: "tasks",
          initiative: initiativeName,
          tags: "ui, navigation, dashboard",
          verificationSteps: "1. Go to dashboard\n2. Click on pending tasks count\n3. Verify it opens tasks view filtered to pending\n4. Click on completed tasks count\n5. Verify it opens tasks view filtered to completed",
          nextSteps: "Add visual feedback for clickable areas"
        },
        {
          title: "Fix Loading State Flash in All Views",
          description: "Eliminate disruptive UI flashes during loading states by implementing proper content replacement strategies and only rendering the differences.",
          priority: "high",
          project: "tasks",
          initiative: initiativeName,
          tags: "ui, performance, loading-states",
          verificationSteps: "1. Refresh the tasks view\n2. Verify content doesn't disappear during loading\n3. Check that only a small spinner appears in header\n4. Test with slow network connection",
          nextSteps: "Consider implementing skeleton loading states"
        },
        {
          title: "Add Description Display for All Initiatives",
          description: "Show initiative descriptions in all views unless explicitly undefined, improving information visibility and context awareness.",
          priority: "low",
          project: "tasks",
          initiative: initiativeName,
          tags: "ui, information-architecture",
          verificationSteps: "1. View initiatives list\n2. Verify descriptions are visible for all initiatives\n3. Create an initiative without a description\n4. Verify it doesn't show an empty space",
          nextSteps: "Add truncation for very long descriptions"
        }
      ];
      
      // Add each task with a small delay to avoid overwhelming the API
      for (const task of tasks) {
        try {
          await addTask(task);
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to create task: ${task.title}`, error);
        }
      }
    };
    
    createTaskPlan();
  }, [createInitiative, addTask, initiatives]);

  return null; // This component doesn't render anything
}