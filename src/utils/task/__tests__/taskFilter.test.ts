import { 
  createFilterPredicates, 
  filterTasksByStatus, 
  shouldIncludeTaskByProject,
  filterTasksBySearchTerm
} from '../taskFilter';
import { Task } from '@/types';
import { TASK_STATUSES } from '@/constants/taskStatus';

const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Task 1',
    description: 'First test task',
    status: 'todo',
    priority: 'medium',
    project: 'project1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
    tags: ['test', 'important']
  },
  {
    id: 'task2',
    title: 'Task 2',
    description: 'Second test task',
    status: 'in-progress',
    priority: 'high',
    project: 'project1',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    tags: ['test']
  },
  {
    id: 'task3',
    title: 'Task 3',
    description: 'Third test task with feature',
    status: 'done',
    priority: 'low',
    project: 'project2',
    completedAt: '2025-01-20T00:00:00Z',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
    tags: ['test', 'feature']
  },
  {
    id: 'task4',
    title: 'Task 4',
    description: 'Fourth test task with feature',
    status: 'reviewed',
    priority: 'medium',
    project: 'project2',
    completedAt: '2025-01-01T00:00:00Z', // Old completed task
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    tags: ['test', 'feature', 'old']
  },
  {
    id: 'task5',
    title: 'Task 5',
    description: 'Fifth task with no project',
    status: 'backlog',
    priority: 'low',
    project: '',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    tags: ['test', 'noproject']
  },
  {
    id: 'task6',
    title: 'Starred Task',
    description: 'A task marked as starred',
    status: 'todo',
    priority: 'high',
    project: 'project1',
    createdAt: '2025-01-16T00:00:00Z',
    updatedAt: '2025-01-16T00:00:00Z',
    tags: ['test'],
    starred: true
  },
];

describe('taskFilter utilities', () => {
  describe('createFilterPredicates', () => {
    // Set up date for testing recent completed
    const now = new Date('2025-01-21T00:00:00Z').getTime(); // Moved back to make task3 recent
    const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);
    const predicates = createFilterPredicates(twoDaysAgo);

    test('all predicate excludes done and reviewed tasks', () => {
      expect(mockTasks.filter(predicates.all).length).toBe(4);
      expect(mockTasks.filter(predicates.all).some(t => t.status === 'done')).toBe(false);
      expect(mockTasks.filter(predicates.all).some(t => t.status === 'reviewed')).toBe(false);
    });

    test('pending predicate excludes done and reviewed tasks', () => {
      expect(mockTasks.filter(predicates.pending).length).toBe(4);
      expect(mockTasks.filter(predicates.pending).some(t => t.status === 'done')).toBe(false);
      expect(mockTasks.filter(predicates.pending).some(t => t.status === 'reviewed')).toBe(false);
    });

    test('sourceTasks predicate only includes backlog and brainstorm tasks', () => {
      const filtered = mockTasks.filter(predicates.sourceTasks);
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('backlog');
    });

    test('recentCompleted predicate includes only recently completed tasks', () => {
      const filtered = mockTasks.filter(predicates.recentCompleted);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('task3');
    });

    test('today predicate only includes starred tasks', () => {
      const filtered = mockTasks.filter(predicates.today);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('task6');
    });

    test('byStatus predicate filters by specific status', () => {
      const todoFilter = predicates.byStatus('todo');
      const todoTasks = mockTasks.filter(todoFilter);
      expect(todoTasks.length).toBe(2);
      expect(todoTasks.every(t => t.status === 'todo')).toBe(true);
    });
  });

  describe('filterTasksByStatus', () => {
    // Set up date for testing recent completed
    const now = new Date('2025-01-22T00:00:00Z').getTime();
    const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);
    const predicates = createFilterPredicates(twoDaysAgo);

    test('filters by all status correctly', () => {
      const filtered = filterTasksByStatus(mockTasks, TASK_STATUSES.ALL, predicates);
      expect(filtered.length).toBe(4);
      expect(filtered.some(t => t.status === 'done')).toBe(false);
      expect(filtered.some(t => t.status === 'reviewed')).toBe(false);
    });

    test('filters by specific status correctly', () => {
      const filtered = filterTasksByStatus(mockTasks, 'todo', predicates);
      expect(filtered.length).toBe(2);
      expect(filtered.every(t => t.status === 'todo')).toBe(true);
    });

    test('filters by today correctly', () => {
      const filtered = filterTasksByStatus(mockTasks, TASK_STATUSES.TODAY, predicates);
      expect(filtered.length).toBe(1);
      expect(filtered[0].starred).toBe(true);
    });

    test('returns empty array for empty input', () => {
      const filtered = filterTasksByStatus([], TASK_STATUSES.ALL, predicates);
      expect(filtered).toEqual([]);
    });
  });

  describe('shouldIncludeTaskByProject', () => {
    test('includes task when project filter is "all"', () => {
      expect(shouldIncludeTaskByProject(mockTasks[0], 'all')).toBe(true);
    });

    test('includes task with empty project when filter is "none"', () => {
      expect(shouldIncludeTaskByProject(mockTasks[4], 'none')).toBe(true);
      expect(shouldIncludeTaskByProject(mockTasks[0], 'none')).toBe(false);
    });

    test('includes task when project matches string filter', () => {
      expect(shouldIncludeTaskByProject(mockTasks[0], 'project1')).toBe(true);
      expect(shouldIncludeTaskByProject(mockTasks[2], 'project1')).toBe(false);
    });

    test('includes task when project is in array filter', () => {
      expect(shouldIncludeTaskByProject(mockTasks[0], ['project1', 'project3'])).toBe(true);
      expect(shouldIncludeTaskByProject(mockTasks[2], ['project1', 'project2'])).toBe(true);
      expect(shouldIncludeTaskByProject(mockTasks[4], ['project1', 'project2'])).toBe(false);
    });
  });

  describe('filterTasksBySearchTerm', () => {
    test('returns all tasks when search term is empty', () => {
      expect(filterTasksBySearchTerm(mockTasks, '')).toEqual(mockTasks);
      expect(filterTasksBySearchTerm(mockTasks, '  ')).toEqual(mockTasks);
    });

    test('filters tasks by title', () => {
      const filtered = filterTasksBySearchTerm(mockTasks, 'Task 1');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('task1');
    });

    test('filters tasks by description', () => {
      const filtered = filterTasksBySearchTerm(mockTasks, 'feature');
      expect(filtered.length).toBe(2);
      expect(filtered.map(t => t.id).sort()).toEqual(['task3', 'task4']);
    });

    test('filters tasks by id', () => {
      const filtered = filterTasksBySearchTerm(mockTasks, 'task5');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('task5');
    });

    test('filters tasks by project', () => {
      const filtered = filterTasksBySearchTerm(mockTasks, 'project2');
      expect(filtered.length).toBe(2);
      expect(filtered.map(t => t.id).sort()).toEqual(['task3', 'task4']);
    });

    test('filters tasks by tags', () => {
      const filtered = filterTasksBySearchTerm(mockTasks, 'important');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('task1');
    });

    test('is case insensitive', () => {
      const filtered = filterTasksBySearchTerm(mockTasks, 'FEATURE');
      expect(filtered.length).toBe(2);
    });
  });
});