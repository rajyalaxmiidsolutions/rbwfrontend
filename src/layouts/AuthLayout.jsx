import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="RBW" className="h-16 w-auto mx-auto mb-4" />
        </div>
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
