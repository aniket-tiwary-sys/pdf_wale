import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      await resetPassword(email);
      setSubmitted(true);
      toast.success('Reset email sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email. Please check your email.');
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-900 dark:via-dark-950 dark:to-dark-900">
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-300/20 dark:bg-primary-900/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-secondary-300/20 dark:bg-secondary-900/10 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 glass p-8 rounded-xl shadow-2xl relative z-10 border border-gray-200/50 dark:border-dark-700/50"
        >
          {!submitted ? (
            <>
              {/* Form Header */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
                  Forgot Password?
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-dark-700 rounded-lg bg-white/50 dark:bg-dark-800/50 text-gray-955 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    loading={isLoading}
                    className="w-full flex justify-center py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
                Check your email
              </h2>
              <p className="mt-4 text-sm text-gray-650 dark:text-gray-300">
                We've sent a password reset link to <strong className="text-gray-900 dark:text-white">{email}</strong>. Please check your inbox and follow the instructions to reset your password.
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-450">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </motion.div>
          )}

          {/* Footer Back Link */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200/50 dark:border-dark-700/50">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-semibold text-primary-650 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};
