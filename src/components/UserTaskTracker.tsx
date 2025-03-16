import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useTaskTracker } from './TaskTracker';

interface TrackedTask {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed';
  timestamp: string;
}

export default function UserTaskTracker() {
  const { trackedTasks, updateTaskStatus } = useTaskTracker();
  const [isOpen, setIsOpen] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Initialize the system to automatically track new tasks
  useEffect(() => {
    // This could connect to a WebSocket or polling system
    // to receive real-time updates about task changes
    
    // For the demo, we'll just update the UI when the component mounts
  }, []);
  
  if (trackedTasks.length === 0) {
    return null; // Don't show anything if there are no tracked tasks
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Task tracker button */}
      <button
        className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
          {trackedTasks.length}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
      
      {/* Task tracker panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your Requested Tasks</h3>
            <button 
              className="text-gray-400 hover:text-gray-600" 
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {trackedTasks.map(task => (
              <div key={task.id} className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <span className={`badge ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {formatDate(task.timestamp)}
                  </span>
                  <Link href={`/tasks?task=${task.id}`} className="text-xs text-primary-600 hover:underline">
                    View Details
                  </Link>
                </div>
                
                {/* Task status buttons */}
                <div className="mt-2 flex justify-end space-x-2">
                  {task.status === 'proposed' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'todo')}
                      className="btn-outline-primary text-xs py-0.5 px-2"
                    >
                      Move to Todo
                    </button>
                  )}
                  {task.status === 'todo' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      className="btn-outline-primary text-xs py-0.5 px-2"
                    >
                      Start Progress
                    </button>
                  )}
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'done')}
                      className="btn-outline-primary text-xs py-0.5 px-2"
                    >
                      Mark Done
                    </button>
                  )}
                  {task.status === 'done' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'reviewed')}
                      className="btn-outline-primary text-xs py-0.5 px-2"
                    >
                      Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <Link 
              href="/tasks?filter=proposed" 
              className="text-sm text-primary-600 hover:underline block text-center"
              onClick={() => setIsOpen(false)}
            >
              View All Tasks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}