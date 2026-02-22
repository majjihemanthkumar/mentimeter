// server.js — LivePoll Main Server
// Express + Socket.io for real-time interactive presentations

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const {
    createSession,
    getSession,
    getSessionBySocketId,
    deleteSession
} = require('./models/Session');

// --- App Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));
app.use('/api', apiRoutes);

// --- Health Check ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Explicit Page Routes (fallback for deployment) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/presenter', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'presenter.html'));
});

app.get('/audience', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'audience.html'));
});

// --- Socket.io Event Handlers ---
io.on('connection', (socket) => {
    console.log(`✦ User connected: ${socket.id}`);

    // ─── CREATE SESSION ───
    socket.on('create-session', (data, callback) => {
        const session = createSession(data.name || 'Untitled Session', socket.id);
        socket.join(session.code);
        console.log(`✦ Session created: ${session.code} by ${socket.id}`);
        callback({
            success: true,
            session: session.toJSON()
        });
    });

    // ─── JOIN SESSION ───
    socket.on('join-session', (data, callback) => {
        const session = getSession(data.code);
        if (!session) {
            return callback({ success: false, error: 'Session not found' });
        }
        if (!session.isActive) {
            return callback({ success: false, error: 'Session has ended' });
        }

        const participantCount = session.addParticipant(socket.id, data.name);
        socket.join(data.code);
        console.log(`✦ ${data.name || 'Anonymous'} joined session ${data.code}`);

        // Notify presenter about new participant
        io.to(session.presenterSocketId).emit('participant-joined', {
            participantCount,
            name: data.name || 'Anonymous',
            participants: session.getParticipantList()
        });

        // Send current activity to the new participant
        const currentActivity = session.getCurrentActivity();
        callback({
            success: true,
            sessionName: session.name,
            participantCount,
            currentActivity: currentActivity ? {
                id: currentActivity.id,
                type: currentActivity.type,
                question: currentActivity.question,
                options: currentActivity.options,
                isOpen: currentActivity.isOpen
            } : null
        });
    });

    // ─── ADD ACTIVITY ───
    socket.on('add-activity', (data, callback) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) {
            return callback({ success: false, error: 'Unauthorized' });
        }

        const activity = session.addActivity({
            type: data.type,
            question: data.question,
            options: data.options || [],
            correctAnswer: data.correctAnswer ?? null
        });

        console.log(`✦ Activity added: ${data.type} in session ${data.code}`);
        callback({
            success: true,
            activity: {
                id: activity.id,
                type: activity.type,
                question: activity.question,
                options: activity.options,
                isOpen: activity.isOpen
            },
            session: session.toJSON()
        });
    });

    // ─── LAUNCH ACTIVITY ───
    socket.on('launch-activity', (data, callback) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) {
            return callback({ success: false, error: 'Unauthorized' });
        }

        const activity = session.launchActivity(data.index);
        if (!activity) {
            return callback({ success: false, error: 'No activity at that index' });
        }

        console.log(`✦ Launched activity ${data.index}: ${activity.type} in session ${data.code}`);

        // Broadcast to all participants
        socket.to(data.code).emit('activity-launched', {
            id: activity.id,
            type: activity.type,
            question: activity.question,
            options: activity.options,
            isOpen: true
        });

        callback({
            success: true,
            activity: {
                id: activity.id,
                type: activity.type,
                question: activity.question,
                options: activity.options,
                isOpen: true
            }
        });
    });

    // ─── NEXT ACTIVITY ───
    socket.on('next-activity', (data, callback) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) {
            return callback({ success: false, error: 'Unauthorized' });
        }

        const activity = session.nextActivity();
        if (!activity) {
            return callback({ success: false, error: 'No more activities' });
        }

        socket.to(data.code).emit('activity-launched', {
            id: activity.id,
            type: activity.type,
            question: activity.question,
            options: activity.options,
            timeLimit: activity.timeLimit || 0,
            isOpen: true
        });

        callback({
            success: true,
            activity: {
                id: activity.id,
                type: activity.type,
                question: activity.question,
                options: activity.options,
                timeLimit: activity.timeLimit || 0,
                isOpen: true
            },
            session: session.toJSON()
        });
    });

    // ─── PREVIOUS ACTIVITY ───
    socket.on('prev-activity', (data, callback) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) {
            return callback({ success: false, error: 'Unauthorized' });
        }

        const activity = session.previousActivity();
        if (!activity) {
            return callback({ success: false, error: 'Already at the beginning' });
        }

        socket.to(data.code).emit('activity-launched', {
            id: activity.id,
            type: activity.type,
            question: activity.question,
            options: activity.options,
            isOpen: true
        });

        callback({ success: true, activity, session: session.toJSON() });
    });

    // ─── SUBMIT POLL VOTE ───
    socket.on('submit-vote', (data) => {
        const session = getSession(data.code);
        if (!session) return;

        const participant = session.participants.get(socket.id);
        const results = session.submitPollVote(
            data.activityId,
            socket.id,
            data.optionIndex,
            participant ? participant.name : 'Anonymous'
        );

        if (results) {
            // Broadcast updated results to presenter & all
            io.to(data.code).emit('poll-results', results);
        }
    });

    socket.on('submit-answer', (data) => {
        const session = getSession(data.code);
        if (!session) return;

        const participant = session.participants.get(socket.id);
        const result = session.submitQuizAnswer(
            data.activityId,
            socket.id,
            data.optionIndex,
            participant ? participant.name : 'Anonymous',
            data.responseTimeMs || 25000
        );

        if (result) {
            // Get the correct answer option text
            const activity = session.getActivity(data.activityId);
            const correctOption = activity ? activity.options[activity.correctAnswer] : '';

            // Tell the individual: correct/wrong + show correct answer + their score
            socket.emit('quiz-feedback', {
                isCorrect: result.isCorrect,
                correctOption: correctOption,
                score: result.score
            });
            // Broadcast results to presenter only
            io.to(session.presenterSocketId).emit('quiz-results', result.results);
        }
    });

    // ─── SUBMIT WORD (Word Cloud) ───
    socket.on('submit-word', (data) => {
        const session = getSession(data.code);
        if (!session) return;

        const participant = session.participants.get(socket.id);
        const results = session.submitWord(
            data.activityId,
            socket.id,
            data.word,
            participant ? participant.name : 'Anonymous'
        );

        if (results) {
            io.to(data.code).emit('wordcloud-results', results);
        }
    });

    // ─── SUBMIT QUESTION (Q&A) ───
    socket.on('submit-question', (data) => {
        const session = getSession(data.code);
        if (!session) return;

        const participant = session.participants.get(socket.id);
        const results = session.submitQuestion(
            data.activityId,
            socket.id,
            data.question,
            participant ? participant.name : 'Anonymous'
        );

        if (results) {
            io.to(data.code).emit('qa-results', results);
        }
    });

    // ─── UPVOTE QUESTION ───
    socket.on('upvote-question', (data) => {
        const session = getSession(data.code);
        if (!session) return;

        const results = session.upvoteQuestion(data.activityId, data.questionId, socket.id);
        if (results) {
            io.to(data.code).emit('qa-results', results);
        }
    });

    // ─── END SESSION ───
    socket.on('end-session', (data, callback) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) {
            return callback({ success: false, error: 'Unauthorized' });
        }

        session.isActive = false;
        const overallLeaderboard = session.getOverallLeaderboard();

        // Send session ended to audience WITHOUT leaderboard
        // Leaderboard is only shown when presenter clicks 'Show Leaderboard'
        socket.to(data.code).emit('session-ended', { message: 'Session has ended. Thank you!' });

        console.log(`✦ Session ${data.code} ended by presenter.`);
        callback({ success: true, leaderboard: overallLeaderboard });
    });

    // ─── SHOW LEADERBOARD (Presenter broadcasts to audience) ───
    socket.on('show-leaderboard', (data) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) return;

        const leaderboard = session.getOverallLeaderboard();
        // Broadcast to all participants in the room
        io.to(data.code).emit('leaderboard-reveal', { leaderboard });
    });

    // ─── CLOSE ACTIVITY ───
    socket.on('close-activity', (data) => {
        const session = getSession(data.code);
        if (!session || session.presenterSocketId !== socket.id) return;

        const activity = session.getCurrentActivity();
        if (activity) {
            activity.isOpen = false;
            socket.to(data.code).emit('activity-closed', { activityId: activity.id });
        }
    });

    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
        console.log(`✦ User disconnected: ${socket.id}`);

        // Find which session this socket belongs to
        const session = getSessionBySocketId(socket.id);
        if (!session) return;

        if (session.presenterSocketId === socket.id) {
            // Presenter left — notify audience
            io.to(session.code).emit('presenter-disconnected', {
                message: 'The presenter has disconnected.'
            });
        } else {
            // Participant left
            const count = session.removeParticipant(socket.id);
            io.to(session.presenterSocketId).emit('participant-left', {
                participantCount: count,
                participants: session.getParticipantList()
            });
        }
    });
});

// --- Start Server ---
server.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║     🚀  LivePoll Server Running!         ║
  ║                                          ║
  ║     Local:  http://localhost:${PORT}        ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
    `);
});
