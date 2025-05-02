import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export const getServerSideProps = async (context) => {
  const { testId } = context.params;
  
  console.log('TEST ROUTE SSR - getServerSideProps called', { 
    params: context.params,
    testId,
    requestUrl: context.req.url
  });
  
  return {
    props: {
      testId,
      debug: {
        path: `/test/${testId}`,
        fetchTime: new Date().toISOString()
      }
    }
  };
};

export default function TestDynamicRoute({ testId, debug }) {
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>Test Dynamic Route | IX Projects</title>
        <meta name="description" content="Test dynamic routing" />
      </Head>
      
      <div className="mb-6">
        <Link 
          href="/tasks" 
          className="text-primary-600 hover:underline mb-4 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tasks
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Test Dynamic Route</h1>
        <p className="text-gray-600">Test ID: {testId}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dynamic Route Working!</h2>
        <p className="mb-2">This is a test dynamic route page to verify that dynamic routing is working correctly.</p>
        <p className="mb-4">The URL parameter <strong>testId</strong> is: <code className="bg-gray-100 px-2 py-1 rounded">{testId}</code></p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Debug Information</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => router.push(`/task/${testId}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Task Route with this ID
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Test More IDs</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/test/123" className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Test ID: 123</Link>
          <Link href="/test/abc" className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Test ID: abc</Link>
          <Link href="/test/test-id" className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Test ID: test-id</Link>
        </div>
      </div>
    </>
  );
}