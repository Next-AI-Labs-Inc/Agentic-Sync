import { MongoClient } from 'mongodb';
import handler from '../../src/pages/api/initiatives/index';
import idHandler from '../../src/pages/api/initiatives/[id]';

// Mock MongoDB client
jest.mock('mongodb', () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    toArray: jest.fn()
  };
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  
  const mockClient = {
    connect: jest.fn(),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn()
  };
  
  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn(id => ({ _id: id }))
  };
});

describe('Initiatives API', () => {
  let req;
  let res;
  let mockClient;
  let mockCollection;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      method: '',
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn()
    };
    
    // Get MongoDB mock
    mockClient = new MongoClient();
    mockCollection = mockClient.db().collection();
  });
  
  describe('GET /api/initiatives', () => {
    beforeEach(() => {
      req.method = 'GET';
    });
    
    it('should return all initiatives', async () => {
      const mockInitiatives = [
        { id: 1, name: 'Initiative 1', updatedAt: '2025-03-01T00:00:00Z' },
        { id: 2, name: 'Initiative 2', updatedAt: '2025-03-02T00:00:00Z' }
      ];
      
      mockCollection.toArray.mockResolvedValue(mockInitiatives);
      
      await handler(req, res);
      
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.db).toHaveBeenCalled();
      expect(mockClient.db().collection).toHaveBeenCalledWith('initiatives');
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.toArray).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
      expect(mockClient.close).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      mockCollection.toArray.mockRejectedValue(new Error('Database error'));
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        details: 'Database error'
      });
    });
  });
  
  describe('POST /api/initiatives', () => {
    beforeEach(() => {
      req.method = 'POST';
      req.body = {
        name: 'New Initiative',
        description: 'Test initiative',
        status: 'not-started',
        priority: 'medium'
      };
    });
    
    it('should create a new initiative', async () => {
      mockCollection.findOne.mockResolvedValue(null); // No duplicate
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-id' });
      mockCollection.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 123,
        name: 'New Initiative',
        description: 'Test initiative',
        status: 'not-started',
        priority: 'medium'
      });
      
      await handler(req, res);
      
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Initiative'
      }));
    });
    
    it('should reject if name is missing', async () => {
      req.body = {};
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Initiative name is required'
      });
    });
    
    it('should reject if initiative with same name exists', async () => {
      const existingInitiative = {
        id: 1,
        name: 'New Initiative'
      };
      
      mockCollection.findOne.mockResolvedValue(existingInitiative);
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Initiative with this name already exists',
        existing: existingInitiative
      });
    });
  });
  
  describe('GET /api/initiatives/:id', () => {
    beforeEach(() => {
      req.method = 'GET';
      req.query = { id: '123' };
    });
    
    it('should get initiative by ID', async () => {
      const mockInitiative = {
        id: 123,
        name: 'Test Initiative'
      };
      
      mockCollection.findOne.mockResolvedValue(mockInitiative);
      
      await idHandler(req, res);
      
      expect(mockCollection.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInitiative);
    });
    
    it('should return 404 if initiative not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      
      await idHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Initiative not found' });
    });
  });
  
  describe('PUT /api/initiatives/:id', () => {
    beforeEach(() => {
      req.method = 'PUT';
      req.query = { id: '123' };
      req.body = {
        status: 'in-progress',
        priority: 'high'
      };
    });
    
    it('should update initiative', async () => {
      const mockUpdatedInitiative = {
        id: 123,
        name: 'Test Initiative',
        status: 'in-progress',
        priority: 'high',
        updatedAt: expect.any(String)
      };
      
      mockCollection.findOneAndUpdate.mockResolvedValue({
        value: mockUpdatedInitiative
      });
      
      await idHandler(req, res);
      
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedInitiative);
    });
    
    it('should reject if trying to change ID', async () => {
      req.body.id = 456; // Different from request ID
      
      await idHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot change initiative ID'
      });
    });
    
    it('should return 404 if initiative not found', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue({ value: null });
      
      await idHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Initiative not found' });
    });
    
    it('should set completedAt when status changes to completed', async () => {
      req.body = { status: 'completed' };
      
      mockCollection.findOneAndUpdate.mockImplementation((query, update) => {
        // Check if completedAt is set in the update
        expect(update.$set.completedAt).toBeDefined();
        return Promise.resolve({
          value: { id: 123, status: 'completed' }
        });
      });
      
      await idHandler(req, res);
      
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
  
  describe('DELETE /api/initiatives/:id', () => {
    beforeEach(() => {
      req.method = 'DELETE';
      req.query = { id: '123' };
    });
    
    it('should delete initiative', async () => {
      mockCollection.findOneAndDelete.mockResolvedValue({
        value: { id: 123, name: 'Test Initiative' }
      });
      
      await idHandler(req, res);
      
      expect(mockCollection.findOneAndDelete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Initiative deleted successfully'
      });
    });
    
    it('should return 404 if initiative not found', async () => {
      mockCollection.findOneAndDelete.mockResolvedValue({ value: null });
      
      await idHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Initiative not found' });
    });
  });
  
  describe('Method not allowed', () => {
    it('should return 405 for unsupported methods on index route', async () => {
      req.method = 'PATCH';
      
      await handler(req, res);
      
      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
      expect(res.status).toHaveBeenCalledWith(405);
    });
    
    it('should return 405 for unsupported methods on ID route', async () => {
      req.method = 'PATCH';
      req.query = { id: '123' };
      
      await idHandler(req, res);
      
      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'PUT', 'DELETE']);
      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});