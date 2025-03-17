import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export interface DocFile {
  name: string;
  title: string;
  path: string;
  filename: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // If list=true, return a list of available markdown files
  if (req.query.list === 'true') {
    const rootDir = process.cwd();
    const docsDir = path.join(rootDir, 'docs');
    
    // Get markdown files from root directory
    const rootFiles = fs.readdirSync(rootDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        // Generate a title from the filename
        const name = file.replace('.md', '');
        const title = name
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
          
        return {
          name,
          title,
          path: `/docs/${name.toLowerCase()}`,
          filename: file
        };
      });
    
    // Get markdown files from docs directory
    let docsFiles: DocFile[] = [];
    if (fs.existsSync(docsDir)) {
      docsFiles = fs.readdirSync(docsDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const name = file.replace('.md', '');
          const title = name === 'index' 
            ? 'Documentation Home'
            : name
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
                
          return {
            name,
            title,
            path: name === 'index' ? '/docs' : `/docs/${name.toLowerCase()}`,
            filename: file
          };
        });
    }
    
    // Combine and sort files
    const allFiles = [...rootFiles, ...docsFiles];
    
    // Move index.md to the top if it exists
    const indexFile = allFiles.find(f => f.name === 'index');
    const otherFiles = allFiles.filter(f => f.name !== 'index')
      .sort((a, b) => a.title.localeCompare(b.title));
    
    const sortedFiles = indexFile ? [indexFile, ...otherFiles] : otherFiles;
    
    return res.status(200).json(sortedFiles);
  }
  
  // Handle file content requests
  const { file } = req.query;
  
  if (!file || typeof file !== 'string') {
    return res.status(400).send('Missing file parameter');
  }
  
  // Sanitize the filename to prevent directory traversal attacks
  const sanitizedFile = path.basename(file);
  
  // Try to load the file from multiple locations
  // First check the root directory for markdown files like README.md
  const rootDir = process.cwd();
  const docsDir = path.join(rootDir, 'docs');
  
  let filePath;
  let content;
  
  // First try to find the file in the root directory
  if (sanitizedFile !== 'index.md') {
    filePath = path.join(rootDir, sanitizedFile);
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }
  }
  
  // If not found or it's the index file, try the docs directory
  if (!content) {
    filePath = path.join(docsDir, sanitizedFile);
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      return res.status(404).send('Documentation file not found');
    }
  }
  
  // Return the content with the correct content type
  res.setHeader('Content-Type', 'text/markdown');
  res.status(200).send(content);
}