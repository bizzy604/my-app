// This file contains custom type declarations for Next.js App Router

// Augment the Next.js module with our custom types
declare module 'next/dist/server/app-render/entry-base' {
  // Define the PageProps interface that Next.js expects
  export interface PageProps {
    params: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}

// Ensure TypeScript recognizes dynamic route params
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
