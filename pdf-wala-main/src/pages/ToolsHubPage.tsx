import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { TOOLS, TOOL_CATEGORIES } from '../constants';
import { Card, CardBody } from '../components/common/Card';
import { Link } from 'react-router-dom';

export const ToolsHubPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categories = Object.entries(TOOL_CATEGORIES);
  const filteredTools = selectedCategory
    ? TOOLS.filter((t) => t.category === selectedCategory)
    : TOOLS;

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              All Tools
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explore our complete collection of PDF and document tools
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-12 justify-center"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-dark-700 dark:text-white'
              }`}
            >
              All Tools
            </button>
            {categories.map(([key, name]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900 dark:bg-dark-700 dark:text-white'
                }`}
              >
                {name}
              </button>
            ))}
          </motion.div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool, idx) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={tool.path}>
                  <Card>
                    <CardBody className="p-6 space-y-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {tool.description}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
