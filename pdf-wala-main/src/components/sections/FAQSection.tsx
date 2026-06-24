import React from 'react';
import { motion } from 'framer-motion';
import { FAQS } from '../../constants';
import { ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions about PDF Wala
          </p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpanded(expanded === faq.id ? null : faq.id)
                }
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: expanded === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: expanded === faq.id ? 'auto' : 0,
                  opacity: expanded === faq.id ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-gray-200 dark:border-dark-700"
              >
                <p className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
