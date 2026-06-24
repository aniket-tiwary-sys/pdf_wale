import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  count?: number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const PremiumSkeleton: React.FC<SkeletonProps> = ({
  className,
  count = 1,
  variant = 'text',
}) => {
  const skeletons = Array.from({ length: count });

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'h-10 w-10 rounded-full',
    rectangular: 'h-32 rounded-lg',
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {skeletons.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={clsx(
            'bg-gray-200 dark:bg-gray-800',
            variantClasses[variant]
          )}
        />
      ))}
    </div>
  );
};
