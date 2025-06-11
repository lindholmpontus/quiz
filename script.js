// 👇 Dina quizfrågor direkt i koden
const questions = [
  {
    question: "Vad heter huvudpersonen i 'Die Hard'?",
    options: ["John Rambo", "John McClane", "James Bond", "Ethan Hunt"],
    answer: "John McClane"
  },
  {
    question: "Vilken dryck passar bäst till en svensexa?",
    options: ["Mjölk", "Whisky", "Saft", "Soppa"],
    answer: "Whisky"
  },
  {
    question: "Hur många hål har en standard golfbana?",
    options: ["9", "12", "18", "20"],
    answer: "18"
  }
];

let currentQuestion = 0;
let score = 0;
let playerName = "";

function startQuiz() {
  playerName = document.getElementById("player-name").value.trim();
  if (!playerName) return alert("Skriv ditt namn!");

  document.getElementById("name-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display = "block";
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question-container").textContent = q.question;

  const optionsDiv = document.getElementById("options-container");
  optionsDiv.innerHTML = "";
  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correct = questions[currentQuestion].answer;
  const buttons = document.querySelectorAll("#options-container button");

  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.style.backgroundColor = "lightgreen";
    } else if (btn.textContent === selected) {
      btn.style.backgroundColor = "salmon";
    }
  });

  if (selected === correct) score++;

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      showQuestion();
    } else {
      endQuiz();
    }
  }, 1500);
}

function endQuiz() {
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  document.getElementById("score").textContent = `${playerName}: ${score} poäng`;

  saveScore();
  showLeaderboard();
}

// 🔥 Spara till Firebase
function saveScore() {
  const leaderboardRef = dbRef(db, "leaderboard");
  dbPush(leaderboardRef, {
    name: playerName,
    score: score,
    timestamp: Date.now()
  });
}

// 🔥 Hämta från Firebase och visa topp 5
function showLeaderboard() {
  const leaderboardRef = dbRef(db, "leaderboard");

  dbGet(leaderboardRef).then(snapshot => {
    const data = snapshot.val();
    const list = document.getElementById("leaderboard");
    list.innerHTML = "";

    if (data) {
      const entries = Object.values(data).sort((a, b) => b.score - a.score);
      entries.slice(0, 5).forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score}`;
        list.appendChild(li);
      });
    }
  });
}

function restart() {
  currentQuestion = 0;
  score = 0;
  document.getElementById("player-name").value = "";
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("name-screen").style.display = "block";
}

// 👇 Gör funktionerna globala så de funkar med onclick i HTML
window.startQuiz = startQuiz;
window.restart = restart;
