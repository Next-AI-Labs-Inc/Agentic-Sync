import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const configDir = path.join(process.cwd(), 'data');
const stagesFile = path.join(configDir, 'task-stages.json');

// Default stages if none are stored
const defaultStages = [
  'brainstorm', 'proposed', 'backlog', 'todo', 'in-progress', 
  'on-hold', 'done', 'reviewed', 'archived'
];

// Initialize config directory and files if they don't exist
function initializeConfigFiles() {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    if (!fs.existsSync(stagesFile)) {
      fs.writeFileSync(stagesFile, JSON.stringify(defaultStages), 'utf8');
    }
  } catch (error) {
    console.error('Error initializing config files:', error);
  }
}

// Handler for GET and POST requests to /api/developer/config/stages
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure config files exist
  initializeConfigFiles();
  
  if (req.method === 'GET') {
    try {
      // Read stages from file
      const data = fs.readFileSync(stagesFile, 'utf8');
      const stages = JSON.parse(data);
      
      return res.status(200).json({ stages });
    } catch (error) {
      console.error('Error reading stages:', error);
      return res.status(200).json({ stages: defaultStages });
    }
  } else if (req.method === 'POST') {
    try {
      const { stages } = req.body;
      
      // Validate stages
      if (!Array.isArray(stages) || stages.length === 0) {
        return res.status(400).json({ error: 'Invalid stages format. Must be a non-empty array.' });
      }
      
      // Write stages to file
      fs.writeFileSync(stagesFile, JSON.stringify(stages), 'utf8');
      
      return res.status(200).json({ success: true, stages });
    } catch (error) {
      console.error('Error saving stages:', error);
      return res.status(500).json({ error: 'Failed to save stages' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}