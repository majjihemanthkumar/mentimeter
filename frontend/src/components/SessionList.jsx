import React from 'react';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import ClayCard from './ClayCard';

const SessionList = ({ sessions }) => {
    return (
        <ClayCard className="w-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-textPrimary">Recent Sessions</h2>
                <button className="text-primary font-semibold hover:underline flex items-center gap-1 text-sm">
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {sessions.map((session, index) => (
                    <div
                        key={index}
                        className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${session.color} flex items-center justify-center text-white`}>
                            {session.icon}
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-textPrimary group-hover:text-primary transition-colors">
                                {session.name}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-xs text-textSecondary">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {session.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={12} /> {session.participants} members
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${session.statusColor}`}>
                                {session.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </ClayCard>
    );
};

export default SessionList;
