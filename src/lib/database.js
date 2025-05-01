/**
 * Mock database connection for Tauri static build
 */

// Mock MongoDB collection functionality
class Collection {
  constructor(name) {
    this.name = name;
    this._data = [];
  }

  async findOne() {
    return null;
  }

  async findOneAndUpdate() {
    return null;
  }

  async insertOne() {
    return { insertedId: 'mock-id' };
  }

  async find() {
    return {
      toArray: async () => []
    };
  }
}

// Mock database with collections
class Database {
  constructor() {
    this._collections = {};
  }

  collection(name) {
    if (!this._collections[name]) {
      this._collections[name] = new Collection(name);
    }
    return this._collections[name];
  }
}

// Mock connection object
const connectionInstance = {
  db: new Database(),
  client: {
    close: async () => {}
  }
};

// Connect function returns mock connection
export async function connect() {
  console.log('Using mock database connection for Tauri build');
  return connectionInstance;
}

// Export ObjectId class for compatibility
export class ObjectId {
  constructor(id) {
    this.id = id || 'mock-id-' + Math.random().toString(36).substring(2);
  }

  toString() {
    return this.id;
  }

  static isValid(id) {
    return typeof id === 'string' && id.length > 0;
  }
}