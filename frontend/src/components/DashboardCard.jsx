import React from 'react';
import ClayCard from './ClayCard';

const DashboardCard = ({ icon: Icon, title, value, bgColor, textColor = "text-white" }) => {
    return (
        <ClayCard bgColor={bgColor} className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon size={24} className={textColor} />
            </div>
            <div>
                <h3 className={`text-sm font-medium opacity-80 ${textColor}`}>{title}</h3>
                <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            </div>
        </ClayCard>
    );
};

export default DashboardCard;
