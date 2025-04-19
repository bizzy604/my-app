'use client';

// This file contains client-side only utilities for document handling
// We've moved browser-specific functionality to isolated components
// to prevent 'self is not defined' errors during build

// Note: The downloadDocument function has been moved to the document-downloader component
// which is dynamically imported with { ssr: false } to ensure it only runs client-side

/**
 * Format file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}

/**
 * Format date in a human-readable format
 */
export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString();
}
