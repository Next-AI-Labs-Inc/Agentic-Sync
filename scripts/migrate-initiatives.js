/**
 * Script to migrate initiative data from JSON to MongoDB
 * 
 * This script connects to MongoDB and migrates initiative data from the local JSON
 * storage while preventing duplicates, similar to what was done for tasks.
 * 
 * Usage: node scripts/migrate-initiatives.js
 * 
 * It will:
 * 1. Look for initiative data in .ix-sync/initiatives.json files in projects
 * 2. Deduplicate based on name, description, and other fields
 * 3. Insert only unique initiatives into MongoDB
 */

const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
const glob = require('glob');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'ix-tasks';
const COLLECTION_NAME = 'initiatives';

// Find all .ix-sync/initiatives.json files in the parent directory
async function findInitiativeFiles() {
  return new Promise((resolve, reject) => {
    glob('../**/.ix-sync/initiatives.json', { ignore: ['**/node_modules/**'] }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

// Read initiative data from a JSON file
async function readInitiativesFromFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const initiatives = JSON.parse(data);
    
    // Log source
    console.log(`Read ${initiatives.length} initiatives from ${filePath}`);
    
    // Ensure initiatives have proper dates for sorting
    return initiatives.map(initiative => {
      // Ensure dates are proper ISO strings
      const now = new Date().toISOString();
      return {
        ...initiative,
        createdAt: initiative.createdAt || now,
        updatedAt: initiative.updatedAt || now,
        // Add project information based on file path
        project: path.basename(path.dirname(path.dirname(filePath)))
      };
    });
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Deduplicate initiatives based on name, description, and other key attributes
function deduplicateInitiatives(initiatives) {
  console.log(`Starting deduplication of ${initiatives.length} initiatives`);
  
  // First deduplicate by ID if available
  const initiativesByIdMap = new Map();
  
  initiatives.forEach(initiative => {
    const id = initiative.id;
    if (id) {
      if (!initiativesByIdMap.has(id) || 
          new Date(initiative.updatedAt) > new Date(initiativesByIdMap.get(id).updatedAt)) {
        initiativesByIdMap.set(id, initiative);
      }
    }
  });
  
  // Then deduplicate by name (which should be unique per project)
  const initiativesByNameMap = new Map();
  
  [...initiativesByIdMap.values(), ...initiatives.filter(i => !i.id)].forEach(initiative => {
    // Create a key based on name and project to avoid cross-project clashes
    const key = `${initiative.project}:::${initiative.name}`;
    
    if (!initiativesByNameMap.has(key) || 
        new Date(initiative.updatedAt) > new Date(initiativesByNameMap.get(key).updatedAt)) {
      initiativesByNameMap.set(key, initiative);
    }
  });
  
  // Get the unique initiatives
  const uniqueInitiatives = Array.from(initiativesByNameMap.values());
  
  console.log(`Deduplication complete: ${initiatives.length} → ${uniqueInitiatives.length} initiatives`);
  
  return uniqueInitiatives;
}

// Migrate initiatives to MongoDB
async function migrateInitiativesToMongoDB(initiatives) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check for existing initiatives and decide what to insert and what to update
    const existingCount = await collection.countDocuments();
    console.log(`Found ${existingCount} existing initiatives in MongoDB`);
    
    if (existingCount > 0) {
      console.log('Performing smart merge with existing initiatives...');
      
      // Get all existing initiatives
      const existingInitiatives = await collection.find({}).toArray();
      
      // Create a map of existing initiatives by ID and name-project combination
      const existingById = new Map();
      const existingByNameProject = new Map();
      
      existingInitiatives.forEach(i => {
        if (i._id) existingById.set(i._id.toString(), i);
        const key = `${i.project}:::${i.name}`;
        existingByNameProject.set(key, i);
      });
      
      // Prepare batch operations
      const updateOps = [];
      const insertOps = [];
      
      for (const initiative of initiatives) {
        const nameProjectKey = `${initiative.project}:::${initiative.name}`;
        
        // Check if initiative exists by ID or name-project combination
        const existingById = existingInitiatives.find(e => e._id === initiative.id);
        const existingByName = existingByNameProject.get(nameProjectKey);
        
        if (existingById || existingByName) {
          const existing = existingById || existingByName;
          
          // Only update if the new initiative is newer
          if (new Date(initiative.updatedAt) > new Date(existing.updatedAt)) {
            console.log(`Updating: ${initiative.name} (${initiative.project})`);
            updateOps.push({
              updateOne: {
                filter: { _id: existing._id },
                update: { $set: { ...initiative, _id: existing._id } }
              }
            });
          }
        } else {
          console.log(`New initiative: ${initiative.name} (${initiative.project})`);
          insertOps.push({
            insertOne: { document: initiative }
          });
        }
      }
      
      // Execute batch operations
      let updateResult = { matchedCount: 0, modifiedCount: 0 };
      let insertResult = { insertedCount: 0 };
      
      if (updateOps.length > 0) {
        updateResult = await collection.bulkWrite(updateOps);
      }
      
      if (insertOps.length > 0) {
        insertResult = await collection.bulkWrite(insertOps);
      }
      
      console.log(`Updated ${updateResult.modifiedCount} initiatives`);
      console.log(`Inserted ${insertResult.insertedCount} new initiatives`);
      
    } else {
      // If no existing initiatives, just insert all
      const result = await collection.insertMany(initiatives);
      console.log(`Inserted ${result.insertedCount} initiatives into MongoDB`);
    }
    
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Main function
async function main() {
  try {
    console.log('Starting initiative migration...');
    
    // Find all initiative files
    const files = await findInitiativeFiles();
    console.log(`Found ${files.length} initiative files`);
    
    if (files.length === 0) {
      // Create a basic sample if no files found
      console.log('No initiative files found. Creating sample data...');
      const sampleInitiatives = [
        {
          id: 1,
          name: "Documentation Map Enhancement",
          description: "Comprehensive improvements to the documentation mapping system",
          status: "in-progress",
          priority: "high",
          startDate: "2025-03-14",
          targetDate: "2025-03-21",
          createdAt: "2025-03-14T09:00:00Z",
          updatedAt: "2025-03-14T14:30:00Z",
          project: "doc-map",
          tags: ["documentation", "enhancement", "navigation"]
        },
        {
          id: 2,
          name: "Bug Reporting System",
          description: "End-to-end system for capturing, tracking, and managing bugs",
          status: "in-progress",
          priority: "high",
          startDate: "2025-03-13",
          targetDate: "2025-03-25",
          createdAt: "2025-03-13T09:00:00Z",
          updatedAt: "2025-03-13T14:30:00Z",
          project: "tasks",
          tags: ["bug-tracking", "reporting", "maintenance"]
        },
        {
          id: 3,
          name: "Initiative UI Modernization",
          description: "Improving the user interface for initiatives view with modern components and interactions",
          status: "planning",
          priority: "medium",
          startDate: "2025-03-15",
          targetDate: "2025-03-28",
          createdAt: "2025-03-15T10:00:00Z",
          updatedAt: "2025-03-15T10:00:00Z",
          project: "tasks",
          tags: ["ui", "design", "usability"]
        },
        {
          id: 4,
          name: "MongoDB Integration for Initiatives",
          description: "Integrating the initiatives system with MongoDB for better persistence and performance",
          status: "not-started",
          priority: "high",
          startDate: "2025-03-16",
          targetDate: "2025-03-29",
          createdAt: "2025-03-16T09:00:00Z",
          updatedAt: "2025-03-16T09:00:00Z",
          project: "tasks",
          tags: ["database", "integration", "persistence"]
        }
      ];
      
      // Migrate sample initiatives
      await migrateInitiativesToMongoDB(sampleInitiatives);
      return;
    }
    
    // Read initiatives from all files
    let allInitiatives = [];
    for (const file of files) {
      const initiatives = await readInitiativesFromFile(file);
      allInitiatives = [...allInitiatives, ...initiatives];
    }
    
    console.log(`Total of ${allInitiatives.length} initiatives loaded from all files`);
    
    // Deduplicate initiatives
    const uniqueInitiatives = deduplicateInitiatives(allInitiatives);
    
    // Migrate to MongoDB
    await migrateInitiativesToMongoDB(uniqueInitiatives);
    
    console.log('Initiative migration completed successfully!');
    
  } catch (error) {
    console.error('Error in migration:', error);
    process.exit(1);
  }
}

// Run the migration
main();