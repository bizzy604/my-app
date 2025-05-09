/// <reference types="next" />

// This file contains custom type declarations to fix Next.js 15 type issues

declare namespace NodeJS {
  interface ProcessEnv extends Dict<string> {}
}

// Fix for Next.js 15 PageProps type issues with dynamic routes
declare module 'next' {
  export interface PageProps {
    params: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}

// Extend the Next.js types
declare module 'next/dist/server/app-render/entry-base' {
  export interface PageProps {
    params: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}
