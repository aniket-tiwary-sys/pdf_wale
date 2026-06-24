import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';

export const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Why Local Processing Matters',
      excerpt: 'Understanding the importance of client-side document processing...',
      author: 'PDF Wala Team',
      date: 'March 15, 2024',
      readTime: 5,
      category: 'Privacy',
    },
    {
      id: 2,
      title: 'Getting Started with PDF Wala',
      excerpt: 'A beginner\'s guide to using PDF Wala tools effectively...',
      author: 'Sarah Chen',
      date: 'March 10, 2024',
      readTime: 8,
      category: 'Tutorial',
    },
    {
      id: 3,
      title: 'The Future of Document Processing',
      excerpt: 'Exploring emerging technologies in PDF processing...',
      author: 'John Smith',
      date: 'March 1, 2024',
      readTime: 12,
      category: 'Technology',
    },
  ];

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
              Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tips, tricks, and insights about document processing
            </p>
          </motion.div>

          <div className="space-y-8">
            {blogPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-sm font-semibold rounded-full mb-4">
                      {post.category}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>

                  <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                    📄
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
