import React from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../utils/animations';
import { Button } from './common/PremiumButton';
import { PremiumCard } from './common/PremiumCard';
import { FileText, Zap, Lock, Sparkles } from 'lucide-react';

export const PremiumHeroSection: React.FC = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'PDF Conversion',
      description: 'Convert between PDF, Word, Excel, and images instantly',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Optimized processing for speed and efficiency',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your documents are processed locally and encrypted',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Powered',
      description: 'Advanced OCR and document analysis',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-indigo-900/20 dark:to-pink-900/20 border border-indigo-200 dark:border-indigo-700">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                  Welcome to PDF Wala
                </span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Powerful PDF
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Professional-grade document processing with AI-powered features. Convert, edit, merge, and transform your documents in seconds.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button
                variant="primary"
                size="lg"
                className="shadow-xl hover:shadow-2xl"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Hero Image / Graphics */}
            <motion.div
              variants={itemVariants}
              className="relative h-96 mt-12"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-3xl" />
              <div className="relative h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-6xl">📄</div>
                  <p className="text-gray-500 dark:text-gray-400">Premium PDF Experience</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            {/* Section Header */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Everything you need
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Professional PDF tools designed for modern workflows
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <PremiumCard glassEffect hoverable className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
