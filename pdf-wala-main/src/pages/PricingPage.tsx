import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';

export const PricingPage: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose the perfect plan for your needs
            </p>
          </motion.div>

          {/* Pricing Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-dark-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Premium
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'File Size Limit', free: '50MB', premium: '500MB', business: 'Unlimited' },
                  { feature: 'Processing Speed', free: 'Standard', premium: 'Priority', business: 'Fastest' },
                  { feature: 'All Tools', free: '❌', premium: '✅', business: '✅' },
                  { feature: 'Batch Processing', free: '❌', premium: '✅', business: '✅' },
                  { feature: 'API Access', free: '❌', premium: '❌', business: '✅' },
                  { feature: 'Team Collaboration', free: '❌', premium: '❌', business: '✅' },
                  { feature: 'Support', free: 'Community', premium: 'Email', business: 'Priority' },
                  { feature: 'Monthly Cost', free: 'Free', premium: '$9.99', business: '$49.99' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-dark-700">
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">
                      {row.free}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">
                      {row.premium}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600 dark:text-gray-400">
                      {row.business}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
