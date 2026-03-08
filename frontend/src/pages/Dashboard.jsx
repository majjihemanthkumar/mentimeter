import React, { useState } from 'react';
import {
    Users,
    Activity,
    BarChart3,
    Plus,
    FileText,
    Menu,
    Bell,
    Search
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import SessionList from '../components/SessionList';
import ClayButton from '../components/ClayButton';
import ClayCard from '../components/ClayCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleNewSession = async () => {
        try {
            const res = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'New Interactive Session' })
            });
            const data = await res.json();
            if (data.session) {
                navigate(`/presenter/${data.session.code}`);
            }
        } catch (err) {
            console.error('Failed to create session:', err);
            // Fallback for demo
            navigate('/presenter/DEFAULT');
        }
    };

    const stats = [
        {
            icon: Activity,
            title: 'Active Sessions',
            value: '12',
            bgColor: 'bg-primary',
            textColor: 'text-white'
        },
        {
            icon: Users,
            title: 'Total Participants',
            value: '2,840',
            bgColor: 'bg-secondary',
            textColor: 'text-white'
        },
        {
            icon: BarChart3,
            title: 'Average Engagement',
            value: '84%',
            bgColor: 'bg-success',
            textColor: 'text-white'
        },
    ];

    const recentSessions = [
        {
            name: 'Team Weekly Sync',
            date: 'March 08, 2026',
            participants: 24,
            icon: '💬',
            color: 'bg-blue-400',
            status: 'Completed',
            statusColor: 'bg-green-100 text-green-600'
        },
        {
            name: 'Product Roadmap Review',
            date: 'March 05, 2026',
            participants: 12,
            icon: '🚀',
            color: 'bg-purple-400',
            status: 'Reviewing',
            statusColor: 'bg-yellow-100 text-yellow-600'
        },
        {
            name: 'Design System Hackathon',
            date: 'Feb 28, 2026',
            participants: 56,
            icon: '🎨',
            color: 'bg-pink-400',
            status: 'Draft',
            statusColor: 'bg-gray-100 text-gray-600'
        },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

            <main className="flex-1 lg:ml-72 p-6 lg:p-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-3 bg-white shadow-clay rounded-2xl text-textSecondary"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Dashboard Overview</h1>
                            <p className="text-textSecondary mt-1">Ready to create interactive sessions today?</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                className="bg-white shadow-clay rounded-clay py-3 pl-12 pr-6 w-64 outline-none border border-transparent focus:border-primary/30 transition-all text-sm"
                            />
                        </div>
                        <button className="p-3 bg-white shadow-clay rounded-2xl text-textSecondary relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-12 h-12 bg-gray-200 rounded-2xl shadow-clay border-2 border-white overflow-hidden cursor-pointer">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hemanth" alt="Profile" />
                        </div>
                    </div>
                </header>

                {/* Statistics Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {stats.map((stat, index) => (
                        <DashboardCard key={index} {...stat} />
                    ))}
                </section>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Session List */}
                    <div className="xl:col-span-2">
                        <SessionList sessions={recentSessions} />
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="space-y-8">
                        <ClayCard>
                            <h3 className="text-lg font-bold text-textPrimary mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <ClayButton
                                    variant="primary"
                                    className="w-full py-4 text-sm"
                                    onClick={handleNewSession}
                                >
                                    <Plus size={18} /> New Session
                                </ClayButton>
                                <ClayButton variant="secondary" className="w-full py-4 text-sm">
                                    <FileText size={18} /> View Reports
                                </ClayButton>
                            </div>
                        </ClayCard>

                        <ClayCard bgColor="bg-gradient-to-br from-[#5B8DEF] to-[#A855F7]" className="text-white">
                            <h3 className="text-lg font-bold mb-2">Go Premium!</h3>
                            <p className="text-white/80 text-sm mb-6">Unlock unlimited participants and custom branding features.</p>
                            <ClayButton variant="white" className="w-full py-2 text-xs text-primary font-bold">
                                Upgrade Now
                            </ClayButton>
                        </ClayCard>
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
