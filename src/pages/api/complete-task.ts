import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to mark a task as complete
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { taskId, project, status } = req.body;

    // For now, just return success
    // In a real implementation, you would update the task in the database
    return res.status(200).json({ 
      success: true,
      message: 'Task updated successfully',
      data: {
        taskId,
        project,
        status
      }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}