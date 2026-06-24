import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { cardHoverVariants } from '../../utils/animations';

interface PremiumCardProps {
  className?: string;
  hoverable?: boolean;
  glassEffect?: boolean;
  gradient?: boolean;
  children: React.ReactNode;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  className,
  hoverable = true,
  glassEffect = false,
  gradient = false,
  children,
}) => {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="initial"
      whileHover={hoverable ? "hover" : "initial"}
      className={clsx(
        'rounded-xl backdrop-blur-sm transition-all duration-300',
        glassEffect && 'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
        !glassEffect && 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
        gradient && 'bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-indigo-950/30 dark:to-pink-950/30',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
