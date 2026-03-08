import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

const Audience = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('waiting'); // waiting, voting, feedback
    const [activity, setActivity] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    // Mock dynamic activity for UI design purposes
    useEffect(() => {
        // In real app, this would be socket-driven
        setTimeout(() => {
            setActivity({
                type: 'quiz',
                question: 'Which of these is a key principle of Claymorphism?',
                options: ['Flat surfaces', 'Sharp corners', 'Soft rounded shapes', 'Dark background only'],
                timeLimit: 15
            });
            setStatus('voting');
        }, 3000);
    }, []);

    const handleSubmit = (index) => {
        setSelectedOption(index);
        setStatus('feedback');
    };

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-white/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">🧠</div>
                    <span className="font-bold">incuXai</span>
                </div>
                <div className="px-4 py-2 bg-white shadow-clay rounded-2xl text-xs font-bold text-primary">
                    ROOM: {code}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {status === 'waiting' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 bg-white shadow-clay rounded-clay flex items-center justify-center mx-auto text-4xl animate-bounce">
                            ⏳
                        </div>
                        <h2 className="text-2xl font-bold">Waiting for host...</h2>
                        <p className="text-textSecondary">The next activity will appear here automatically.</p>
                    </motion.div>
                )}

                {status === 'voting' && activity && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg space-y-8"
                    >
                        <ClayCard className="text-center">
                            <h2 className="text-2xl font-extrabold mb-4">{activity.question}</h2>
                            {activity.timeLimit > 0 && (
                                <div className="flex items-center justify-center gap-2 text-secondary font-bold">
                                    <Clock size={18} /> {activity.timeLimit}s remaining
                                </div>
                            )}
                        </ClayCard>

                        <div className="grid grid-cols-1 gap-4">
                            {activity.options.map((opt, i) => (
                                <ClayButton
                                    key={i}
                                    variant="white"
                                    className="py-6 text-lg justify-start px-8 group"
                                    onClick={() => handleSubmit(i)}
                                >
                                    <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                </ClayButton>
                            ))}
                        </div>
                    </motion.div>
                )}

                {status === 'feedback' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 w-full max-w-md"
                    >
                        <div className="w-24 h-24 bg-success shadow-clay rounded-clay flex items-center justify-center mx-auto text-4xl text-white">
                            <CheckCircle2 size={48} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-extrabold">Got it!</h2>
                            <p className="text-textSecondary text-lg">Your response has been recorded.</p>
                        </div>
                        <ClayCard className="bg-primary/10 border-primary/20">
                            <p className="font-bold text-primary">Waiting for the results to be revealed...</p>
                        </ClayCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ad Bar Mockup */}
            <div className="fixed bottom-6 left-6 right-6 h-16 bg-white shadow-clay rounded-clay flex items-center justify-center overflow-hidden">
                <div className="text-xs font-black text-gray-300 tracking-widest uppercase">
                    Premium Ads • incuXai Pro • Join Now • Interactive Fun •
                </div>
            </div>
        </div>
    );
};

export default Audience;
