import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

interface DocFile {
  name: string;
  title: string;
  path: string;
}

export default function DocsPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentDoc, setCurrentDoc] = useState<string>('');
  const [docs, setDocs] = useState<DocFile[]>([
    { name: 'index', title: 'Documentation Home', path: '/docs' },
    // Temporarily disabled sub-docs due to routing issues
    // TODO: Fix sub-document routing before re-enabling
    // { name: 'ENHANCED_UI_GUIDE', title: 'Enhanced UI Guide', path: '/docs/enhanced-ui' },
    // { name: 'SOCIAL_MEDIA_LIKE_EXPERIENCE', title: 'Social Media-Like UX', path: '/docs/social-ux' },
    // { name: 'using-tasks', title: 'Using Tasks', path: '/docs/using-tasks' },
    // { name: 'initiatives-guide', title: 'Working with Initiatives', path: '/docs/initiatives' },
    // { name: 'kpi-tracking', title: 'KPI Tracking', path: '/docs/kpis' },
  ]);

  // Function to map routes to doc files
  const getDocFileName = (path: string): string => {
    switch (path) {
      case '/docs/enhanced-ui':
        return 'ENHANCED_UI_GUIDE.md';
      case '/docs/social-ux':
        return 'SOCIAL_MEDIA_LIKE_EXPERIENCE.md';
      case '/docs/using-tasks':
        return 'using-tasks.md';
      case '/docs/initiatives':
        return 'initiatives-guide.md';
      case '/docs/kpis':
        return 'kpi-tracking.md';
      default:
        return 'index.md';
    }
  };

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      
      try {
        // Only load the index document for now to avoid routing issues
        const docFile = 'index.md';
        setCurrentDoc(docFile);
        
        // Get the content directly without a server fetch to improve speed
        const response = await fetch(`/api/docs?file=${docFile}`);
        if (response.ok) {
          const content = await response.text();
          setMarkdown(content);
        } else {
          setMarkdown('# Documentation Not Found\n\nThe requested documentation could not be found.');
        }
      } catch (error) {
        console.error('Error loading documentation:', error);
        setMarkdown('# Error Loading Documentation\n\nThere was an error loading the documentation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDoc();
    // Remove router.pathname dependency to prevent reloading on route changes
  }, []);

  // Render loading state
  if (loading) {
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="text-lg font-medium mb-4">Documentation</h3>
              <ul className="space-y-2">
                {docs.map((doc) => (
                  <li key={doc.name}>
                    <Link 
                      href={doc.path}
                      className={`block py-1 px-2 rounded transition-colors ${
                        getDocFileName(router.pathname) === (doc.name === 'index' ? 'index.md' : `${doc.name}.md`)
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