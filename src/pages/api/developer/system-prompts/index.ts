import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const configDir = path.join(process.cwd(), 'data');
const promptsFile = path.join(configDir, 'system-prompts.json');

// Default prompts if none are stored
const defaultPrompts = [
  {
    id: 'default-implementation',
    name: 'Default Implementation Prompt',
    content: 'You are an AI assistant tasked with implementing this feature. Review the task details, requirements, and technical plan, then implement the solution.',
    type: 'implementation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'default-demo',
    name: 'Default Demo Prompt',
    content: 'You are an AI assistant tasked with demonstrating how this feature works. Set up the necessary environment, execute the relevant commands, and show the feature in action.',
    type: 'demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: 'default-feedback',
    name: 'Default Feedback Prompt',
    content: 'You are an AI assistant tasked with addressing feedback on this task. Review the task and feedback, then implement the necessary changes.',
    type: 'feedback',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true
  }
];

// Initialize config directory and files if they don't exist
function initializeConfigFiles() {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    if (!fs.existsSync(promptsFile)) {
      fs.writeFileSync(promptsFile, JSON.stringify(defaultPrompts), 'utf8');
    }
  } catch (error) {
    console.error('Error initializing config files:', error);
  }
}

// Handler for GET and POST requests to /api/developer/system-prompts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure config files exist
  initializeConfigFiles();
  
  if (req.method === 'GET') {
    try {
      // Read prompts from file
      const data = fs.readFileSync(promptsFile, 'utf8');
      const prompts = JSON.parse(data);
      
      return res.status(200).json({ prompts });
    } catch (error) {
      console.error('Error reading prompts:', error);
      return res.status(200).json({ prompts: defaultPrompts });
    }
  } else if (req.method === 'POST') {
    try {
      // Create a new prompt
      const promptData = req.body;
      
      // Validate prompt data
      if (!promptData.name || !promptData.content || !promptData.type) {
        return res.status(400).json({ error: 'Invalid prompt format. Name, content, and type are required.' });
      }
      
      // Read existing prompts
      let prompts = [];
      try {
        const data = fs.readFileSync(promptsFile, 'utf8');
        prompts = JSON.parse(data);
      } catch (e) {
        prompts = defaultPrompts;
      }
      
      // Create a new prompt with ID and timestamps
      const now = new Date().toISOString();
      const newPrompt = {
        ...promptData,
        id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      };
      
      // Add to prompts and save
      prompts.push(newPrompt);
      fs.writeFileSync(promptsFile, JSON.stringify(prompts), 'utf8');
      
      return res.status(201).json({ success: true, prompt: newPrompt });
    } catch (error) {
      console.error('Error creating prompt:', error);
      return res.status(500).json({ error: 'Failed to create prompt' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}