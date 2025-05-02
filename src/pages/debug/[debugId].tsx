import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export const getServerSideProps = async (context) => {
  const { debugId } = context.params;
  
  console.log('DEBUG ROUTE SSR - getServerSideProps called', { 
    params: context.params,
    debugId,
    requestUrl: context.req.url,
    query: context.query,
    resolvedUrl: context.resolvedUrl
  });
  
  return {
    props: {
      debugId,
      debug: {
        path: `/debug/${debugId}`,
        fetchTime: new Date().toISOString(),
        params: context.params
      }
    }
  };
};

export default function DebugDynamicRoute({ debugId, debug }) {
  const router = useRouter();
  
  // Log when component mounts and when router is ready
  useEffect(() => {
    console.log('Debug route component mounted with router state:', {
      debugId, // From server props
      query: router.query, // From client router
      isReady: router.isReady,
      asPath: router.asPath,
      pathname: router.pathname
    });
  }, [router.isReady, debugId]);
  
  return (
    <>
      <Head>
        <title>Debug Dynamic Route | IX Projects</title>
        <meta name="description" content="Debug dynamic routing" />
      </Head>
      
      <div className="mb-6">
        <Link 
          href="/route-test" 
          className="text-primary-600 hover:underline mb-4 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Route Test
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Debug Dynamic Route</h1>
        <p className="text-gray-600">Debug ID: {debugId}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">New Dynamic Route Test</h2>
        <p className="mb-2">This is a new debug dynamic route to test if our routing fix works properly.</p>
        <p className="mb-4">The URL parameter <strong>debugId</strong> is: <code className="bg-gray-100 px-2 py-1 rounded">{debugId}</code></p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Router State</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              query: router.query,
              pathname: router.pathname,
              asPath: router.asPath,
              isReady: router.isReady
            }, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Server Props</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button 
            onClick={() => router.push(`/task/${debugId}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Task Route
          </button>
          
          <button 
            onClick={() => router.push(`/test/${debugId}`)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Test Route
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Navigation Tests</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Navigation Methods</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/debug/via-link" className="bg-blue-100 px-3 py-1 rounded hover:bg-blue-200">
                Via Link
              </Link>
              <button 
                onClick={() => router.push('/debug/via-router')}
                className="bg-green-100 px-3 py-1 rounded hover:bg-green-200"
              >
                Via router.push
              </button>
              <button 
                onClick={() => router.push('/debug/via-location')}
                className="bg-purple-100 px-3 py-1 rounded hover:bg-purple-200"
              >
                Via router.push
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}