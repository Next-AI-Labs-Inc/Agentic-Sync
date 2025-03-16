/**
 * Simple script to fetch and log initiatives directly from MongoDB
 * This verifies our MongoDB connection and initiative structure
 */

const { MongoClient } = require('mongodb');

// MongoDB connection parameters
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'ix-tasks';
const COLLECTION_NAME = 'initiatives';

async function logInitiatives() {
  console.log('=== INITIATIVE VERIFICATION ===');
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  console.log(`Using database: ${DB_NAME}`);
  console.log(`Collection: ${COLLECTION_NAME}`);
  console.log('----------------------------');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Get collection
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Count initiatives
    const count = await collection.countDocuments();
    console.log(`Found ${count} initiatives in the database`);
    
    if (count === 0) {
      console.log('Creating a sample initiative...');
      // Create a sample initiative for testing
      const now = new Date().toISOString();
      const result = await collection.insertOne({
        id: Date.now(),
        name: "Test Initiative - " + now,
        description: "Created by verification script",
        status: "planning",
        priority: "medium",
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`✅ Sample initiative created with ID: ${result.insertedId}`);
      
      // Get collection count again
      const newCount = await collection.countDocuments();
      console.log(`Now have ${newCount} initiatives in the database`);
    }
    
    // Get all initiatives
    const initiatives = await collection.find({}).toArray();
    
    // Log each initiative in a readable format
    console.log('\n=== INITIATIVE LIST ===');
    initiatives.forEach((initiative, index) => {
      console.log(`\nInitiative ${index + 1}:`);
      console.log(`  ID: ${initiative.id || initiative._id}`);
      console.log(`  Name: ${initiative.name}`);
      console.log(`  Status: ${initiative.status}`);
      console.log(`  Priority: ${initiative.priority}`);
      console.log(`  Description: ${initiative.description?.substring(0, 50)}${initiative.description?.length > 50 ? '...' : ''}`);
      console.log(`  Created: ${initiative.createdAt}`);
      console.log(`  Updated: ${initiative.updatedAt}`);
      
      // Log any tags
      if (initiative.tags && initiative.tags.length > 0) {
        console.log(`  Tags: ${initiative.tags.join(', ')}`);
      }
    });
    
    console.log('\n✅ Verification completed successfully');
    return initiatives;
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the verification
logInitiatives()
  .then(initiatives => {
    if (initiatives && initiatives.length > 0) {
      console.log('\nSUCCESS: MongoDB connection and initiatives verified');
      process.exit(0);
    } else {
      console.log('\nWARNING: No initiatives found or could not connect to MongoDB');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\nERROR:', error);
    process.exit(1);
  });