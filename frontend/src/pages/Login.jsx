import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <motion.button
                whileHover={{ x: -5 }}
                onClick={() => navigate('/')}
                className="absolute top-10 left-10 flex items-center gap-2 text-textSecondary hover:text-primary transition-colors font-bold"
            >
                <ArrowLeft size={20} /> Back to Home
            </motion.button>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-clay">
                        🧠
                    </div>
                    <h1 className="text-3xl font-black text-textPrimary tracking-tight">Welcome Back</h1>
                    <p className="text-textSecondary mt-2 font-medium">Log in to manage your interactive sessions</p>
                </div>

                <ClayCard className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-textSecondary uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-textSecondary uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot password?</button>
                        </div>

                        <ClayButton
                            variant="primary"
                            className="w-full py-4 text-lg mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
                        </ClayButton>
                    </form>
                </ClayCard>

                <p className="text-center mt-8 text-textSecondary font-medium">
                    Don't have an account? <button className="text-primary font-bold hover:underline">Create one for free</button>
                </p>
            </div>
        </div>
    );
};

export default Login;
