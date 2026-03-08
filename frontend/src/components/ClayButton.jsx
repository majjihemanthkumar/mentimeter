import React from 'react';
import { motion } from 'framer-motion';

const ClayButton = ({ children, onClick, className = "", variant = "primary" }) => {
    const variants = {
        primary: "bg-gradient-to-br from-primary to-[#8BAFFF] text-white",
        secondary: "bg-gradient-to-br from-secondary to-[#FFAFB7] text-white",
        success: "bg-gradient-to-br from-success to-[#8FFFEA] text-white",
        white: "bg-white text-textPrimary hover:bg-gray-50",
    };

    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`clay-button px-6 py-3 font-semibold flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default ClayButton;
