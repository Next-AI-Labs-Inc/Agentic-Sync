/**
 * API endpoint for managing task build documentation
 */
import { ObjectId } from 'mongodb';
import { connect } from '../../../lib/database';
import { getSession } from '../../../lib/auth';

// Connect to the database
const { db } = await connect();
const collection = db.collection('tasks');

export default async function handler(req, res) {
  // Get user session for authentication
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get task ID from query params
  const { id } = req.query;
  
  // Validate ID
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getDocumentation(id, req, res);
    case 'POST':
      return await addDocumentation(id, req, res, session);
    case 'PUT':
      return await updateDocumentation(id, req, res, session);
    case 'DELETE':
      return await deleteDocumentation(id, req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get build documentation for a task
 */
async function getDocumentation(taskId, req, res) {
  try {
    // Get task from database
    const task = await collection.findOne({ _id: new ObjectId(taskId) });
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Return the documentation array or empty array if none exists
    return res.status(200).json(task.buildDocumentation || []);
  } catch (error) {
    console.error('Error getting task documentation:', error);
    return res.status(500).json({ error: 'Failed to get documentation' });
  }
}

/**
 * Add new documentation to a task
 */
async function addDocumentation(taskId, req, res, session) {
  try {
    // Get documentation data from request body
    const { content, title, format = 'markdown' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Documentation content is required' });
    }
    
    // Create documentation object
    const documentationEntry = {
      id: new ObjectId().toString(), // Generate unique ID
      title: title || 'Build Documentation',
      content,
      format,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id || session.user.email
    };
    
    // Update task with new documentation
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { 
        $push: { buildDocumentation: documentationEntry },
        $set: { updatedAt: new Date().toISOString() }
      },
      { returnDocument: 'after' }
    );
    
    // Check if task was found and updated
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Return the added documentation
    return res.status(201).json(documentationEntry);
  } catch (error) {
    console.error('Error adding task documentation:', error);
    return res.status(500).json({ error: 'Failed to add documentation' });
  }
}

/**
 * Update existing documentation
 */
async function updateDocumentation(taskId, req, res, session) {
  try {
    // Get documentation data from request body
    const { id, content, title, format } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Documentation ID is required' });
    }
    
    // Create update object
    const updateData = {
      ...(content && { 'buildDocumentation.$.content': content }),
      ...(title && { 'buildDocumentation.$.title': title }),
      ...(format && { 'buildDocumentation.$.format': format }),
      'buildDocumentation.$.updatedAt': new Date().toISOString(),
      'buildDocumentation.$.updatedBy': session.user.id || session.user.email,
      updatedAt: new Date().toISOString()
    };
    
    // Update the specific documentation entry
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(taskId),
        'buildDocumentation.id': id
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    // Check if task was found and updated
    if (!result) {
      return res.status(404).json({ error: 'Task or documentation entry not found' });
    }
    
    // Find the updated documentation entry
    const updatedEntry = result.buildDocumentation.find(doc => doc.id === id);
    
    // Return the updated documentation
    return res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating task documentation:', error);
    return res.status(500).json({ error: 'Failed to update documentation' });
  }
}

/**
 * Delete documentation
 */
async function deleteDocumentation(taskId, req, res, session) {
  try {
    // Get documentation ID from request body
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Documentation ID is required' });
    }
    
    // Remove the documentation entry
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { 
        $pull: { buildDocumentation: { id } },
        $set: { updatedAt: new Date().toISOString() }
      },
      { returnDocument: 'after' }
    );
    
    // Check if task was found and updated
    if (!result) {
      return res.status(404).json({ error: 'Task or documentation entry not found' });
    }
    
    // Return success
    return res.status(200).json({ success: true, id });
  } catch (error) {
    console.error('Error deleting task documentation:', error);
    return res.status(500).json({ error: 'Failed to delete documentation' });
  }
}