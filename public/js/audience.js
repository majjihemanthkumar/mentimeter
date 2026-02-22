// js/audience.js — Audience Participation Logic
// Handles joining sessions and responding to all activity types

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // ─── Get URL Params ───
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const name = params.get('name');

    // Name is mandatory — redirect if missing
    if (!code || !name) {
        window.location.href = '/';
        return;
    }

    // ─── State ───
    let currentActivity = null;
    let hasSubmitted = false;
    let questionStartTime = null;
    let timerInterval = null;

    // ─── DOM Elements ───
    const waitingState = document.getElementById('waitingState');
    const activityArea = document.getElementById('activityArea');
    const submittedState = document.getElementById('submittedState');
    const quizFeedback = document.getElementById('quizFeedback');
    const sessionEnded = document.getElementById('sessionEnded');
    const audienceQuestion = document.getElementById('audienceQuestion');
    const audienceContent = document.getElementById('audienceContent');
    const sessionNameDisplay = document.getElementById('sessionNameDisplay');
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

    // ─── Join Session ───
    socket.emit('join-session', { code, name }, (res) => {
        if (!res.success) {
            alert(res.error || 'Failed to join session');
            window.location.href = '/';
            return;
        }

        sessionNameDisplay.textContent = res.sessionName;
        document.title = `incuXai — ${res.sessionName}`;

        if (res.currentActivity) {
            showActivity(res.currentActivity);
        }
    });

    // ─── Show Activity ───
    function showActivity(activity) {
        currentActivity = activity;
        hasSubmitted = false;
        questionStartTime = null;
        clearTimer();

        // For quizzes with timeLimit, show 5-second countdown first
        if (activity.type === 'quiz' && activity.timeLimit > 0) {
            showCountdown(activity);
        } else {
            displayActivity(activity);
        }
    }

    // ─── 5-Second Countdown ───
    function showCountdown(activity) {
        hideAll();
        activityArea.classList.remove('hidden');
        audienceQuestion.textContent = 'Get Ready!';

        let countdown = 5;
        audienceContent.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <div id="countdownNum" style="font-size:5rem; font-weight:800; color:var(--primary); animation:pulse 1s infinite;">${countdown}</div>
                <p style="color:var(--text-muted); margin-top:12px;">Next question coming up...</p>
            </div>
        `;

        const countdownEl = document.getElementById('countdownNum');
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                displayActivity(activity);
            } else {
                countdownEl.textContent = countdown;
            }
        }, 1000);
    }

    // ─── Display Activity (after countdown) ───
    function displayActivity(activity) {
        hideAll();
        activityArea.classList.remove('hidden');
        audienceQuestion.textContent = activity.question;

        switch (activity.type) {
            case 'poll':
                renderPollOptions(activity);
                break;
            case 'quiz':
                questionStartTime = Date.now();
                renderQuizOptions(activity);
                if (activity.timeLimit > 0) {
                    startTimer(activity.timeLimit);
                }
                break;
            case 'wordcloud':
                renderWordInput(activity);
                break;
            case 'qa':
                renderQAInput(activity);
                break;
        }
    }

    // ─── Timer Display ───
    function startTimer(seconds) {
        let remaining = seconds;

        // Insert timer bar
        const timerHtml = `
            <div id="quizTimerBar" style="width:100%; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:0.85rem; color:var(--text-muted);">⏱️ Time remaining</span>
                    <span id="timerText" style="font-size:1.1rem; font-weight:700; color:var(--primary);">${remaining}s</span>
                </div>
                <div style="width:100%; height:8px; border-radius:4px; background:var(--bg-tertiary); overflow:hidden;">
                    <div id="timerFill" style="width:100%; height:100%; border-radius:4px; background:linear-gradient(90deg, var(--primary), var(--accent)); transition:width 1s linear;"></div>
                </div>
            </div>
        `;
        audienceContent.insertAdjacentHTML('afterbegin', timerHtml);

        timerInterval = setInterval(() => {
            remaining--;
            const timerText = document.getElementById('timerText');
            const timerFill = document.getElementById('timerFill');

            if (timerText) timerText.textContent = remaining + 's';
            if (timerFill) timerFill.style.width = (remaining / seconds * 100) + '%';

            // Color change warnings
            if (remaining <= 5 && timerText) {
                timerText.style.color = '#ef4444';
                if (timerFill) timerFill.style.background = '#ef4444';
            } else if (remaining <= 10 && timerText) {
                timerText.style.color = '#f59e0b';
                if (timerFill) timerFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
            }

            if (remaining <= 0) {
                clearTimer();
                // Auto-submit if not already submitted
                if (!hasSubmitted) {
                    hasSubmitted = true;
                    showSubmitted('⏰ Time\'s up!');
                }
            }
        }, 1000);
    }

    function clearTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // ─── Poll Options ───
    function renderPollOptions(activity) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        audienceContent.innerHTML = `
            <div class="audience-options">
                ${activity.options.map((opt, i) => `
                    <button class="option-btn" data-index="${i}">
                        <span class="option-letter">${letters[i]}</span>
                        <span>${escapeHtml(opt)}</span>
                    </button>
                `).join('')}
            </div>
        `;

        audienceContent.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (hasSubmitted) return;

                // Visual feedback
                audienceContent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                const optionIndex = parseInt(btn.getAttribute('data-index'));
                socket.emit('submit-vote', {
                    code,
                    activityId: currentActivity.id,
                    optionIndex
                });

                hasSubmitted = true;
                setTimeout(() => showSubmitted(), 500);
            });
        });
    }

    // ─── Quiz Options ───
    function renderQuizOptions(activity) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        audienceContent.innerHTML += `
            <div class="audience-options">
                ${activity.options.map((opt, i) => `
                    <button class="option-btn" data-index="${i}">
                        <span class="option-letter">${letters[i]}</span>
                        <span>${escapeHtml(opt)}</span>
                    </button>
                `).join('')}
            </div>
        `;

        audienceContent.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (hasSubmitted) return;
                hasSubmitted = true;
                clearTimer();

                // Visual feedback
                audienceContent.querySelectorAll('.option-btn').forEach(b => {
                    b.style.pointerEvents = 'none';
                });
                btn.classList.add('selected');

                const optionIndex = parseInt(btn.getAttribute('data-index'));
                const responseTimeMs = questionStartTime ? Date.now() - questionStartTime : 25000;

                socket.emit('submit-answer', {
                    code,
                    activityId: currentActivity.id,
                    optionIndex,
                    responseTimeMs
                });
            });
        });
    }

    // ─── Word Cloud Input ───
    function renderWordInput(activity) {
        audienceContent.innerHTML = `
            <div class="word-input-group">
                <input type="text" class="input" id="wordInput" placeholder="Enter a word or phrase..." maxlength="30" autofocus>
                <button class="btn btn-primary" id="submitWordBtn">Send</button>
            </div>
            <p class="text-sm text-muted mt-sm text-center">You can submit multiple words!</p>
            <div id="submittedWords" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; justify-content:center;"></div>
        `;

        const input = document.getElementById('wordInput');
        const btn = document.getElementById('submitWordBtn');
        const submittedWords = document.getElementById('submittedWords');

        function submitWord() {
            const word = input.value.trim();
            if (!word) return;

            socket.emit('submit-word', {
                code,
                activityId: currentActivity.id,
                word
            });

            // Show submitted word
            const tag = document.createElement('span');
            tag.className = 'wordcloud-word';
            tag.style.fontSize = '0.9rem';
            tag.textContent = word;
            submittedWords.appendChild(tag);

            input.value = '';
            input.focus();
        }

        btn.addEventListener('click', submitWord);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitWord();
        });
    }

    // ─── Q&A Input ───
    function renderQAInput(activity) {
        audienceContent.innerHTML = `
            <div class="input-group">
                <textarea class="input" id="questionInput" rows="3" placeholder="Ask a question..." style="resize:vertical;"></textarea>
            </div>
            <button class="btn btn-primary w-full mt-md" id="submitQuestionBtn">Submit Question</button>
            <div class="qa-list mt-lg" id="questionsDisplay"></div>
        `;

        const input = document.getElementById('questionInput');
        const btn = document.getElementById('submitQuestionBtn');

        btn.addEventListener('click', () => {
            const questionText = input.value.trim();
            if (!questionText) return;

            socket.emit('submit-question', {
                code,
                activityId: currentActivity.id,
                question: questionText
            });

            input.value = '';
            showToast('Question submitted! 🙋');
        });
    }

    // ─── Show Submitted State ───
    function showSubmitted(msg) {
        hideAll();
        submittedState.classList.remove('hidden');
        if (msg) {
            submittedState.querySelector('h2').textContent = msg;
        }
    }

    // ─── Hide All States ───
    function hideAll() {
        waitingState.classList.add('hidden');
        activityArea.classList.add('hidden');
        submittedState.classList.add('hidden');
        quizFeedback.classList.add('hidden');
        sessionEnded.classList.add('hidden');
    }

    // ─── Socket Events ───

    // New activity launched by presenter
    socket.on('activity-launched', (activity) => {
        showActivity(activity);
    });

    // Activity closed
    socket.on('activity-closed', () => {
        clearTimer();
        hideAll();
        waitingState.classList.remove('hidden');
    });

    // Quiz feedback (individual)
    socket.on('quiz-feedback', (data) => {
        clearTimer();
        hideAll();
        quizFeedback.classList.remove('hidden');

        const icon = document.getElementById('quizFeedbackIcon');
        const text = document.getElementById('quizFeedbackText');
        const correctAnswerEl = document.getElementById('quizCorrectAnswer');

        if (data.isCorrect) {
            icon.textContent = '✅';
            icon.style.background = 'rgba(34, 197, 94, 0.15)';
            text.textContent = 'Correct! 🎉';
            correctAnswerEl.innerHTML = `<strong style="color:#22c55e;">✅ ${escapeHtml(data.correctOption)}</strong><br><span style="font-size:0.95rem; color:var(--primary); font-weight:700;">+${data.score || 0} points</span>`;
        } else {
            icon.textContent = '❌';
            icon.style.background = 'rgba(239, 68, 68, 0.15)';
            text.textContent = 'Wrong Answer!';
            correctAnswerEl.innerHTML = `The correct answer was: <strong style="color:#22c55e;">${escapeHtml(data.correctOption)}</strong><br><span style="font-size:0.95rem; color:var(--text-muted);">+0 points</span>`;
        }
    });

    // Q&A results (for upvoting from audience)
    socket.on('qa-results', (data) => {
        if (!currentActivity || currentActivity.type !== 'qa') return;

        const display = document.getElementById('questionsDisplay');
        if (!display) return;

        display.innerHTML = data.questions.map(q => `
            <div class="qa-item">
                <button class="qa-upvote-btn" data-qid="${q.id}">
                    <span class="qa-upvote-icon">▲</span>
                    <span class="qa-upvote-count">${q.upvoteCount}</span>
                </button>
                <div class="qa-content">
                    <div class="qa-text">${escapeHtml(q.text)}</div>
                    <div class="qa-meta">by ${escapeHtml(q.participantName)}</div>
                </div>
            </div>
        `).join('');

        // Upvote handlers
        display.querySelectorAll('.qa-upvote-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                socket.emit('upvote-question', {
                    code,
                    activityId: currentActivity.id,
                    questionId: btn.getAttribute('data-qid')
                });
            });
        });
    });

    // Session ended — NO leaderboard by default (presenter controls visibility)
    socket.on('session-ended', () => {
        clearTimer();
        hideAll();
        sessionEnded.classList.remove('hidden');
    });

    // Leaderboard revealed by presenter
    socket.on('leaderboard-reveal', (data) => {
        const leaderboardEl = document.getElementById('finalLeaderboard');
        if (data && data.leaderboard && data.leaderboard.length > 0) {
            leaderboardEl.innerHTML = `
                <h3 style="margin:20px 0 12px; font-size:1.1rem;">🏆 Final Leaderboard</h3>
                <div class="qa-list" style="margin-bottom:20px; text-align:left;">
                    ${data.leaderboard.map((p, i) => `
                        <div class="qa-item" style="padding:12px 16px;">
                            <div style="min-width:32px; font-size:1.1rem; font-weight:700; color:${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-muted)'}">
                                ${i < 3 ? ['🥇', '🥈', '🥉'][i] : '#' + (i + 1)}
                            </div>
                            <div style="flex:1;">
                                <div style="font-weight:600;">${escapeHtml(p.name)}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${p.totalScore} pts — ${p.correct}/${p.total} correct (${p.accuracy}%)</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    });

    // Presenter disconnected
    socket.on('presenter-disconnected', () => {
        showToast('The presenter has disconnected');
    });

    // ─── Helpers ───
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
});
