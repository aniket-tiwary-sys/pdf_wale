import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Heart, Copy, Check } from 'lucide-react';

export const DonatePage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const cryptoWallets = [
    {
      name: 'SOL',
      title: 'Receive SOL',
      walletAddress: 'A7HRh3zv2boRmDtUQaFq6kqo8KsDvQkNktMo8ooyUic5',
      qrImage: '/qr-sol.png',
    },
    {
      name: 'ETH',
      title: 'Receive ETH',
      walletAddress: '0x1E9D2C0CaC4546D2F0f2a354f8Fe2066B1597857',
      qrImage: '/qr-eth.png',
    },
    {
      name: 'BTC',
      title: 'Receive BTC',
      walletAddress: 'bc1q4el7z9qt73qtmyctayeadw4d5a6z6p249dzl3z',
      qrImage: '/qr-btc.png',
    },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-16 h-16 text-red-500" fill="currentColor" />
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Support PDF Wala
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Help us maintain and improve PDF Wala with crypto donations.
            </p>
          </motion.div>

          {/* Crypto Wallets Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {cryptoWallets.map((crypto, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-8 bg-white dark:bg-dark-800 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  {crypto.title}
                </h2>

                {/* QR Code */}
                <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-center aspect-square">
                  <img 
                    src={crypto.qrImage} 
                    alt={`${crypto.name} QR Code`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Wallet Address */}
                <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Wallet Address:
                  </p>
                  <p className="text-xs font-mono text-gray-900 dark:text-white break-all font-semibold mb-3">
                    {crypto.walletAddress}
                  </p>
                  <button
                    onClick={() => copyToClipboard(crypto.walletAddress, idx)}
                    className="w-full px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Address
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
