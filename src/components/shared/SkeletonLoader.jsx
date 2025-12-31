import React from 'react';

/**
 * Skeleton loader components for loading states
 */

// Base skeleton with pulse animation
const SkeletonBase = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} aria-hidden="true" />
);

// Blog card skeleton
export const BlogSkeleton = () => (
    <div className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
        {/* Header bar */}
        <div className="h-2 bg-gradient-to-r from-slate-700/50 to-slate-600/50" />

        <div className="p-6 flex-grow flex flex-col">
            {/* Source badge and date */}
            <div className="flex justify-between items-start mb-3">
                <SkeletonBase className="h-6 w-16" />
                <SkeletonBase className="h-4 w-24" />
            </div>

            {/* Title */}
            <SkeletonBase className="h-7 w-full mb-2" />
            <SkeletonBase className="h-7 w-3/4 mb-3" />

            {/* Summary */}
            <SkeletonBase className="h-4 w-full mb-2" />
            <SkeletonBase className="h-4 w-full mb-2" />
            <SkeletonBase className="h-4 w-2/3 mb-4" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                <SkeletonBase className="h-6 w-14" />
                <SkeletonBase className="h-6 w-18" />
                <SkeletonBase className="h-6 w-12" />
            </div>

            {/* Link */}
            <div className="mt-auto">
                <SkeletonBase className="h-5 w-28" />
            </div>
        </div>
    </div>
);

// Project card skeleton
export const ProjectSkeleton = () => (
    <div className="bg-secondary/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
        {/* Image placeholder */}
        <SkeletonBase className="h-40 w-full rounded-none" />

        <div className="p-6 flex-grow flex flex-col">
            {/* Title and star */}
            <div className="flex justify-between items-start mb-4">
                <SkeletonBase className="h-7 w-48" />
                <SkeletonBase className="h-4 w-4 rounded-full" />
            </div>

            {/* Description */}
            <SkeletonBase className="h-4 w-full mb-2" />
            <SkeletonBase className="h-4 w-full mb-2" />
            <SkeletonBase className="h-4 w-3/4 mb-6" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                <SkeletonBase className="h-6 w-20" />
                <SkeletonBase className="h-6 w-16" />
                <SkeletonBase className="h-6 w-14" />
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 mt-auto">
                <SkeletonBase className="h-5 w-24" />
                <SkeletonBase className="h-5 w-16" />
            </div>
        </div>
    </div>
);

// Chat message skeleton (typing indicator replacement)
export const ChatSkeleton = () => (
    <div className="flex justify-start">
        <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700 max-w-[80%]">
            <div className="flex items-center gap-2 mb-2">
                <SkeletonBase className="h-3 w-3 rounded-full" />
                <SkeletonBase className="h-3 w-20" />
            </div>
            <SkeletonBase className="h-4 w-48 mb-2" />
            <SkeletonBase className="h-4 w-36" />
        </div>
    </div>
);

export default { BlogSkeleton, ProjectSkeleton, ChatSkeleton };
