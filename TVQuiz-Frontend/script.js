const apiBase = "http://localhost:5000/api";

/* =============================
   GENRES PAGE
============================= */
if (location.pathname.toLowerCase().includes("genres")) {

    const genreList = document.getElementById("genreList");
    const nameInput = document.getElementById("playerName");
    const difficultySelect = document.getElementById("difficulty");

    fetch(`${apiBase}/genre`)
        .then(res => res.json())
        .then(genres => {
            genreList.innerHTML = "";

            genres.forEach(g => {
                const card = document.createElement("div");
                card.className = "genre-card";
                card.innerHTML = `<h3>${g.name}</h3>`;

                card.onclick = () => {

                    // ✅ Save name and difficulty properly
                    const playerName = nameInput.value || "Player";
                    const difficulty = difficultySelect.value;

                    localStorage.setItem("playerName", playerName);
                    localStorage.setItem("selectedDifficulty", difficulty);
                    localStorage.setItem("selectedGenreId", g.id);
                    localStorage.setItem("selectedGenreName", g.name);

                    location.href = "quizzes.html";
                };

                genreList.appendChild(card);
            });
        });
}



/* =============================
   QUIZZES PAGE
============================= */
if (location.pathname.toLowerCase().includes("quizzes")) {

    const quizList = document.getElementById("quizList");
    const genreId = localStorage.getItem("selectedGenreId");

    fetch(`${apiBase}/quiz/byGenre/${genreId}`)
        .then(res => res.json())
        .then(quizzes => {
            quizList.innerHTML = "";

            quizzes.forEach(q => {
                const btn = document.createElement("button");
                btn.className = "quiz-neon-btn";
                btn.textContent = q.title;

                btn.onclick = () => {
                    localStorage.setItem("selectedQuizId", q.id);
                    location.href = "play.html";
                };

                quizList.appendChild(btn);
            });
        });
}



/* =============================
   PLAY PAGE + TIMER
============================= */
if (location.pathname.toLowerCase().includes("play")) {

    const quizId = localStorage.getItem("selectedQuizId");
    const questionBox = document.getElementById("questionBox");
    const timerDisplay = document.getElementById("timerDisplay");

    const playerName = localStorage.getItem("playerName") || "Player";
    const difficulty = localStorage.getItem("selectedDifficulty") || "Easy";

    document.getElementById("showName").textContent = playerName;
    document.getElementById("showDifficulty").textContent = "Difficulty: " + difficulty;

    // ✅ ACCURATE TIMERS
    let timerValue = 120; // Easy
    if (difficulty === "Medium") timerValue = 90;
    if (difficulty === "Hard") timerValue = 60;

    fetch(`${apiBase}/quiz/${quizId}`)
        .then(res => res.json())
        .then(quiz => {

            let index = 0;
            let score = 0;
            let timeLeft = timerValue;
            let timer;

            function startTimer() {
                timerDisplay.style.color = "red";
                timerDisplay.textContent = "Time: " + timeLeft + "s";

                timer = setInterval(() => {
                    timeLeft--;
                    timerDisplay.textContent = "Time: " + timeLeft + "s";

                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        finishQuiz(score, quiz.questions.length);
                    }
                }, 1000);
            }

            function showQuestion() {
                const q = quiz.questions[index];
                questionBox.innerHTML = `<h2>${q.text}</h2>`;

                q.options.forEach(opt => {
                    const btn = document.createElement("button");
                    btn.className = "option-btn";
                    btn.textContent = opt.text;

                    btn.onclick = () => {
                        if (opt.isCorrect) score++;
                        index++;

                        if (index < quiz.questions.length) {
                            showQuestion();
                        } else {
                            clearInterval(timer);
                            finishQuiz(score, quiz.questions.length);
                        }
                    };

                    questionBox.appendChild(btn);
                });
            }

            startTimer();
            showQuestion();
        });
}



/* =============================
   FINISH QUIZ
============================= */
function finishQuiz(score, total) {
    localStorage.setItem("finalScore", score);
    localStorage.setItem("totalQuestions", total);
    location.href = "result.html";
}



/* =============================
   RESULT PAGE
============================= */
if (location.pathname.toLowerCase().includes("result")) {

    const scoreBox = document.getElementById("resultScore");
    const score = localStorage.getItem("finalScore");
    const total = localStorage.getItem("totalQuestions");

    scoreBox.textContent = `You scored ${score} / ${total}`;
}
