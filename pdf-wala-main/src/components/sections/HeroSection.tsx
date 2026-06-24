import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

export const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="min-h-screen pt-20 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="space-y-8">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold leading-tight"
            >
              <span className="text-gray-900 dark:text-white">
                Professional PDF & Document
              </span>
              <br />
              <span className="gradient-text">Toolkit</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-xl"
            >
              Process, convert, edit, and secure your documents with our powerful tools. Everything happens locally on your device.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/tools">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Tools
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-8 pt-4">
              {[
                { icon: '🔒', label: 'Privacy First' },
                { icon: '⚡', label: 'Lightning Fast' },
                { icon: '∞', label: 'Unlimited Files' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Floating Cards */}
          <div className="relative h-96 md:h-full min-h-96">
            {[
              { rotation: -15, x: -30, y: -50, icon: FileText, delay: 0 },
              { rotation: 15, x: 50, y: 20, icon: Zap, delay: 0.2 },
              { rotation: -8, x: 0, y: 100, icon: Lock, delay: 0.4 },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  className="absolute"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [card.rotation - 5, card.rotation + 5, card.rotation - 5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    delay: card.delay,
                  }}
                  style={{
                    left: `${card.x}px`,
                    top: `${card.y}px`,
                  }}
                >
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6 shadow-xl w-32 h-32 flex items-center justify-center">
                    <Icon className="w-16 h-16 opacity-80" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200 to-transparent dark:from-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-200 to-transparent dark:from-secondary-900/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
};
