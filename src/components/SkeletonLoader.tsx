import React from "react";

export const TaskSkeleton: React.FC = () => {
  return (
    <div className="relative flex items-start gap-3 rounded-card border border-default bg-surface p-[18px] sm:p-5 shadow-lyra-sm animate-pulse">
      {/* Priority Indicator Skeleton */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gray-200 dark:bg-white/10" />
      
      {/* Checkbox Skeleton */}
      <div className="mt-0.5 h-[20px] w-[20px] shrink-0 rounded-[6px] bg-gray-200 dark:bg-white/10" />
      
      <div className="min-w-0 flex-1 ml-1">
        {/* Title Skeleton */}
        <div className="h-5 w-3/4 rounded-md bg-gray-200 dark:bg-white/10 mb-3" />
        
        {/* Badges Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded-[4px] bg-gray-200 dark:bg-white/10" />
          <div className="h-5 w-20 rounded-pill bg-gray-200 dark:bg-white/10" />
          <div className="ml-auto h-4 w-24 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <TaskSkeleton />
      <TaskSkeleton />
      <TaskSkeleton />
      <TaskSkeleton />
    </div>
  );
};
