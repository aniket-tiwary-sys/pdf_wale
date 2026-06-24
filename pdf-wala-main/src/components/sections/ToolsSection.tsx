import React from 'react';
import { motion } from 'framer-motion';
import { TOOL_CATEGORIES, TOOLS } from '../../constants';
import { Card, CardBody } from '../common/Card';
import { Link } from 'react-router-dom';

export const ToolsSection: React.FC = () => {
  const categories = Object.entries(TOOL_CATEGORIES);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Powerful Tools for Every Task
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            20+ tools to handle all your PDF and document needs
          </p>
        </motion.div>

        {categories.map(([categoryKey, categoryName], categoryIdx) => (
          <div key={categoryKey} className="mb-16">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold mb-8 text-gray-900 dark:text-white"
            >
              {categoryName}
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOOLS.filter((t) => t.category === categoryKey).map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link to={tool.enabled ? tool.path : '#'}>
                    <Card
                      className={`h-full ${
                        !tool.enabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <CardBody className="p-6 space-y-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                          {tool.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {tool.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {tool.description}
                          </p>
                        </div>
                        {!tool.enabled && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                            Coming Soon
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
