import { motion } from 'framer-motion';

const Loader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <motion.div
      className="w-10 h-10 border-3 border-burgundy/20 border-t-burgundy rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

export default Loader;
