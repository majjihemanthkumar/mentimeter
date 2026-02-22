// models/Session.js
// In-memory session store for LivePoll

const { generateCode } = require('../utils/codeGenerator');
const { v4: uuidv4 } = require('uuid');

// In-memory store
const sessions = new Map();

class Session {
    constructor(name, presenterSocketId) {
        this.id = uuidv4();
        this.code = generateCode(new Set([...sessions.keys()]));
        this.name = name || 'Untitled Session';
        this.presenterSocketId = presenterSocketId;
        this.createdAt = new Date();
        this.activities = [];
        this.currentActivityIndex = -1;
        this.participants = new Map(); // socketId -> { id, name }
        this.isActive = true;
    }

    addActivity(activity) {
        const newActivity = {
            id: uuidv4(),
            type: activity.type, // 'poll', 'quiz', 'wordcloud', 'qa'
            question: activity.question || '',
            options: activity.options || [],
            correctAnswer: activity.correctAnswer ?? null,
            responses: [],
            words: [],
            questions: [],
            isOpen: false,
            createdAt: new Date()
        };
        this.activities.push(newActivity);
        return newActivity;
    }

    getActivity(activityId) {
        return this.activities.find(a => a.id === activityId);
    }

    getCurrentActivity() {
        if (this.currentActivityIndex >= 0 && this.currentActivityIndex < this.activities.length) {
            return this.activities[this.currentActivityIndex];
        }
        return null;
    }

    nextActivity() {
        // Close current activity
        const current = this.getCurrentActivity();
        if (current) current.isOpen = false;

        // Move to next
        if (this.currentActivityIndex < this.activities.length - 1) {
            this.currentActivityIndex++;
            const next = this.getCurrentActivity();
            if (next) next.isOpen = true;
            return next;
        }
        return null;
    }

    previousActivity() {
        const current = this.getCurrentActivity();
        if (current) current.isOpen = false;

        if (this.currentActivityIndex > 0) {
            this.currentActivityIndex--;
            const prev = this.getCurrentActivity();
            if (prev) prev.isOpen = true;
            return prev;
        }
        return null;
    }

    launchActivity(index) {
        // Close current
        const current = this.getCurrentActivity();
        if (current) current.isOpen = false;

        if (index >= 0 && index < this.activities.length) {
            this.currentActivityIndex = index;
            const activity = this.getCurrentActivity();
            if (activity) activity.isOpen = true;
            return activity;
        }
        return null;
    }

    submitPollVote(activityId, socketId, optionIndex, participantName) {
        const activity = this.getActivity(activityId);
        if (!activity || activity.type !== 'poll') return null;

        // Remove previous vote from this user
        activity.responses = activity.responses.filter(r => r.socketId !== socketId);
        activity.responses.push({ socketId, optionIndex, participantName, time: new Date() });
        return this.getPollResults(activityId);
    }

    submitQuizAnswer(activityId, socketId, optionIndex, participantName) {
        const activity = this.getActivity(activityId);
        if (!activity || activity.type !== 'quiz') return null;

        // Check if already answered
        const existing = activity.responses.find(r => r.socketId === socketId);
        if (existing) return null;

        const isCorrect = optionIndex === activity.correctAnswer;
        activity.responses.push({
            socketId,
            optionIndex,
            participantName,
            isCorrect,
            time: new Date()
        });

        return {
            isCorrect,
            results: this.getQuizResults(activityId)
        };
    }

    submitWord(activityId, socketId, word, participantName) {
        const activity = this.getActivity(activityId);
        if (!activity || activity.type !== 'wordcloud') return null;

        activity.words.push({ socketId, word: word.trim(), participantName, time: new Date() });
        return this.getWordCloudResults(activityId);
    }

    submitQuestion(activityId, socketId, questionText, participantName) {
        const activity = this.getActivity(activityId);
        if (!activity || activity.type !== 'qa') return null;

        const question = {
            id: uuidv4(),
            socketId,
            text: questionText.trim(),
            participantName,
            upvotes: new Set(),
            upvoteCount: 0,
            time: new Date()
        };
        activity.questions.push(question);
        return this.getQAResults(activityId);
    }

    upvoteQuestion(activityId, questionId, socketId) {
        const activity = this.getActivity(activityId);
        if (!activity || activity.type !== 'qa') return null;

        const question = activity.questions.find(q => q.id === questionId);
        if (!question) return null;

        if (question.upvotes.has(socketId)) {
            question.upvotes.delete(socketId);
        } else {
            question.upvotes.add(socketId);
        }
        question.upvoteCount = question.upvotes.size;
        return this.getQAResults(activityId);
    }

    getPollResults(activityId) {
        const activity = this.getActivity(activityId);
        if (!activity) return null;

        const results = activity.options.map((opt, i) => {
            const voters = activity.responses.filter(r => r.optionIndex === i);
            return {
                option: opt,
                votes: voters.length,
                voterNames: voters.map(v => v.participantName)
            };
        });
        return { activityId, type: 'poll', question: activity.question, results, totalVotes: activity.responses.length };
    }

    getQuizResults(activityId) {
        const activity = this.getActivity(activityId);
        if (!activity) return null;

        const results = activity.options.map((opt, i) => ({
            option: opt,
            count: activity.responses.filter(r => r.optionIndex === i).length,
            isCorrect: i === activity.correctAnswer
        }));
        const correctCount = activity.responses.filter(r => r.isCorrect).length;

        // Build leaderboard for this quiz
        const leaderboard = activity.responses.map(r => ({
            name: r.participantName,
            isCorrect: r.isCorrect,
            answeredOption: activity.options[r.optionIndex] || '?',
            correctOption: activity.options[activity.correctAnswer] || '?',
            answeredAt: r.time
        }));
        // Sort: correct first, then by time (fastest first)
        leaderboard.sort((a, b) => {
            if (a.isCorrect !== b.isCorrect) return b.isCorrect - a.isCorrect;
            return new Date(a.answeredAt) - new Date(b.answeredAt);
        });

        return {
            activityId, type: 'quiz', question: activity.question,
            results, totalAnswers: activity.responses.length,
            correctCount, correctAnswer: activity.correctAnswer,
            correctOption: activity.options[activity.correctAnswer] || '?',
            leaderboard
        };
    }

    getWordCloudResults(activityId) {
        const activity = this.getActivity(activityId);
        if (!activity) return null;

        // Count word frequency
        const wordMap = {};
        activity.words.forEach(w => {
            const word = w.word.toLowerCase();
            wordMap[word] = (wordMap[word] || 0) + 1;
        });

        const words = Object.entries(wordMap).map(([text, count]) => ({ text, count }));
        words.sort((a, b) => b.count - a.count);

        return { activityId, type: 'wordcloud', question: activity.question, words, totalSubmissions: activity.words.length };
    }

    getQAResults(activityId) {
        const activity = this.getActivity(activityId);
        if (!activity) return null;

        const questions = activity.questions.map(q => ({
            id: q.id,
            text: q.text,
            participantName: q.participantName,
            upvoteCount: q.upvoteCount,
            time: q.time
        }));
        questions.sort((a, b) => b.upvoteCount - a.upvoteCount);

        return { activityId, type: 'qa', question: activity.question, questions, totalQuestions: activity.questions.length };
    }

    addParticipant(socketId, name) {
        this.participants.set(socketId, { id: socketId, name: name || 'Anonymous', joinedAt: new Date() });
        return this.participants.size;
    }

    removeParticipant(socketId) {
        this.participants.delete(socketId);
        return this.participants.size;
    }

    getParticipantCount() {
        return this.participants.size;
    }

    getParticipantList() {
        return Array.from(this.participants.values()).map(p => ({
            name: p.name,
            joinedAt: p.joinedAt
        }));
    }

    getOverallLeaderboard() {
        // Aggregate scores across all quiz activities
        const scoreMap = {};
        this.activities.filter(a => a.type === 'quiz').forEach(activity => {
            activity.responses.forEach(r => {
                if (!scoreMap[r.participantName]) {
                    scoreMap[r.participantName] = { correct: 0, total: 0 };
                }
                scoreMap[r.participantName].total++;
                if (r.isCorrect) scoreMap[r.participantName].correct++;
            });
        });
        const leaderboard = Object.entries(scoreMap).map(([name, data]) => ({
            name, correct: data.correct, total: data.total,
            accuracy: data.total > 0 ? Math.round(data.correct / data.total * 100) : 0
        }));
        leaderboard.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);
        return leaderboard;
    }

    toJSON() {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            createdAt: this.createdAt,
            currentActivityIndex: this.currentActivityIndex,
            participantCount: this.participants.size,
            activityCount: this.activities.length,
            isActive: this.isActive,
            activities: this.activities.map(a => ({
                id: a.id,
                type: a.type,
                question: a.question,
                options: a.options,
                isOpen: a.isOpen,
                responseCount: a.type === 'qa' ? a.questions.length :
                    a.type === 'wordcloud' ? a.words.length :
                        a.responses.length
            }))
        };
    }
}

// Session store functions
function createSession(name, presenterSocketId) {
    const session = new Session(name, presenterSocketId);
    sessions.set(session.code, session);
    return session;
}

function getSession(code) {
    return sessions.get(code) || null;
}

function getSessionBySocketId(socketId) {
    for (const [, session] of sessions) {
        if (session.presenterSocketId === socketId) return session;
        if (session.participants.has(socketId)) return session;
    }
    return null;
}

function deleteSession(code) {
    return sessions.delete(code);
}

function getAllSessionCodes() {
    return new Set(sessions.keys());
}

module.exports = {
    createSession,
    getSession,
    getSessionBySocketId,
    deleteSession,
    getAllSessionCodes
};
