import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, User, ChevronRight, Loader2 } from 'lucide-react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

const Join = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');

    const handleJoin = async (e) => {
        e.preventDefault();
        if (code.length !== 6) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/session/${code}`);
            const data = await res.json();

            if (data.exists) {
                navigate(`/audience/${code}?name=${encodeURIComponent(name)}`);
            } else {
                alert('Session not found. Please check your code.');
            }
        } catch (err) {
            alert('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <motion.button
                whileHover={{ x: -5 }}
                onClick={() => navigate('/')}
                className="absolute top-10 left-10 flex items-center gap-2 text-textSecondary hover:text-primary transition-colors font-bold"
            >
                <ArrowLeft size={20} /> Back
            </motion.button>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-clay">
                        🔗
                    </div>
                    <h1 className="text-3xl font-black text-textPrimary tracking-tight">Join Session</h1>
                    <p className="text-textSecondary mt-2 font-medium">Enter the code to participate</p>
                </div>

                <ClayCard className="p-8">
                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-textSecondary uppercase tracking-wider ml-1">Session Code</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-black text-xl tracking-[0.5em]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-textSecondary uppercase tracking-wider ml-1">Your Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <ClayButton
                            variant="secondary"
                            className="w-full py-4 text-lg mt-4"
                            disabled={isLoading || code.length !== 6}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>Join Now <ChevronRight size={20} /></>
                            )}
                        </ClayButton>
                    </form>
                </ClayCard>
            </div>
        </div>
    );
};

export default Join;
