import { sortByNewestFirst, sortTasks, deduplicateTasks } from '../taskSorter';
import { Task } from '@/types';
import { SORT_OPTIONS, SORT_DIRECTIONS } from '@/config/constants';

const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Task 1',
    description: 'Task 1 description',
    status: 'todo',
    priority: 'medium',
    project: 'project1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'task2',
    title: 'Task 2',
    description: 'Task 2 description',
    status: 'in-progress',
    priority: 'high',
    project: 'project1',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'task3',
    title: 'Task 3',
    description: 'Task 3 description',
    status: 'done',
    priority: 'low',
    project: 'project2',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  }
];

describe('taskSorter utility', () => {
  describe('sortByNewestFirst', () => {
    test('sorts tasks by creation date with newest first', () => {
      const sorted = sortByNewestFirst(mockTasks);
      expect(sorted[0].id).toBe('task3'); // 2025-01-10
      expect(sorted[1].id).toBe('task2'); // 2025-01-05
      expect(sorted[2].id).toBe('task1'); // 2025-01-01
    });

    test('returns empty array for empty input', () => {
      const sorted = sortByNewestFirst([]);
      expect(sorted).toEqual([]);
    });

    test('does not modify the original array', () => {
      const original = [...mockTasks];
      sortByNewestFirst(mockTasks);
      expect(mockTasks).toEqual(original);
    });
  });

  describe('sortTasks', () => {
    test('sorts by creation date (desc) by default', () => {
      const sorted = sortTasks(mockTasks);
      expect(sorted[0].id).toBe('task3'); // 2025-01-10
      expect(sorted[1].id).toBe('task2'); // 2025-01-05
      expect(sorted[2].id).toBe('task1'); // 2025-01-01
    });

    test('sorts by creation date ascending', () => {
      const sorted = sortTasks(mockTasks, SORT_OPTIONS.CREATED, SORT_DIRECTIONS.ASC);
      expect(sorted[0].id).toBe('task1'); // 2025-01-01
      expect(sorted[1].id).toBe('task2'); // 2025-01-05
      expect(sorted[2].id).toBe('task3'); // 2025-01-10
    });

    test('sorts by update date descending', () => {
      const sorted = sortTasks(mockTasks, SORT_OPTIONS.UPDATED, SORT_DIRECTIONS.DESC);
      expect(sorted[0].id).toBe('task3'); // 2025-01-20
      expect(sorted[1].id).toBe('task1'); // 2025-01-10
      expect(sorted[2].id).toBe('task2'); // 2025-01-05
    });

    test('sorts by priority descending', () => {
      const sorted = sortTasks(mockTasks, SORT_OPTIONS.PRIORITY, SORT_DIRECTIONS.DESC);
      expect(sorted[0].id).toBe('task2'); // high
      expect(sorted[1].id).toBe('task1'); // medium
      expect(sorted[2].id).toBe('task3'); // low
    });

    test('sorts by status', () => {
      const sorted = sortTasks(mockTasks, SORT_OPTIONS.STATUS, SORT_DIRECTIONS.ASC);
      expect(sorted[0].id).toBe('task1'); // todo
      expect(sorted[1].id).toBe('task2'); // in-progress
      expect(sorted[2].id).toBe('task3'); // done
    });

    test('returns empty array for empty input', () => {
      const sorted = sortTasks([]);
      expect(sorted).toEqual([]);
    });
  });

  describe('deduplicateTasks', () => {
    test('removes duplicate tasks based on ID', () => {
      const tasksWithDuplicates = [
        ...mockTasks,
        {
          ...mockTasks[0],
          title: 'Updated Task 1',
          updatedAt: '2025-01-15T00:00:00Z'
        }
      ];

      const deduplicated = deduplicateTasks(tasksWithDuplicates);
      
      // Should have 3 tasks after deduplication
      expect(deduplicated.length).toBe(3);
      
      // Should keep the newer version of the duplicate
      const task1 = deduplicated.find(t => t.id === 'task1');
      expect(task1?.title).toBe('Updated Task 1');
      expect(task1?.updatedAt).toBe('2025-01-15T00:00:00Z');
    });

    test('returns empty array for empty input', () => {
      const deduplicated = deduplicateTasks([]);
      expect(deduplicated).toEqual([]);
    });

    test('keeps original tasks when no duplicates exist', () => {
      const deduplicated = deduplicateTasks(mockTasks);
      expect(deduplicated).toEqual(mockTasks);
    });
  });
});