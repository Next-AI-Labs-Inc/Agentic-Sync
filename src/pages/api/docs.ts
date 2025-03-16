import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { file } = req.query;
  
  if (!file || typeof file !== 'string') {
    return res.status(400).send('Missing file parameter');
  }
  
  // Sanitize the filename to prevent directory traversal attacks
  const sanitizedFile = path.basename(file);
  
  // Construct the path to the docs directory
  const docsDir = path.join(process.cwd(), 'docs');
  const filePath = path.join(docsDir, sanitizedFile);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Documentation file not found');
    }
    
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Return the content with the correct content type
    res.setHeader('Content-Type', 'text/markdown');
    res.status(200).send(content);
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return res.status(500).send('Error loading documentation');
  }
}