import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoading = () => {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center w-full"
      role="status"
      aria-label="Loading content"
    >
      <Loader2 className="w-12 h-12 animate-spin text-fun-yellow" />
    </div>
  );
};

export default PageLoading;
