import { Metadata } from 'next';

// This file contains custom type declarations for Next.js

declare module 'next' {
  export interface PageProps {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}
