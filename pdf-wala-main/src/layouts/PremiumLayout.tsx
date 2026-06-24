import React from 'react';
import { motion } from 'framer-motion';
import { FloatingParticles, ScrollProgress } from '../common/AnimationComponents';
import { Header } from './Header';
import { Footer } from './Footer';

interface PremiumLayoutProps {
  children: React.ReactNode;
  showParticles?: boolean;
  showScrollProgress?: boolean;
}

export const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  showParticles = true,
  showScrollProgress = true,
}) => {
  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {showScrollProgress && <ScrollProgress />}
      {showParticles && <FloatingParticles />}
      
      <Header />
      
      <main className="relative z-10">
        {children}
      </main>
      
      <Footer />
    </motion.div>
  );
};
