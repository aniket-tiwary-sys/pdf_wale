import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonLoader: React.FC = () => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-full h-96 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-dark-700 dark:via-dark-800 dark:to-dark-700 rounded-xl"
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="space-y-4">
      <SkeletonLoader />
      <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/2" />
    </div>
  );
};
