/**
 * Mock authentication library for Tauri static build
 */

// Mock session data
const mockSession = {
  user: {
    id: 'mock-user-id',
    email: 'user@example.com',
    name: 'Mock User',
    role: 'admin'
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

/**
 * Get the current user session
 */
export async function getSession() {
  console.log('Using mock authentication for Tauri build');
  return mockSession;
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(req) {
  return true;
}

/**
 * Check if a user has admin role
 */
export function isAdmin(req) {
  return true;
}

/**
 * Generate an authentication token
 */
export async function generateToken(user) {
  return 'mock-token-' + Math.random().toString(36).substring(2);
}

/**
 * Verify an authentication token
 */
export async function verifyToken(token) {
  return mockSession.user;
}