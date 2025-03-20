import { calculateStatusCounts, getRecentCompletedThreshold } from '../taskStats';
import { Task } from '@/types';
import { TASK_STATUSES } from '@/constants/taskStatus';

const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Task 1',
    description: 'First task',
    status: 'todo',
    priority: 'medium',
    project: 'project1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'task2',
    title: 'Task 2',
    description: 'Second task',
    status: 'in-progress',
    priority: 'high',
    project: 'project1',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'task3',
    title: 'Task 3',
    description: 'Third task',
    status: 'done',
    priority: 'low',
    project: 'project2',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'task4',
    title: 'Task 4',
    description: 'Fourth task',
    status: 'todo',
    priority: 'medium',
    project: 'project2',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'task5',
    title: 'Task 5',
    description: 'Fifth task',
    status: 'backlog',
    priority: 'low',
    project: 'project3',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  }
];

describe('taskStats utilities', () => {
  describe('calculateStatusCounts', () => {
    test('calculates counts for all task statuses correctly', () => {
      const counts = calculateStatusCounts(mockTasks);
      
      // Check all possible statuses are included
      Object.values(TASK_STATUSES)
        .filter(status => !['all', 'pending', 'recent-completed', 'source-tasks', 'engaged', 'review', 'completions', 'today'].includes(status))
        .forEach(status => {
          expect(counts).toHaveProperty(status);
        });
      
      // Check the actual counts
      expect(counts.todo).toBe(2);
      expect(counts['in-progress']).toBe(1);
      expect(counts.done).toBe(1);
      expect(counts.backlog).toBe(1);
      expect(counts.proposed).toBe(0);
      expect(counts.reviewed).toBe(0);
      expect(counts.archived).toBe(0);
    });

    test('returns all statuses with zero counts for empty input', () => {
      const counts = calculateStatusCounts([]);
      
      Object.values(TASK_STATUSES)
        .filter(status => !['all', 'pending', 'recent-completed', 'source-tasks', 'engaged', 'review', 'completions', 'today'].includes(status))
        .forEach(status => {
          expect(counts).toHaveProperty(status, 0);
        });
    });
  });

  describe('getRecentCompletedThreshold', () => {
    test('returns date 2 days ago by default', () => {
      // Mock Date.now() to return a fixed date
      const realDate = Date;
      const mockDate = new Date('2025-01-15T12:00:00Z');
      global.Date = class extends Date {
        constructor(date) {
          super(date);
          if (!date) {
            return mockDate;
          }
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      // Calculate the expected threshold (2 days before mock date)
      const expectedDate = new Date(mockDate);
      expectedDate.setDate(expectedDate.getDate() - 2);
      const expectedThreshold = expectedDate.getTime();

      // Call the function and verify the result
      const threshold = getRecentCompletedThreshold();
      expect(threshold).toBe(expectedThreshold);

      // Restore the real Date
      global.Date = realDate;
    });

    test('respects custom days threshold', () => {
      // Mock Date.now() to return a fixed date
      const realDate = Date;
      const mockDate = new Date('2025-01-15T12:00:00Z');
      global.Date = class extends Date {
        constructor(date) {
          super(date);
          if (!date) {
            return mockDate;
          }
        }
        static now() {
          return mockDate.getTime();
        }
      } as any;

      // Calculate the expected threshold (5 days before mock date)
      const expectedDate = new Date(mockDate);
      expectedDate.setDate(expectedDate.getDate() - 5);
      const expectedThreshold = expectedDate.getTime();

      // Call the function with custom days and verify the result
      const threshold = getRecentCompletedThreshold(5);
      expect(threshold).toBe(expectedThreshold);

      // Restore the real Date
      global.Date = realDate;
    });
  });
});