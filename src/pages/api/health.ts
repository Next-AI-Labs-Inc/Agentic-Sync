import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Health Check Endpoint
 * 
 * This endpoint provides a simple health check for the API.
 * It returns basic information about the API status and version.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get current timestamp
  const now = new Date();
  
  // Basic health check response
  const healthData = {
    status: 'healthy',
    timestamp: now.toISOString(),
    version: process.env.NEXT_PUBLIC_API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiName: 'IX Tasks API',
    features: ['tasks', 'projects', 'initiatives'],
    uptime: process.uptime(),
  };
  
  // Return health data with 200 status
  res.status(200).json(healthData);
}