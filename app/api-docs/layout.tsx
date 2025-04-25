import React from 'react';
import { getServerAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InnovBid API Documentation',
  description: 'API documentation for the InnovBid procurement system',
};

export default async function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for authenticated user
  const session = await getServerAuthSession();
  
  // If no session, redirect to login
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/api-docs');
  }
  
  return (
    <div className="api-docs-layout">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
