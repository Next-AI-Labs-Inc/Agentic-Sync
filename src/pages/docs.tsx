import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

interface DocFile {
  name: string;
  title: string;
  path: string;
  filename: string;
}

export default function DocsPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [currentDoc, setCurrentDoc] = useState<string>('index.md');
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Function to load a document directly by filename
  const loadDocumentDirectly = async (filename: string) => {
    console.log("Loading document directly:", filename);
    
    setLoading(true);
    setError(null);
    
    try {
      setCurrentDoc(filename);
      
      // Get the content from the API
      const response = await fetch(`/api/docs?file=${filename}`);
      if (response.ok) {
        const content = await response.text();
        setMarkdown(content);
      } else {
        setError('Documentation not found');
        setMarkdown('# Documentation Not Found\n\nThe requested documentation could not be found.');
      }
    } catch (err) {
      console.error('Error loading documentation:', err);
      setError('Error loading documentation');
      setMarkdown('# Error Loading Documentation\n\nThere was an error loading the documentation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load available documentation files
  useEffect(() => {
    const loadAvailableDocs = async () => {
      setDocsLoading(true);
      try {
        const response = await fetch('/api/docs?list=true');
        if (response.ok) {
          const availableDocs = await response.json();
          setDocs(availableDocs);
        } else {
          console.error('Failed to load documentation list');
        }
      } catch (error) {
        console.error('Error loading docs list:', error);
      } finally {
        setDocsLoading(false);
      }
    };
    
    loadAvailableDocs();
  }, []);

  // Load the selected document
  useEffect(() => {
    const loadDoc = async () => {
      if (docsLoading) return; // Wait for docs list to load first
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine which document to load based on the route
        const currentPath = router.asPath;
        let docFile = 'index.md';
        let docFound = false;
        
        console.log("Current path:", currentPath);
        
        if (currentPath !== '/docs') {
          // Extract the doc name from the path
          const slug = currentPath.replace('/docs/', '').split('?')[0];
          console.log("Looking for doc with slug:", slug);
          
          // Find matching doc
          docs.forEach(d => {
            console.log(`Checking doc: name=${d.name}, path=${d.path}, filename=${d.filename}`);
            if (d.path === '/docs/' + slug || d.name.toLowerCase() === slug.toLowerCase()) {
              console.log("Found matching doc:", d.filename);
              docFile = d.filename;
              docFound = true;
            }
          });
          
          if (!docFound) {
            console.log("No matching doc found for slug:", slug);
          }
        }
        
        console.log("Loading document:", docFile);
        setCurrentDoc(docFile);
        
        // Get the content from the API
        const response = await fetch(`/api/docs?file=${docFile}`);
        if (response.ok) {
          const content = await response.text();
          setMarkdown(content);
        } else {
          console.error("Failed to load document:", docFile);
          setError('Documentation not found');
          setMarkdown('# Documentation Not Found\n\nThe requested documentation could not be found.');
        }
      } catch (error) {
        console.error('Error loading documentation:', error);
        setError('Error loading documentation');
        setMarkdown('# Error Loading Documentation\n\nThere was an error loading the documentation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (!docsLoading) {
      loadDoc();
    }
  }, [router.asPath, docs, docsLoading]); // Reload when route changes or docs list loads

  // Render loading state
  if (docsLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 mt-4">Documentation</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 mt-4">Documentation</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h3 className="text-lg font-medium mb-4">Documents</h3>
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc.name}>
                  <a 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Directly load the document without changing the URL
                      loadDocumentDirectly(doc.filename);
                      // Update the URL for bookmarking capability
                      window.history.pushState({}, doc.title, doc.path);
                    }}
                    className={`block py-1 px-2 rounded transition-colors ${
                      currentDoc === doc.filename
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Documentation content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="prose max-w-none docs-content">
              <ReactMarkdown>
                {markdown}
              </ReactMarkdown>
            </div>
            
            <style jsx global>{`
              .docs-content h1, .docs-content h2, .docs-content h3, 
              .docs-content h4, .docs-content h5, .docs-content h6 {
                margin-top: 1.5em;
                margin-bottom: 0.75em;
                padding-bottom: 0.3em;
              }
              
              .docs-content h1 {
                border-bottom: 1px solid #eaecef;
                padding-bottom: 0.3em;
              }
              
              .docs-content h2 {
                border-bottom: 1px solid #eaecef;
                padding-bottom: 0.3em;
              }
              
              .docs-content pre {
                padding: 16px;
                margin-bottom: 16px;
              }
              
              .docs-content ul, .docs-content ol {
                padding-left: 2em;
                margin-bottom: 16px;
              }
              
              .docs-content p {
                margin-bottom: 16px;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}