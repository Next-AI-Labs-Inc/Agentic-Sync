/**
 * Initiative API - Individual Initiative Operations
 * 
 * Endpoints for operations on a specific initiative:
 * - GET /api/initiatives/:id - Get initiative by ID
 * - PUT /api/initiatives/:id - Update initiative
 * - DELETE /api/initiatives/:id - Delete initiative
 * 
 * See documentation at /docs/initiatives-guide.md for detailed information.
 */

import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection parameters
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'ix-tasks';
const COLLECTION_NAME = 'initiatives';

// Get MongoDB client instance
async function getClient() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

// API handler for initiative operations by ID
export default async function handler(req, res) {
  // Extract the initiative ID from the URL
  const { id } = req.query;
  
  // Convert string ID to number if it's numeric
  const initiativeId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
  
  let client;
  
  try {
    client = await getClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Find initiative by numeric ID or MongoDB ObjectId
    const query = typeof initiativeId === 'number' 
      ? { id: initiativeId } 
      : { _id: new ObjectId(initiativeId) };
    
    // GET - Retrieve a specific initiative
    if (req.method === 'GET') {
      const initiative = await collection.findOne(query);
      
      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }
      
      return res.status(200).json(initiative);
    } 
    // PUT - Update a specific initiative
    else if (req.method === 'PUT') {
      const updateData = req.body;
      
      // Ensure we're not trying to change the ID
      if (updateData.id !== undefined && updateData.id !== initiativeId) {
        return res.status(400).json({ error: 'Cannot change initiative ID' });
      }
      
      // Prepare update payload
      const update = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Check if we're updating status to completed
      if (update.status === 'completed' && !update.completedAt) {
        update.completedAt = new Date().toISOString();
      }
      
      // Perform the update
      const result = await collection.findOneAndUpdate(
        query,
        { $set: update },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ error: 'Initiative not found' });
      }
      
      return res.status(200).json(result.value);
    } 
    // DELETE - Remove a specific initiative
    else if (req.method === 'DELETE') {
      const result = await collection.findOneAndDelete(query);
      
      if (!result.value) {
        return res.status(404).json({ error: 'Initiative not found' });
      }
      
      return res.status(200).json({ message: 'Initiative deleted successfully' });
    } 
    // Method not allowed
    else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Initiative API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}