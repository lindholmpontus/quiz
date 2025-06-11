let questions = [];
let currentQuestion = 0;
let score = 0;
let playerName = "";

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
  });

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

  // Vänta 1.5 sek innan nästa fråga visas
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

function saveScore() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({ name: playerName, score });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function showLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";
  leaderboard.slice(0, 5).forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

function restart() {
  currentQuestion = 0;
  score = 0;
  document.getElementById("player-name").value = "";
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("name-screen").style.display = "block";
}
