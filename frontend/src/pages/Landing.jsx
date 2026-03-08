import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, MessageSquare, BarChart, ChevronRight, Globe, Zap, Shield } from 'lucide-react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        { icon: Zap, title: 'Instant Delivery', desc: 'Real-time updates as participants respond.', color: 'text-yellow-500' },
        { icon: Users, title: 'Massive Scale', desc: 'Support for thousands of concurrent users.', color: 'text-blue-500' },
        { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade security for your data.', color: 'text-green-500' },
    ];

    return (
        <div className="min-h-screen bg-background text-textPrimary overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-clay">
                        🧠
                    </div>
                    <span className="text-xl font-bold">incu<span className="text-primary">Xai</span></span>
                </div>
                <div className="flex gap-4">
                    <ClayButton variant="white" onClick={() => navigate('/login')} className="hidden md:flex">Sign In</ClayButton>
                    <ClayButton variant="primary" onClick={() => navigate('/dashboard')}>Get Started</ClayButton>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 container mx-auto text-center relative">
                {/* Floating Background Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-20 left-10 w-24 h-24 bg-primary/10 rounded-clay blur-xl -z-10"
                />
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity }}
                    className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-clay blur-xl -z-10"
                />

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
                >
                    Make Your <br />
                    <span className="text-primary">Presentations</span> <span className="text-secondary">Interactive</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-textSecondary max-w-2xl mx-auto mb-12"
                >
                    Create live polls, quizzes, and Q&A sessions that engage your audience in real-time.
                    Premium Claymorphism design for a premium experience.
                </motion.p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <ClayButton
                        variant="primary"
                        className="px-10 py-5 text-lg"
                        onClick={() => navigate('/dashboard')}
                    >
                        Create Presentation <Rocket size={20} className="ml-2" />
                    </ClayButton>
                    <ClayButton
                        variant="white"
                        className="px-10 py-5 text-lg"
                        onClick={() => navigate('/join')}
                    >
                        Join Session <ChevronRight size={20} className="ml-2" />
                    </ClayButton>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <ClayCard key={i} className="text-left p-8">
                            <div className="w-14 h-14 bg-white shadow-clay rounded-2xl flex items-center justify-center mb-6">
                                <f.icon size={28} className={f.color} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                            <p className="text-textSecondary leading-relaxed">{f.desc}</p>
                        </ClayCard>
                    ))}
                </div>
            </section>

            {/* Demo/Visual Section */}
            <section className="py-20 px-6 container mx-auto">
                <ClayCard className="bg-gradient-to-br from-primary to-secondary p-1 overflow-hidden">
                    <div className="bg-white rounded-[24px] p-8 md:p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">Trusted by Creators Worldwide</h2>
                        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                            {/* Logo Placeholders */}
                            <span className="text-2xl font-black">LOGO 1</span>
                            <span className="text-2xl font-black">LOGO 2</span>
                            <span className="text-2xl font-black">LOGO 3</span>
                            <span className="text-2xl font-black">LOGO 4</span>
                        </div>
                    </div>
                </ClayCard>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 mt-20">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">🧠</div>
                        <span className="text-lg font-bold">incuXai</span>
                    </div>
                    <p className="text-textSecondary text-sm mb-6">© 2026 incuXai. All rights reserved.</p>
                    <div className="flex justify-center gap-6 text-textSecondary">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
