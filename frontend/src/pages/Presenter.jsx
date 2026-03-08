import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Plus, Play, BarChart2, Settings, Users, ArrowLeft, MoreHorizontal } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

const Presenter = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Mock data for the live view
    const stats = [
        { label: 'Participants', value: '18', icon: Users, color: 'text-primary' },
        { label: 'Responses', value: '12/18', icon: BarChart2, color: 'text-success' },
    ];

    const currentActivity = {
        question: "Which of these is a key principle of Claymorphism?",
        options: [
            { text: "Flat surfaces", count: 0 },
            { text: "Sharp corners", count: 1 },
            { text: "Soft rounded shapes", count: 11, correct: true },
            { text: "Dark background only", count: 0 }
        ]
    };

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <ClayButton variant="white" className="p-3">
                            <ArrowLeft size={20} />
                        </ClayButton>
                        <div>
                            <h1 className="text-2xl font-bold">Live: UI/UX Masterclass</h1>
                            <p className="text-xs text-textSecondary font-bold tracking-widest">SESSION CODE: <span className="text-primary">884-291</span></p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <ClayButton variant="secondary">End Session</ClayButton>
                        <ClayButton variant="primary">Launch Next</ClayButton>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Active Question & Preview */}
                    <div className="lg:col-span-2 space-y-8">
                        <ClayCard className="bg-primary overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center text-center">
                            <div className="absolute top-4 left-4 text-xs font-bold text-white/50 uppercase tracking-widest">Current Activity</div>
                            <h2 className="text-3xl font-black text-white max-w-xl">{currentActivity.question}</h2>
                            <div className="mt-8 px-4 py-2 bg-white/20 rounded-full text-white font-bold text-sm">
                                ⏳ 15s remaining
                            </div>
                        </ClayCard>

                        {/* Live Results Display */}
                        <div className="space-y-4">
                            {currentActivity.options.map((opt, i) => (
                                <ClayCard key={i} className="flex items-center justify-between p-4 group">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-textSecondary uppercase">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold">{opt.text} {opt.correct && "✅"}</span>
                                                <span className="font-black text-primary">{opt.count}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(opt.count / 12) * 100}%` }}
                                                    className={`h-full ${opt.correct ? 'bg-success' : 'bg-primary/30'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ClayCard>
                            ))}
                        </div>
                    </div>

                    {/* Right: Controls & Stats */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((s, i) => (
                                <ClayCard key={i} className="text-center">
                                    <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                                    <div className="text-2xl font-black">{s.value}</div>
                                    <div className="text-[10px] font-bold text-textSecondary uppercase">{s.label}</div>
                                </ClayCard>
                            ))}
                        </div>

                        <ClayCard>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-textSecondary mb-6">Controls</h3>
                            <div className="space-y-4">
                                <ClayButton variant="white" className="w-full justify-start py-4">
                                    <Play size={18} /> Reveal Answer
                                </ClayButton>
                                <ClayButton variant="white" className="w-full justify-start py-4">
                                    <Plus size={18} /> Add Time (+10s)
                                </ClayButton>
                                <ClayButton variant="white" className="w-full justify-start py-4 text-red-500">
                                    <MoreHorizontal size={18} /> More Actions
                                </ClayButton>
                            </div>
                        </ClayCard>

                        <ClayCard className="bg-gradient-to-br from-[#FF8FA3] to-[#FF4B6B] text-white">
                            <h3 className="font-bold mb-2">Presenter Note</h3>
                            <p className="text-xs opacity-90 leading-relaxed">
                                Remember to engage your audience after revealing the correct answer. The engagement is high on this question!
                            </p>
                        </ClayCard>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Presenter;
