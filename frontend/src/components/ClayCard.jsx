import React from 'react';
import { motion } from 'framer-motion';

const ClayCard = ({ children, className = "", bgColor = "bg-card" }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`clay-card ${bgColor} p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default ClayCard;
