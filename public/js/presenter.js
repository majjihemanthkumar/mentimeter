// js/presenter.js — Presenter Dashboard Logic
// Handles session creation, activity management, and real-time results

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // ─── State ───
    let sessionCode = null;
    let currentType = 'poll';
    let activities = [];
    let currentActivityIndex = -1;

    // ─── DOM Elements ───
    const createModal = document.getElementById('createModal');
    const createForm = document.getElementById('createForm');
    const presenterLayout = document.getElementById('presenterLayout');
    const roomCodeEl = document.getElementById('roomCode');
    const pCountEl = document.getElementById('pCount');
    const activityForm = document.getElementById('activityForm');
    const questionInput = document.getElementById('questionInput');
    const optionsList = document.getElementById('optionsList');
    const optionsContainer = document.getElementById('optionsContainer');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const activityList = document.getElementById('activityList');
    const mainContent = document.getElementById('mainContent');
    const emptyState = document.getElementById('emptyState');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsType = document.getElementById('resultsType');
    const resultsQuestion = document.getElementById('resultsQuestion');
    const resultsContent = document.getElementById('resultsContent');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const endSessionBtn = document.getElementById('endSessionBtn');
    const themeToggle = document.getElementById('themeToggle');

    // ─── Theme ───
    const savedTheme = localStorage.getItem('livepoll-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('livepoll-theme', next);
        themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
    });

    // ─── Create Session ───
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('sessionName').value.trim();

        socket.emit('create-session', { name }, (res) => {
            if (res.success) {
                sessionCode = res.session.code;
                roomCodeEl.textContent = sessionCode;
                document.title = `LivePoll — ${name}`;

                createModal.classList.add('hidden');
                presenterLayout.classList.remove('hidden');
                showToast(`Session "${name}" created! Code: ${sessionCode}`);
            }
        });
    });

    // ─── Copy Room Code ───
    roomCodeEl.addEventListener('click', () => {
        navigator.clipboard.writeText(sessionCode).then(() => {
            showToast('Room code copied to clipboard! 📋');
        });
    });

    // ─── Activity Type Tabs ───
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.getAttribute('data-type');
            updateFormForType(currentType);
        });
    });

    function updateFormForType(type) {
        // Reset form
        questionInput.value = '';
        const placeholders = {
            poll: 'Ask your audience something...',
            quiz: 'Ask a question with a correct answer...',
            wordcloud: 'What comes to mind when you think of...',
            qa: 'Topic for Q&A (e.g., "Any questions about the project?")'
        };
        questionInput.placeholder = placeholders[type] || '';

        // Show/hide options
        if (type === 'wordcloud' || type === 'qa') {
            optionsContainer.classList.add('hidden');
        } else {
            optionsContainer.classList.remove('hidden');
            resetOptions(type);
        }
    }

    function resetOptions(type) {
        optionsList.innerHTML = '';
        addOptionRow('Option 1', type);
        addOptionRow('Option 2', type);
    }

    function addOptionRow(placeholder, type) {
        const div = document.createElement('div');
        div.className = 'option-row';
        const showCorrect = (type || currentType) === 'quiz';
        div.innerHTML = `
            <input type="text" class="input" placeholder="${placeholder}" required>
            <button type="button" class="correct-mark ${showCorrect ? '' : 'hidden'}" title="Mark as correct">✓</button>
            <button type="button" class="remove-option" title="Remove">×</button>
        `;

        // Correct answer toggle
        div.querySelector('.correct-mark').addEventListener('click', (e) => {
            optionsList.querySelectorAll('.correct-mark').forEach(m => m.classList.remove('selected'));
            e.target.classList.add('selected');
        });

        // Remove option
        div.querySelector('.remove-option').addEventListener('click', () => {
            if (optionsList.children.length > 2) {
                div.remove();
            } else {
                showToast('Need at least 2 options');
            }
        });

        optionsList.appendChild(div);
    }

    addOptionBtn.addEventListener('click', () => {
        const count = optionsList.children.length + 1;
        if (count <= 8) {
            addOptionRow(`Option ${count}`, currentType);
        } else {
            showToast('Maximum 8 options allowed');
        }
    });

    // ─── Submit Activity ───
    activityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!sessionCode) return;

        const question = questionInput.value.trim();
        const data = { code: sessionCode, type: currentType, question };

        if (currentType === 'poll' || currentType === 'quiz') {
            const optionInputs = optionsList.querySelectorAll('.input');
            data.options = Array.from(optionInputs).map(i => i.value.trim());

            if (data.options.some(o => !o)) {
                showToast('Please fill in all options');
                return;
            }

            if (currentType === 'quiz') {
                const selectedCorrect = optionsList.querySelector('.correct-mark.selected');
                if (!selectedCorrect) {
                    showToast('Please mark the correct answer ✓');
                    return;
                }
                const rows = Array.from(optionsList.children);
                data.correctAnswer = rows.indexOf(selectedCorrect.parentElement);
            }
        }

        socket.emit('add-activity', data, (res) => {
            if (res.success) {
                activities = res.session.activities;
                renderActivityList();
                activityForm.reset();
                resetOptions(currentType);
                showToast('Activity added! Click it to launch.');
            }
        });
    });

    // ─── Render Activity List ───
    function renderActivityList() {
        activityList.innerHTML = '';
        activities.forEach((activity, index) => {
            const item = document.createElement('div');
            item.className = `activity-item ${index === currentActivityIndex ? 'active' : ''}`;
            item.innerHTML = `
                <span class="activity-type-badge badge-${activity.type}">${getTypeLabel(activity.type)}</span>
                <span class="activity-question">${activity.question}</span>
                <span class="text-sm text-muted">${activity.responseCount || 0}</span>
            `;
            item.addEventListener('click', () => launchActivity(index));
            activityList.appendChild(item);
        });
    }

    function getTypeLabel(type) {
        const labels = { poll: '🗳️ Poll', quiz: '🧠 Quiz', wordcloud: '☁️ Cloud', qa: '❓ Q&A' };
        return labels[type] || type;
    }

    // ─── Launch Activity ───
    function launchActivity(index) {
        socket.emit('launch-activity', { code: sessionCode, index }, (res) => {
            if (res.success) {
                currentActivityIndex = index;
                renderActivityList();
                showResults(res.activity);
            }
        });
    }

    // ─── Show Results ───
    function showResults(activity) {
        emptyState.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        resultsType.textContent = getTypeLabel(activity.type);
        resultsQuestion.textContent = activity.question;

        // Render based on type
        switch (activity.type) {
            case 'poll':
                renderPollResults({ results: activity.options.map(o => ({ option: o, votes: 0 })), totalVotes: 0 });
                break;
            case 'quiz':
                renderQuizResults({ results: activity.options.map((o, i) => ({ option: o, count: 0, isCorrect: i === activity.correctAnswer })), totalAnswers: 0, correctCount: 0 });
                break;
            case 'wordcloud':
                renderWordCloud({ words: [], totalSubmissions: 0 });
                break;
            case 'qa':
                renderQAResults({ questions: [], totalQuestions: 0 });
                break;
        }
    }

    // ─── Poll Bar Chart ───
    function renderPollResults(data) {
        const maxVotes = Math.max(...data.results.map(r => r.votes), 1);
        resultsContent.innerHTML = `
            <div class="poll-chart">
                ${data.results.map(r => `
                    <div class="poll-bar-row">
                        <div class="poll-bar-label">${r.option}</div>
                        <div class="poll-bar-track">
                            <div class="poll-bar-fill" style="width: ${data.totalVotes > 0 ? (r.votes / data.totalVotes * 100) : 0}%">
                                <span class="poll-bar-value">${data.totalVotes > 0 ? Math.round(r.votes / data.totalVotes * 100) : 0}%</span>
                            </div>
                        </div>
                        <div class="poll-bar-count">${r.votes}</div>
                    </div>
                `).join('')}
            </div>
            <p class="text-center text-muted mt-lg">${data.totalVotes} vote${data.totalVotes !== 1 ? 's' : ''}</p>
        `;
    }

    // ─── Quiz Results ───
    function renderQuizResults(data) {
        const maxCount = Math.max(...data.results.map(r => r.count), 1);
        resultsContent.innerHTML = `
            <div class="poll-chart">
                ${data.results.map(r => `
                    <div class="poll-bar-row">
                        <div class="poll-bar-label">${r.option} ${r.isCorrect ? '✅' : ''}</div>
                        <div class="poll-bar-track">
                            <div class="poll-bar-fill ${r.isCorrect ? 'quiz-bar-fill correct' : 'quiz-bar-fill incorrect'}" style="width: ${data.totalAnswers > 0 ? (r.count / data.totalAnswers * 100) : 0}%">
                                <span class="poll-bar-value">${r.count}</span>
                            </div>
                        </div>
                        <div class="poll-bar-count">${r.count}</div>
                    </div>
                `).join('')}
            </div>
            <p class="text-center text-muted mt-lg">
                ${data.correctCount}/${data.totalAnswers} correct (${data.totalAnswers > 0 ? Math.round(data.correctCount / data.totalAnswers * 100) : 0}%)
            </p>
        `;
    }

    // ─── Word Cloud ───
    function renderWordCloud(data) {
        if (data.words.length === 0) {
            resultsContent.innerHTML = `
                <div class="wordcloud-container">
                    <p class="text-muted">Waiting for word submissions...</p>
                </div>
            `;
            return;
        }

        const maxCount = Math.max(...data.words.map(w => w.count));
        const minSize = 1;
        const maxSize = 4;
        const colors = ['#6c5ce7', '#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

        resultsContent.innerHTML = `
            <div class="wordcloud-container">
                ${data.words.map((w, i) => {
            const scale = minSize + (w.count / maxCount) * (maxSize - minSize);
            const color = colors[i % colors.length];
            return `<span class="wordcloud-word" style="font-size:${scale}rem; color:${color}; animation-delay:${i * 0.05}s">${w.text} <sup style="font-size:0.5em; opacity:0.6">${w.count}</sup></span>`;
        }).join('')}
            </div>
            <p class="text-center text-muted mt-lg">${data.totalSubmissions} submission${data.totalSubmissions !== 1 ? 's' : ''}</p>
        `;
    }

    // ─── Q&A Results ───
    function renderQAResults(data) {
        if (data.questions.length === 0) {
            resultsContent.innerHTML = `
                <div class="qa-list">
                    <p class="text-center text-muted" style="padding:40px">Waiting for questions from the audience...</p>
                </div>
            `;
            return;
        }

        resultsContent.innerHTML = `
            <div class="qa-list">
                ${data.questions.map(q => `
                    <div class="qa-item">
                        <div class="qa-upvote-btn">
                            <span class="qa-upvote-icon">▲</span>
                            <span class="qa-upvote-count">${q.upvoteCount}</span>
                        </div>
                        <div class="qa-content">
                            <div class="qa-text">${escapeHtml(q.text)}</div>
                            <div class="qa-meta">by ${escapeHtml(q.participantName)} • ${timeAgo(q.time)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <p class="text-center text-muted mt-lg">${data.totalQuestions} question${data.totalQuestions !== 1 ? 's' : ''}</p>
        `;
    }

    // ─── Navigation ───
    nextBtn.addEventListener('click', () => {
        socket.emit('next-activity', { code: sessionCode }, (res) => {
            if (res.success) {
                currentActivityIndex++;
                activities = res.session.activities;
                renderActivityList();
                showResults(res.activity);
            } else {
                showToast('No more activities');
            }
        });
    });

    prevBtn.addEventListener('click', () => {
        socket.emit('prev-activity', { code: sessionCode }, (res) => {
            if (res.success) {
                currentActivityIndex--;
                activities = res.session.activities;
                renderActivityList();
                showResults(res.activity);
            } else {
                showToast('Already at the beginning');
            }
        });
    });

    // ─── End Session ───
    endSessionBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to end this session?')) {
            socket.emit('end-session', { code: sessionCode }, (res) => {
                if (res.success) {
                    showToast('Session ended');
                    setTimeout(() => window.location.href = '/', 1500);
                }
            });
        }
    });

    // ─── Socket Events ───
    socket.on('participant-joined', (data) => {
        pCountEl.textContent = data.participantCount;
        showToast(`${data.name} joined! 🎉`);
    });

    socket.on('participant-left', (data) => {
        pCountEl.textContent = data.participantCount;
    });

    socket.on('poll-results', (data) => {
        renderPollResults(data);
        updateActivityResponseCount(data.activityId, data.totalVotes);
    });

    socket.on('quiz-results', (data) => {
        renderQuizResults(data);
        updateActivityResponseCount(data.activityId, data.totalAnswers);
    });

    socket.on('wordcloud-results', (data) => {
        renderWordCloud(data);
        updateActivityResponseCount(data.activityId, data.totalSubmissions);
    });

    socket.on('qa-results', (data) => {
        renderQAResults(data);
        updateActivityResponseCount(data.activityId, data.totalQuestions);
    });

    function updateActivityResponseCount(activityId, count) {
        const idx = activities.findIndex(a => a.id === activityId);
        if (idx >= 0) {
            activities[idx].responseCount = count;
            renderActivityList();
        }
    }

    // ─── Helpers ───
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    }

    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Init form for default type
    updateFormForType('poll');
});
