import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
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

  // Function to get the filename from the current route
  const getCurrentDocFilename = (): string => {
    if (router.pathname === '/docs') {
      return 'index.md';
    }
    
    // Extract the doc name from the path
    const slug = router.pathname.replace('/docs/', '');
    
    // Find matching doc
    const doc = docs.find(d => 
      d.path === router.pathname || 
      d.name.toLowerCase() === slug
    );
    
    return doc ? doc.filename : 'index.md';
  };

  // Load the selected document
  useEffect(() => {
    const loadDoc = async () => {
      if (docsLoading) return; // Wait for docs list to load first
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine which document to load based on the route
        const docFile = getCurrentDocFilename();
        setCurrentDoc(docFile);
        
        // Get the content from the API
        const response = await fetch(`/api/docs?file=${docFile}`);
        if (response.ok) {
          const content = await response.text();
          setMarkdown(content);
        } else {
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
  }, [router.pathname, docs, docsLoading]); // Reload when route changes or docs list loads

  // Render loading state
  if (docsLoading || loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Documentation</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Documentation</h1>
        
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
                    <Link 
                      href={doc.path}
                      className={`block py-1 px-2 rounded transition-colors ${
                        currentDoc === doc.filename
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Documentation content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}