import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

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

// Helper function to deduplicate initiatives
function deduplicateInitiatives(initiatives) {
  console.log(`Deduplicating ${initiatives.length} initiatives`);
  
  // First deduplicate by ID
  const idMap = new Map();
  const titleProjectMap = new Map();
  
  // Track duplicates
  const duplicatesById = [];
  const duplicatesByTitleProject = [];
  
  for (const initiative of initiatives) {
    // ID-based duplicate check
    const id = initiative._id || initiative.id;
    if (idMap.has(id)) {
      duplicatesById.push({
        id,
        name: initiative.name,
        project: initiative.project
      });
    } else {
      idMap.set(id, true);
    }
    
    // Title+Project based duplicate check
    const titleProjectKey = `${initiative.name}:::${initiative.project || ''}`;
    if (titleProjectMap.has(titleProjectKey)) {
      const existingId = titleProjectMap.get(titleProjectKey);
      if (existingId !== id) { // Don't count if it's the same initiative (same ID)
        duplicatesByTitleProject.push({
          id,
          existingId,
          name: initiative.name,
          project: initiative.project
        });
      }
    } else {
      titleProjectMap.set(titleProjectKey, id);
    }
  }
  
  // Log duplicate details
  if (duplicatesById.length > 0) {
    console.warn(`Found ${duplicatesById.length} duplicate initiative IDs. Examples:`);
    duplicatesById.slice(0, 5).forEach(dup => {
      console.warn(`- ID: ${dup.id}, Name: "${dup.name}", Project: ${dup.project}`);
    });
  }
  
  if (duplicatesByTitleProject.length > 0) {
    console.warn(`Found ${duplicatesByTitleProject.length} initiatives with duplicate name+project but different IDs`);
    duplicatesByTitleProject.slice(0, 5).forEach(dup => {
      console.warn(`- "${dup.name}" (Project: ${dup.project}) has IDs: ${dup.id} and ${dup.existingId}`);
    });
  }
  
  // First deduplicate by ID
  const uniqueInitiativeById = [];
  const seenIds = new Set();
  for (const initiative of initiatives) {
    const id = initiative._id || initiative.id;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      uniqueInitiativeById.push(initiative);
    }
  }
  
  // Then deduplicate by name+project
  const uniqueInitiatives = [];
  const seenTitleProjects = new Map(); // Map from name+project to initiative
  
  for (const initiative of uniqueInitiativeById) {
    const titleProjectKey = `${initiative.name}:::${initiative.project || ''}`;
    const id = initiative._id || initiative.id;
    
    if (!seenTitleProjects.has(titleProjectKey)) {
      // New name+project combination
      seenTitleProjects.set(titleProjectKey, initiative);
      uniqueInitiatives.push(initiative);
    } else {
      // Name+project exists, keep the newer one
      const existingInitiative = seenTitleProjects.get(titleProjectKey);
      const existingDate = new Date(existingInitiative.updatedAt);
      const currentDate = new Date(initiative.updatedAt);
      
      if (currentDate > existingDate) {
        // Replace the older initiative with this newer one
        const indexToReplace = uniqueInitiatives.findIndex(t => 
          (t._id || t.id) === (existingInitiative._id || existingInitiative.id)
        );
        
        if (indexToReplace !== -1) {
          uniqueInitiatives[indexToReplace] = initiative;
          seenTitleProjects.set(titleProjectKey, initiative);
          console.log(`Replaced older initiative "${existingInitiative.name}" with newer version`);
        }
      }
    }
  }
  
  console.log(`Deduplicated ${initiatives.length} → ${uniqueInitiatives.length} initiatives`);
  return uniqueInitiatives;
}

// API handler
export default async function handler(req, res) {
  // Get MongoDB client
  let client;
  
  try {
    client = await getClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // GET - retrieve all initiatives
    if (req.method === 'GET') {
      const initiatives = await collection.find({}).toArray();
      
      // Deduplicate initiatives
      const uniqueInitiatives = deduplicateInitiatives(initiatives);
      
      // Send response
      res.status(200).json(uniqueInitiatives);
    } 
    // POST - create a new initiative
    else if (req.method === 'POST') {
      const initiativeData = req.body;
      
      // Validate required fields
      if (!initiativeData.name) {
        return res.status(400).json({ error: 'Initiative name is required' });
      }
      
      // Format the initiative with defaults
      const now = new Date().toISOString();
      const formattedInitiative = {
        id: parseInt(uuidv4().replace(/-/g, '').substring(0, 8), 16), // Generate a numeric ID
        name: initiativeData.name,
        description: initiativeData.description || '',
        status: initiativeData.status || 'not-started',
        priority: initiativeData.priority || 'medium',
        startDate: initiativeData.startDate || now,
        targetDate: initiativeData.targetDate,
        owner: initiativeData.owner,
        budget: initiativeData.budget,
        tags: initiativeData.tags || [],
        keyRisks: initiativeData.keyRisks || [],
        dependencies: initiativeData.dependencies || [],
        linkedProjects: initiativeData.linkedProjects || [],
        linkedKpis: initiativeData.linkedKpis || [],
        createdAt: now,
        updatedAt: now,
        completedAt: initiativeData.completedAt || null,
        project: initiativeData.project || 'tasks'
      };
      
      // Check for duplicates by name+project
      const existingByName = await collection.findOne({ 
        name: formattedInitiative.name,
        project: formattedInitiative.project
      });
      
      if (existingByName) {
        return res.status(409).json({ 
          error: 'Initiative with this name already exists',
          existing: existingByName
        });
      }
      
      // Insert the initiative
      const result = await collection.insertOne(formattedInitiative);
      
      // Get the inserted initiative
      const insertedInitiative = await collection.findOne({ _id: result.insertedId });
      
      res.status(201).json(insertedInitiative);
    } 
    // Method not allowed
    else {
      res.setHeader('Allow', ['GET', 'POST']);
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