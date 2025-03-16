# Working with Initiatives API

This document provides comprehensive documentation for the Initiatives API, which manages strategic initiatives in the IX Tasks platform.

## API Endpoints

### Base URL

All API endpoints are relative to: `/api/initiatives`

### Authentication

Currently, the API does not require authentication for development purposes. In production environments, appropriate authentication would be implemented.

## Data Model

Initiatives represent strategic business objectives that can contain multiple tasks.

```typescript
interface Initiative {
  id: number;                // Numeric identifier
  name: string;              // Initiative name
  description: string;       // Detailed description 
  status: 'not-started' | 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;        // ISO date string
  targetDate?: string;       // ISO date string
  owner?: string;            // Owner name or identifier
  budget?: string;           // Budget information
  tags?: string[];           // Tags for categorization
  keyRisks?: string[];       // Known risks
  dependencies?: number[];   // IDs of initiatives this depends on
  linkedProjects?: string[]; // Names of linked projects
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  completedAt?: string | null; // ISO date string for completion date
  project?: string;          // Associated project identifier
}
```

## API Endpoints

### List Initiatives

`GET /api/initiatives`

Retrieves all initiatives with automatic deduplication.

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/initiatives
```

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "User Impact UI Enhancement",
    "description": "Improve UI to highlight user impact in task cards",
    "status": "in-progress",
    "priority": "high",
    "startDate": "2025-03-14",
    "targetDate": "2025-03-21",
    "createdAt": "2025-03-14T09:00:00Z",
    "updatedAt": "2025-03-14T14:30:00Z"
  },
  {
    "id": 2,
    "name": "Task Inline Editing System",
    "description": "Implement inline editing for all task fields",
    "status": "in-progress",
    "priority": "high",
    "startDate": "2025-03-13",
    "targetDate": "2025-03-25",
    "createdAt": "2025-03-13T09:00:00Z",
    "updatedAt": "2025-03-13T14:30:00Z"
  }
]
```

### Get Initiative by ID

`GET /api/initiatives/:id`

Retrieves a specific initiative by ID. The ID can be a numeric ID or MongoDB ObjectId.

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/initiatives/1
```

**Example Response:**

```json
{
  "id": 1,
  "name": "User Impact UI Enhancement",
  "description": "Improve UI to highlight user impact in task cards",
  "status": "in-progress",
  "priority": "high",
  "startDate": "2025-03-14",
  "targetDate": "2025-03-21",
  "createdAt": "2025-03-14T09:00:00Z",
  "updatedAt": "2025-03-14T14:30:00Z"
}
```

**Error Response (404):**

```json
{
  "error": "Initiative not found"
}
```

### Create Initiative

`POST /api/initiatives`

Creates a new initiative.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Initiative name |
| description | string | No | Detailed description |
| status | string | No | Current status (default: 'not-started') |
| priority | string | No | Priority level (default: 'medium') |
| startDate | string | No | ISO date when initiative starts |
| targetDate | string | No | ISO date for target completion |
| owner | string | No | Owner name or identifier |
| budget | string | No | Budget information |
| tags | string[] | No | Array of tags |
| keyRisks | string[] | No | Array of key risks |
| dependencies | number[] | No | Array of initiative IDs this depends on |
| linkedProjects | string[] | No | Array of linked project names |
| project | string | No | Project identifier (default: 'tasks') |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/initiatives \
  -H "Content-Type: application/json" \
  -d '{"name":"New Feature Implementation","description":"Implement the new feature XYZ to improve user experience","priority":"high"}'
```

**Example Response (201 Created):**

```json
{
  "id": 3,
  "name": "New Feature Implementation",
  "description": "Implement the new feature XYZ to improve user experience",
  "status": "not-started",
  "priority": "high",
  "tags": [],
  "keyRisks": [],
  "dependencies": [],
  "linkedProjects": [],
  "createdAt": "2025-03-15T10:15:30Z",
  "updatedAt": "2025-03-15T10:15:30Z",
  "completedAt": null,
  "project": "tasks"
}
```

**Error Response (409 Conflict):**

```json
{
  "error": "Initiative with this name already exists",
  "existing": { /* existing initiative data */ }
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Initiative name is required"
}
```

### Update Initiative

`PUT /api/initiatives/:id`

Updates an existing initiative. Only provided fields will be updated.

**Example Request:**

```bash
curl -X PUT http://localhost:3000/api/initiatives/3 \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress","priority":"medium"}'
```

**Example Response:**

```json
{
  "id": 3,
  "name": "New Feature Implementation",
  "description": "Implement the new feature XYZ to improve user experience",
  "status": "in-progress",
  "priority": "medium",
  "tags": [],
  "keyRisks": [],
  "dependencies": [],
  "linkedProjects": [],
  "createdAt": "2025-03-15T10:15:30Z",
  "updatedAt": "2025-03-15T10:30:45Z",
  "completedAt": null,
  "project": "tasks"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Initiative not found"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Cannot change initiative ID"
}
```

### Delete Initiative

`DELETE /api/initiatives/:id`

Deletes an initiative by ID.

**Example Request:**

```bash
curl -X DELETE http://localhost:3000/api/initiatives/3
```

**Example Response:**

```json
{
  "message": "Initiative deleted successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Initiative not found"
}
```

## Special Features

### Automatic Status Completion

When updating an initiative to `completed` status, the API automatically sets the `completedAt` timestamp if not provided.

### Deduplication

The GET endpoint automatically deduplicates initiatives based on:

1. ID-based deduplication: Removes duplicate entries with the same ID
2. Name+Project deduplication: For initiatives with the same name and project, keeps only the most recently updated version

## Usage in Code

### API Service Integration

The initiatives can be consumed using the taskApiService:

```typescript
import * as taskApiService from '@/services/taskApiService';

// Get all initiatives
const initiatives = await taskApiService.getInitiatives();

// Create a new initiative
const newInitiative = await taskApiService.createInitiative({
  name: 'My New Initiative',
  description: 'Description of the initiative',
  priority: 'high'
});

// Update an initiative
await taskApiService.updateInitiative(id, { status: 'in-progress' });

// Delete an initiative
await taskApiService.deleteInitiative(id);
```

### React Integration with Context

Use the InitiativeContext for frontend integration:

```typescript
import { useInitiatives } from '@/contexts/InitiativeContext';

function MyComponent() {
  const { 
    initiatives,
    filteredInitiatives,
    loading,
    error,
    refreshInitiatives,
    createInitiative,
    updateInitiative,
    deleteInitiative,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    statusFilter,
    setStatusFilter
  } = useInitiatives();

  // Use these functions and data in your component
}
```

## Integration with Task System

Initiatives can be associated with tasks through the `initiative` field in the Task interface. When viewing tasks, they can be grouped by initiative to show progress toward strategic objectives.

## Best Practices for API Consumers

1. **Handle Errors**: Always handle potential API errors gracefully
2. **Initiative Naming**: Use descriptive, user-focused names that reflect business outcomes
3. **Optimistic Updates**: Implement optimistic UI updates for a better user experience
4. **Regular Refresh**: Periodically refresh initiative data to ensure consistency
5. **Field Validation**: Validate fields client-side before sending to the API

## Example: AI Agent Integration

AI agents can consume this API to track strategic initiatives and related tasks:

```javascript
async function createStrategicInitiative(name, description, priority) {
  const initiativeData = {
    name,
    description,
    priority,
    tags: ['ai-generated'],
    project: 'tasks'
  };
  
  try {
    // Create the initiative
    const initiative = await fetch('/api/initiatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initiativeData)
    }).then(res => res.json());
    
    return initiative;
  } catch (error) {
    console.error('Error creating initiative:', error);
    throw error;
  }
}

// Usage example
const initiative = await createStrategicInitiative(
  'User Experience Enhancement', 
  'Improve the overall user experience by addressing UI/UX issues', 
  'high'
);
```

## Future Enhancements

1. Authentication and authorization for secure API access
2. Pagination for large initiative collections
3. Advanced filtering options
4. Webhooks for initiative status changes
5. Analytics and reporting capabilities