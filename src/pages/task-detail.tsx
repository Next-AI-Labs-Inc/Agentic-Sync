import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

/**
 * Compatibility component for redirecting from legacy task-detail?id=X URLs to new /task/[id] URLs
 * This ensures bookmarks and any hardcoded URLs continue to work while we transition
 * to the new URL structure.
 * 
 * Uses Next.js router.replace for client-side redirection without adding to browser history.
 */
export default function TaskDetailRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Get the first ID if it's an array (shouldn't happen with normal usage)
      const taskId = Array.isArray(id) ? id[0] : id;
      
      // Use router.replace to avoid adding to browser history
      // This prevents users from having to click back twice
      router.replace(`/task/${taskId}`, undefined, { shallow: false });
    }
  }, [id, router]);

  // Get the task ID for the link
  const taskId = id ? (Array.isArray(id) ? id[0] : id) : '';

  return (
    <>
      <Head>
        <title>Redirecting... | IX Tasks</title>
        {/* Add canonical URL to help search engines */}
        {taskId && <link rel="canonical" href={`/task/${taskId}`} />}
      </Head>
      
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-2">Redirecting to new task URL...</h2>
          <p className="text-gray-500">This page has moved to a new URL format.</p>
          
          {taskId && (
            <div className="mt-4">
              <Link 
                href={`/task/${taskId}`}
                className="text-blue-600 hover:underline"
              >
                Click here if you're not redirected automatically
              </Link>
            </div>
          )}
          
          {/* Improved loading animation */}
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                 style={{animation: 'progressBarAnimation 2s ease-in-out infinite'}}>
            </div>
          </div>
        </div>
      </div>

      {/* Add global styles for animation */}
      <style jsx global>{`
        @keyframes progressBarAnimation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

/**
 * Server-side redirect for bots and initial load
 * This provides an immediate redirect for search engines and initial page loads
 */
export async function getServerSideProps(context) {
  const { id } = context.query;
  
  if (id) {
    return {
      redirect: {
        destination: `/task/${Array.isArray(id) ? id[0] : id}`,
        permanent: true, // This is a permanent redirect (301)
      },
    };
  }
  
  return {
    props: {}, // Return empty props if no ID is found
  };
}