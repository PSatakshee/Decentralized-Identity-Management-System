import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { connectMetaMask } from '../lib/web3';

const MetaMaskConnection = ({ onConnected }: { onConnected: () => void }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      setIsConnecting(true);
      const account = await connectMetaMask();
      if (account) {
        onConnected();
      }
      setIsConnecting(false);
    };
    checkConnection();
  }, [onConnected]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-screen"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-t-4 border-blue-500 rounded-full"
      />
      <p className="mt-4 text-lg">Connecting to MetaMask...</p>
    </motion.div>
  );
};

export default MetaMaskConnection;
