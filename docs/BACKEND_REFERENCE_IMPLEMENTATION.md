# Backend Reference Implementation

This document contains the reference implementation files needed to set up a compatible backend for IX Tasks.

## Quick Setup Guide

1. **Set up MongoDB database** with collections: `tasks`, `initiatives`
2. **Copy the API files** below to your backend project
3. **Configure environment variables**:
   ```bash
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=ix-tasks
   ```
4. **Install dependencies**: `mongodb`, `uuid`
5. **Start your API server** on port 3002 (or configure frontend accordingly)

## API Files to Copy

### 1. Tasks API Endpoint
Create: `/api/developer/tasks/index.js`

```javascript
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'ix-tasks';

async function getClient() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  let client;
  
  try {
    client = await getClient();
    const db = client.db(DB_NAME);
    const collection = db.collection('tasks');
    
    if (req.method === 'GET') {
      const tasks = await collection.find({}).toArray();
      res.status(200).json({ data: tasks, count: tasks.length });
    } 
    else if (req.method === 'POST') {
      const taskData = req.body;
      
      const formattedTask = {
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await collection.insertOne(formattedTask);
      const insertedTask = await collection.findOne({ _id: result.insertedId });
      
      res.status(201).json({ data: insertedTask, message: 'Task created successfully' });
    }
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
```

### 2. Individual Task Operations
Create: `/api/developer/tasks/[id].js`

```javascript
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'ix-tasks';

async function getClient() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  const { id } = req.query;
  let client;
  
  try {
    client = await getClient();
    const db = client.db(DB_NAME);
    const collection = db.collection('tasks');
    
    const query = { _id: new ObjectId(id) };
    
    if (req.method === 'GET') {
      const task = await collection.findOne(query);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ data: task });
    } 
    else if (req.method === 'PUT') {
      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      const result = await collection.findOneAndUpdate(
        query,
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      return res.status(200).json({ data: result.value, message: 'Task updated successfully' });
    } 
    else if (req.method === 'DELETE') {
      const result = await collection.findOneAndDelete(query);
      if (!result.value) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ message: 'Task deleted successfully' });
    } 
    else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
```

### 3. MongoDB Schema Reference

```javascript
// Task Schema (MongoDB collection: tasks)
{
  _id: ObjectId,
  title: String,             // Required
  description: String,
  userImpact: String,
  requirements: String,
  technicalPlan: String,
  status: String,            // One of the GTD statuses
  priority: String,          // 'high', 'medium', 'low'
  project: String,
  initiative: String,
  tags: [String],
  verificationSteps: [String],
  files: [String],
  dependencies: [String],
  nextSteps: [String],
  author: String,
  createdAt: Date,
  updatedAt: Date,
  markdown: String
}

// Initiative Schema (MongoDB collection: initiatives)
{
  _id: ObjectId,
  id: Number,               // Auto-generated numeric ID
  name: String,             // Required
  description: String,
  status: String,           // 'not-started', 'planning', 'active', 'completed', 'archived'
  priority: String,         // 'high', 'medium', 'low'
  startDate: String,        // ISO date
  targetDate: String,       // ISO date
  owner: String,
  budget: Number,
  tags: [String],
  keyRisks: [String],
  dependencies: [String],
  linkedProjects: [String],
  linkedKpis: [String],
  createdAt: String,        // ISO date
  updatedAt: String,        // ISO date
  completedAt: String,      // ISO date
  project: String
}
```

## Quick Docker Setup (Optional)

If you want to test with Docker:

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: ix-tasks
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Environment Variables Template

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ix-tasks
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Notes for Implementers

- The frontend expects specific response formats (see README Backend Integration section)
- API endpoints should support CORS for frontend development
- Authentication is optional - the system works without it
- The task client shows how external systems can integrate programmatically