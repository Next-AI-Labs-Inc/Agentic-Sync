/**
 * Route Generator
 * 
 * Generates API route files for a data model based on its configuration.
 * This module creates the necessary API endpoints to support CRUD operations.
 */

import path from 'path';
import fs from 'fs/promises';
import { DataModelConfig } from '../baseConfig';

/**
 * Generate API routes for a data model
 */
export async function generateApiRoutes(config: DataModelConfig, basePath: string): Promise<string[]> {
  // Create the API directory
  const apiDir = path.join(basePath, 'api', config.slug);
  try {
    await fs.mkdir(apiDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating API directory: ${error}`);
    throw error;
  }
  
  const generatedFiles: string[] = [];
  
  // Generate index.js file for main routes
  const indexPath = path.join(apiDir, 'index.js');
  await fs.writeFile(indexPath, generateIndexFile(config));
  generatedFiles.push(indexPath);
  
  // Generate [id].js file for item routes
  const idPath = path.join(apiDir, '[id].js');
  await fs.writeFile(idPath, generateIdFile(config));
  generatedFiles.push(idPath);
  
  // If statuses are defined, generate status update endpoint
  if (config.statuses) {
    const statusPath = path.join(apiDir, 'status.js');
    await fs.writeFile(statusPath, generateStatusFile(config));
    generatedFiles.push(statusPath);
  }
  
  return generatedFiles;
}

/**
 * Generate index.js file for list/create operations
 */
function generateIndexFile(config: DataModelConfig): string {
  return `/**
 * ${config.displayName} API Routes
 * 
 * This file handles list and create operations for the ${config.displayName} data model.
 * Generated automatically from data model configuration.
 */

import { connect } from '../../lib/database';
import { getSession } from '../../lib/auth';

// Connect to the database
const { db } = await connect();
const collection = db.collection('${config.slug}');

export default async function handler(req, res) {
  // Get user session for authentication
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getItems(req, res, session);
    case 'POST':
      return await createItem(req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get items with optional filtering
 */
async function getItems(req, res, session) {
  try {
    // Parse query parameters
    const { 
      status, 
      project, 
      sort = 'createdAt', 
      direction = 'desc',
      search,
      limit = 100
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // Apply status filter if provided
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Apply project filter if provided
    if (project) {
      filter.project = project;
    }
    
    // Apply search filter if provided
    if (search) {
      filter.$or = [
        ${config.ui.searchFields?.map(field => `{ ${field}: { $regex: search, $options: 'i' } }`).join(',\n        ') || 
        `{ title: { $regex: search, $options: 'i' } }`}
      ];
    }
    
    // Get items with sorting
    const sortOrder = direction === 'asc' ? 1 : -1;
    const items = await collection
      .find(filter)
      .sort({ [sort]: sortOrder })
      .limit(parseInt(limit))
      .toArray();
    
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error getting ${config.slug} items:', error);
    return res.status(500).json({ error: 'Failed to get items' });
  }
}

/**
 * Create a new item
 */
async function createItem(req, res, session) {
  try {
    // Get item data from request body
    const itemData = req.body;
    
    // Add metadata
    const now = new Date();
    const item = {
      ...itemData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: session.user.id
    };
    
    // Insert into database
    const result = await collection.insertOne(item);
    
    // Return the created item with id
    return res.status(201).json({
      ...item,
      _id: result.insertedId,
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error creating ${config.slug} item:', error);
    return res.status(500).json({ error: 'Failed to create item' });
  }
}`;
}

/**
 * Generate [id].js file for item operations
 */
function generateIdFile(config: DataModelConfig): string {
  return `/**
 * ${config.displayName} Item API Routes
 * 
 * This file handles operations on individual ${config.displayName} items.
 * Generated automatically from data model configuration.
 */

import { ObjectId } from 'mongodb';
import { connect } from '../../lib/database';
import { getSession } from '../../lib/auth';

// Connect to the database
const { db } = await connect();
const collection = db.collection('${config.slug}');

export default async function handler(req, res) {
  // Get user session for authentication
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get item ID from query params
  const { id } = req.query;
  
  // Validate ID
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  // Convert string ID to ObjectId
  const objectId = new ObjectId(id);
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getItem(objectId, req, res, session);
    case 'PUT':
      return await updateItem(objectId, req, res, session);
    case 'DELETE':
      return await deleteItem(objectId, req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Get a single item by ID
 */
async function getItem(id, req, res, session) {
  try {
    // Get item from database
    const item = await collection.findOne({ _id: id });
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Return the item
    return res.status(200).json({
      ...item,
      id: item._id
    });
  } catch (error) {
    console.error('Error getting ${config.slug} item:', error);
    return res.status(500).json({ error: 'Failed to get item' });
  }
}

/**
 * Update an item
 */
async function updateItem(id, req, res, session) {
  try {
    // Get item data from request body
    const updateData = req.body;
    
    // Add metadata
    updateData.updatedAt = new Date().toISOString();
    
    // Update in database
    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    // Check if item was found and updated
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Return the updated item
    return res.status(200).json({
      ...result,
      id: result._id
    });
  } catch (error) {
    console.error('Error updating ${config.slug} item:', error);
    return res.status(500).json({ error: 'Failed to update item' });
  }
}

/**
 * Delete an item
 */
async function deleteItem(id, req, res, session) {
  try {
    // Delete from database
    const result = await collection.deleteOne({ _id: id });
    
    // Check if item was found and deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Return success response
    return res.status(200).json({ success: true, id });
  } catch (error) {
    console.error('Error deleting ${config.slug} item:', error);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
}`;
}

/**
 * Generate status update file
 */
function generateStatusFile(config: DataModelConfig): string {
  return `/**
 * ${config.displayName} Status Update API Route
 * 
 * This file handles status updates for ${config.displayName} items.
 * Generated automatically from data model configuration.
 */

import { ObjectId } from 'mongodb';
import { connect } from '../../lib/database';
import { getSession } from '../../lib/auth';

// Connect to the database
const { db } = await connect();
const collection = db.collection('${config.slug}');

// Valid status values
const VALID_STATUSES = [
  ${Object.values(config.statuses!.values)
    .filter(status => typeof status === 'string' && !['all', 'pending', 'recent-completed', 'source-tasks', 'engaged', 'review', 'completions'].includes(status))
    .map(status => `'${status}'`)
    .join(',\n  ')}
];

export default async function handler(req, res) {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get user session for authentication
  const session = await getSession({ req });
  
  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get item ID from query params
  const { id } = req.query;
  
  // Validate ID
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  // Get status from request body
  const { status } = req.body;
  
  // Validate status
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses: VALID_STATUSES
    });
  }
  
  try {
    // Create update data
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Add special timestamps for status changes
    ${config.model.fields.completedAt ? `if (status === 'done' || status === 'completed') {
      updateData.completedAt = new Date().toISOString();
    }` : ''}
    ${config.model.fields.reviewedAt ? `if (status === 'reviewed') {
      updateData.reviewedAt = new Date().toISOString();
    }` : ''}
    ${config.model.fields.publishedAt ? `if (status === 'published') {
      updateData.publishedAt = new Date().toISOString();
    }` : ''}
    
    // Update in database
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    // Check if item was found and updated
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Return the updated item
    return res.status(200).json({
      ...result,
      id: result._id
    });
  } catch (error) {
    console.error('Error updating ${config.slug} status:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}`;
}

export default { generateApiRoutes };