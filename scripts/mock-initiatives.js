/**
 * Mock script to demonstrate initiative data structure and API interaction
 * This script doesn't require a real MongoDB connection
 */

const axios = require('axios');

// Sample initiatives
const sampleInitiatives = [
  {
    id: 1,
    name: "User Impact UI Enhancement",
    description: "Improve UI to highlight user impact in task cards",
    status: "in-progress",
    priority: "high",
    tags: ["ui", "user-experience"],
    startDate: "2025-03-14",
    targetDate: "2025-03-21",
    createdAt: "2025-03-14T09:00:00Z",
    updatedAt: "2025-03-14T14:30:00Z"
  },
  {
    id: 2,
    name: "Task Inline Editing System",
    description: "Implement inline editing for all task fields",
    status: "planning",
    priority: "medium",
    tags: ["ui", "form"],
    startDate: "2025-03-13",
    targetDate: "2025-03-25",
    createdAt: "2025-03-13T09:00:00Z",
    updatedAt: "2025-03-13T14:30:00Z"
  },
  {
    id: 3,
    name: "Initiative-Task Relationship Enhancement",
    description: "Improve how initiatives group and organize related tasks",
    status: "not-started",
    priority: "medium",
    startDate: "2025-03-20",
    targetDate: "2025-03-30",
    createdAt: "2025-03-15T10:00:00Z",
    updatedAt: "2025-03-15T10:00:00Z"
  }
];

// Mock database client - simulates database operations
class MockClient {
  constructor() {
    this.initiatives = [...sampleInitiatives];
    console.log('✅ Mock database initialized');
  }
  
  // Get all initiatives
  async getInitiatives() {
    return this.initiatives;
  }
  
  // Create a new initiative
  async createInitiative(initiative) {
    const newInitiative = {
      ...initiative,
      id: Date.now()
    };
    this.initiatives.push(newInitiative);
    return newInitiative;
  }
  
  // Update an initiative
  async updateInitiative(id, data) {
    const index = this.initiatives.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    this.initiatives[index] = {
      ...this.initiatives[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.initiatives[index];
  }
  
  // Delete an initiative
  async deleteInitiative(id) {
    const index = this.initiatives.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.initiatives.splice(index, 1);
    return true;
  }
}

// Simulate API client - mirrors the real taskApiService
class MockApiClient {
  constructor() {
    this.db = new MockClient();
    console.log('✅ Mock API client initialized');
  }
  
  // Get initiatives with simulated API call
  async getInitiatives() {
    console.log('📡 GET /api/initiatives');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.db.getInitiatives();
  }
  
  // Create an initiative with simulated API call
  async createInitiative(initiativeData) {
    console.log('📡 POST /api/initiatives');
    console.log('Request body:', initiativeData);
    
    // Format the initiative data with timestamps
    const now = new Date().toISOString();
    const formattedData = {
      ...initiativeData,
      createdAt: now,
      updatedAt: now
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.db.createInitiative(formattedData);
  }
  
  // Update an initiative with simulated API call
  async updateInitiative(id, updateData) {
    console.log(`📡 PUT /api/initiatives/${id}`);
    console.log('Request body:', updateData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.db.updateInitiative(id, updateData);
  }
  
  // Delete an initiative with simulated API call
  async deleteInitiative(id) {
    console.log(`📡 DELETE /api/initiatives/${id}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await this.db.deleteInitiative(id);
    return { success: result, message: result ? 'Initiative deleted' : 'Initiative not found' };
  }
}

// Verify function to log initiatives and demonstrate API operations
async function verifyInitiatives() {
  console.log('\n=== INITIATIVE API DEMONSTRATION ===');
  
  const apiClient = new MockApiClient();
  
  try {
    // STEP 1: Get All Initiatives
    console.log('\n🔍 RETRIEVING ALL INITIATIVES');
    const initiatives = await apiClient.getInitiatives();
    
    console.log(`Found ${initiatives.length} initiatives`);
    
    // Log each initiative in a readable format
    console.log('\n=== INITIATIVE LIST ===');
    initiatives.forEach((initiative, index) => {
      console.log(`\nInitiative ${index + 1}:`);
      console.log(`  ID: ${initiative.id}`);
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
    
    // STEP 2: Create a new initiative
    console.log('\n🔍 CREATING NEW INITIATIVE');
    const newInitiative = {
      name: "Mock Initiative - " + new Date().toISOString(),
      description: "Created by mock API script",
      status: "planning",
      priority: "medium",
      tags: ["test", "mock"]
    };
    
    const createdInitiative = await apiClient.createInitiative(newInitiative);
    
    console.log('\n✅ New initiative created:');
    console.log(`  ID: ${createdInitiative.id}`);
    console.log(`  Name: ${createdInitiative.name}`);
    console.log(`  Created: ${createdInitiative.createdAt}`);
    
    // STEP 3: Update an initiative
    console.log('\n🔍 UPDATING INITIATIVE');
    const updateData = {
      status: "in-progress", 
      description: "Updated description with more details"
    };
    
    const updatedInitiative = await apiClient.updateInitiative(initiatives[0].id, updateData);
    
    console.log('\n✅ Initiative updated:');
    console.log(`  ID: ${updatedInitiative.id}`);
    console.log(`  Name: ${updatedInitiative.name}`);
    console.log(`  New Status: ${updatedInitiative.status}`);
    console.log(`  Updated Description: ${updatedInitiative.description}`);
    console.log(`  Updated At: ${updatedInitiative.updatedAt}`);
    
    // STEP 4: Delete an initiative
    console.log('\n🔍 DELETING INITIATIVE');
    const deleteResult = await apiClient.deleteInitiative(initiatives[initiatives.length - 1].id);
    
    console.log('\n✅ Delete operation result:');
    console.log(`  Success: ${deleteResult.success}`);
    console.log(`  Message: ${deleteResult.message}`);
    
    // STEP 5: Get all initiatives again to verify changes
    console.log('\n🔍 VERIFYING CHANGES');
    const updatedInitiatives = await apiClient.getInitiatives();
    
    console.log(`\nNow have ${updatedInitiatives.length} initiatives after operations`);
    console.log(`First initiative status is now: ${updatedInitiatives[0].status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return false;
  }
}

// Run the verification
verifyInitiatives()
  .then(success => {
    if (success) {
      console.log('\n✅ DEMONSTRATION COMPLETED SUCCESSFULLY');
      console.log('Initiative API operations verified with mock data');
    } else {
      console.log('\n❌ DEMONSTRATION FAILED');
    }
  })
  .catch(error => {
    console.error('\n❌ ERROR:', error);
  });