// Frågor
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
let lobbyId = "";
let isHost = false;

function createLobby() {
  lobbyId = document.getElementById("lobby-id").value.trim();
  playerName = document.getElementById("player-name").value.trim();
  if (!lobbyId || !playerName) return alert("Skriv namn och lobby!");

  isHost = true;
  document.getElementById("start-button-wrapper").style.display = "block";
  const lobbyRef = window.dbRef(db, `lobbies/${lobbyId}`);

  window.dbSet(lobbyRef, {
    host: playerName,
    started: false
  }).then(() => {
    const playersRef = window.dbRef(db, `lobbies/${lobbyId}/players`);
    window.dbPush(playersRef, { name: playerName });

    document.getElementById("lobby-screen").style.display = "none";
    document.getElementById("waiting-screen").style.display = "block";

    listenForStart();
    listenForPlayers();
    checkIfHost();
  });
}

function joinLobby() {
  lobbyId = document.getElementById("lobby-id").value.trim();
  playerName = document.getElementById("player-name").value.trim();
  if (!lobbyId || !playerName) return alert("Skriv namn och lobby!");

  const lobbyRef = window.dbRef(db, `lobbies/${lobbyId}`);

  window.dbGet(lobbyRef).then(snapshot => {
    if (!snapshot.exists()) {
      alert("Lobbyn finns inte. Be värden skapa den först.");
      return;
    }

    const lobbyData = snapshot.val();

    // 🔐 Kontrollera om användaren är host
    if (lobbyData.host === playerName) {
      isHost = true;
      document.getElementById("start-button-wrapper").style.display = "block";
    }

    // Lägg till spelaren i listan
    window.dbPush(window.dbRef(db, `lobbies/${lobbyId}/players`), { name: playerName });

    // Visa vänteskärmen
    document.getElementById("lobby-screen").style.display = "none";
    document.getElementById("waiting-screen").style.display = "block";

    listenForStart();
    listenForPlayers();

  });
}


function checkIfHost() {
  const hostRef = window.dbRef(db, `lobbies/${lobbyId}/host`);
  window.dbGet(hostRef).then(snapshot => {
    const hostName = snapshot.val();
    if (hostName === playerName) {
      document.getElementById("start-button-wrapper").style.display = "block";
    } else {
      document.getElementById("start-button-wrapper").style.display = "none";
    }
  });
}

function startLobbyQuiz() {
  const lobbyRef = window.dbRef(db, `lobbies/${lobbyId}/started`);
  window.dbSet(lobbyRef, true);
}

function listenForStart() {
  const startRef = window.dbRef(db, `lobbies/${lobbyId}/started`);
  window.dbOnValue(startRef, snapshot => {
    if (snapshot.val() === true) {
      document.getElementById("waiting-screen").style.display = "none";
      document.getElementById("quiz-screen").style.display = "block";
      showQuestion();
    }
  });
}

function listenForPlayers() {
  const playersRef = window.dbRef(db, `lobbies/${lobbyId}/players`);
  const listDiv = document.getElementById("player-list");

  // Uppdatera spelarlistan
  window.dbOnValue(playersRef, snapshot => {
    const players = snapshot.val();
    listDiv.innerHTML = "<h3>Spelare i lobbyn:</h3>";

    if (players) {
      Object.values(players).forEach(player => {
        const p = document.createElement("p");
        p.textContent = player.name;
        listDiv.appendChild(p);
      });
    }

    // 🔍 Hämta host och visa startknapp om du är värd
    const lobbyMetaRef = window.dbRef(db, `lobbies/${lobbyId}/host`);
    window.dbGet(lobbyMetaRef).then(hostSnapshot => {
      const hostName = hostSnapshot.val();
      const startButtonWrapper = document.getElementById("start-button-wrapper");

      if (hostName === playerName) {
        startButtonWrapper.style.display = "block";
      } else {
        startButtonWrapper.style.display = "none";
      }
    });
  });
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

function saveScore() {
  const leaderboardRef = window.dbRef(db, "leaderboard");
  window.dbPush(leaderboardRef, {
    name: playerName,
    score: score,
    timestamp: Date.now()
  });
}

function showLeaderboard() {
  const leaderboardRef = window.dbRef(db, "leaderboard");

  window.dbGet(leaderboardRef).then(snapshot => {
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
  document.getElementById("lobby-screen").style.display = "block";
}

// Globala funktioner
window.createLobby = createLobby;
window.joinLobby = joinLobby;
window.startLobbyQuiz = startLobbyQuiz;
window.restart = restart;
