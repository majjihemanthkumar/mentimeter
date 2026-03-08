import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    History,
    Settings,
    PlusCircle,
    LogOut,
    ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', active: true },
        { icon: History, label: 'Past Sessions', active: false },
        { icon: Settings, label: 'Settings', active: false },
    ];

    return (
        <aside className={`
      fixed left-0 top-0 h-full z-40 transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      w-72 p-6
    `}>
            <div className="h-full bg-white shadow-clay rounded-clay flex flex-col p-6 border border-white/50">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl font-bold">
                        🧠
                    </div>
                    <span className="text-xl font-bold text-textPrimary">incu<span className="text-primary">Xai</span></span>
                </div>

                <nav className="flex-1 space-y-4">
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ x: 5 }}
                            className={`
                flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors
                ${item.active ? 'bg-primary text-white shadow-lg' : 'text-textSecondary hover:bg-gray-100'}
              `}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span className="font-semibold">{item.label}</span>
                            </div>
                            {item.active && <ChevronRight size={16} />}
                        </motion.div>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <button className="w-full flex items-center gap-3 p-4 text-textSecondary hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
