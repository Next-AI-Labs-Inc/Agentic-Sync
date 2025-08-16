import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  
  // Redirect to tasks page - this makes /tasks the home page
  useEffect(() => {
    router.push('/tasks');
  }, [router]);
  
  return (
    <>
      <Head>
        <title>IX Tasks</title>
        <meta name="description" content="IX Tasks - AI-Native Task Management Platform" />
      </Head>
      
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirecting to tasks...</p>
      </div>
    </>
  );
}