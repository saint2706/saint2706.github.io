/**
 * @fileoverview Simple page loading component with spinning icon.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Page loading spinner component
 * 
 * Features:
 * - Centered spinner in min-height container
 * - Accessible loading state with aria-label
 * - Respects reduced motion preference (stops animation)
 * - Yellow accent color matching theme
 * 
 * @component
 * @returns {JSX.Element} Loading spinner centered in container
 */
const PageLoading = () => {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center w-full"
      role="status"
      aria-label="Loading content"
    >
      <Loader2 className="w-12 h-12 animate-spin motion-reduce:animate-none text-fun-yellow" />
    </div>
  );
};

export default PageLoading;
