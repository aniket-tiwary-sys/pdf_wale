import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';

export const AboutPage: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              About PDF Wala
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Professional PDF and document processing made easy
            </p>
          </motion.div>

          <div className="space-y-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                PDF Wala is on a mission to provide the best, fastest, and most private document
                processing tools available online. We believe in empowering users with powerful
                tools while respecting their privacy. All processing happens locally on your device,
                meaning your documents never leave your computer.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why We Built PDF Wala
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We noticed that most document processing services require you to upload your files
                to their servers. This means your sensitive documents are being processed and stored
                on third-party servers. We wanted to change that.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                PDF Wala processes everything locally in your browser. Your documents stay with you,
                and we respect your privacy completely.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Privacy',
                    description: 'Your data is yours. We never store or upload your files.',
                    icon: '🔒',
                  },
                  {
                    title: 'Speed',
                    description: 'Process documents instantly without waiting for uploads.',
                    icon: '⚡',
                  },
                  {
                    title: 'Simplicity',
                    description: 'Easy-to-use tools that work exactly as you expect.',
                    icon: '✨',
                  },
                ].map((value, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    viewport={{ once: true }}
                    className="p-6 bg-white dark:bg-dark-800 rounded-xl"
                  >
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Technology
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                PDF Wala is built with modern web technologies including React, TypeScript, and
                Vite. We use powerful libraries like PDF.js, pdf-lib, and Tesseract.js to provide
                seamless document processing right in your browser.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                The entire application is built as a Progressive Web App (PWA), meaning you can
                use it offline and even install it on your mobile devices.
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
