
const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");

const pvpBtn = document.getElementById("pvpBtn");
const computerBtn = document.getElementById("computerBtn");
const difficultyBox = document.getElementById("difficultyBox");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const symbolBtns = document.querySelectorAll(".symbol-btn");
const startBtn = document.getElementById("startBtn");

const homeBtn = document.getElementById("homeBtn");
const closeBtn = document.getElementById("closeBtn");
const soundBtn = document.getElementById("soundBtn");

const cells = document.querySelectorAll(".cell");

const turnText = document.getElementById("turnText");
const resultText = document.getElementById("resultText");
const resultSubText = document.getElementById("resultSubText");
const resultIcon = document.getElementById("resultIcon");

const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const playerX = document.getElementById("playerX");
const playerO = document.getElementById("playerO");

const playerXName = document.getElementById("playerXName");
const playerOName = document.getElementById("playerOName");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const highScore = document.getElementById("highScore");

const modeText = document.getElementById("modeText");

const gameOverOverlay = document.getElementById("gameOverOverlay");
const gameOverIcon = document.getElementById("gameOverIcon");
const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverMessage = document.getElementById("gameOverMessage");
const playAgainBtn = document.getElementById("playAgainBtn");
const closeGameBtn = document.getElementById("closeGameBtn");

let gameMode = "pvp";
let difficulty = "easy";
let humanSymbol = "X";
let computerSymbol = "O";

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", ""];
let gameActive = false;
let soundEnabled = true;

let scores = {
    X: 0,
    O: 0,
    draw: 0
};

const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

pvpBtn.addEventListener("click", () => {

    gameMode = "pvp";

    pvpBtn.classList.add("selected");
    computerBtn.classList.remove("selected");

    difficultyBox.style.display = "none";
});

computerBtn.addEventListener("click", () => {

    gameMode = "computer";

    computerBtn.classList.add("selected");
    pvpBtn.classList.remove("selected");

    difficultyBox.style.display = "block";
});

difficultyBtns.forEach(button => {

    button.addEventListener("click", () => {

        difficultyBtns.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        difficulty = button.dataset.level;
    });
});

symbolBtns.forEach(button => {

    button.addEventListener("click", () => {

        symbolBtns.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        humanSymbol = button.dataset.symbol;
        computerSymbol = humanSymbol === "X" ? "O" : "X";
    });
});

startBtn.addEventListener("click", startGame);

function startGame() {

    startScreen.style.display = "none";
    gameContainer.classList.add("show");
    gameOverOverlay.classList.remove("show");

    modeText.textContent =
        gameMode === "pvp"
            ? "Player vs Player"
            : `Player vs Computer • ${capitalize(difficulty)}`;

    if (gameMode === "computer") {

        playerXName.textContent =
            humanSymbol === "X" ? "You" : "Computer";

        playerOName.textContent =
            humanSymbol === "O" ? "You" : "Computer";

    } else {

        playerXName.textContent = "Player X";
        playerOName.textContent = "Player O";
    }

    clearBoard();
}

cells.forEach((cell, index) => {

    cell.addEventListener("click", () => {

        if (!gameActive) {
            return;
        }

        if (gameMode === "computer" && currentPlayer !== humanSymbol) {
            return;
        }

        makeMove(index);
    });
});

function makeMove(index) {

    if (!gameActive || board[index] !== "") {
        return;
    }

    board[index] = currentPlayer;

    updateCell(index, currentPlayer);

    playSound("move");

    const winner = getWinner();

    if (winner) {
        finishGame(winner);
        return;
    }

    if (!board.includes("")) {
        finishDraw();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    updateTurn();

    if (
        gameMode === "computer" &&
        currentPlayer === computerSymbol &&
        gameActive
    ) {
        setTimeout(computerMove, 450);
    }
}

function computerMove() {

    if (!gameActive) {
        return;
    }

    let move;

    if (difficulty === "easy") {
        move = randomMove();
    }

    if (difficulty === "medium") {
        move = Math.random() < 0.55
            ? bestMove()
            : randomMove();
    }

    if (difficulty === "hard") {
        move = bestMove();
    }

    if (move !== undefined) {
        makeMove(move);
    }
}

function randomMove() {

    const available = [];

    board.forEach((value, index) => {

        if (value === "") {
            available.push(index);
        }
    });

    if (available.length === 0) {
        return;
    }

    return available[Math.floor(Math.random() * available.length)];
}

function bestMove() {

    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            board[i] = computerSymbol;

            const score = minimax(board, 0, false);

            board[i] = "";

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

function minimax(state, depth, isMaximizing) {

    const result = checkState(state);

    if (result !== null) {

        if (result === computerSymbol) {
            return 10 - depth;
        }

        if (result === humanSymbol) {
            return depth - 10;
        }

        return 0;
    }

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < state.length; i++) {

            if (state[i] === "") {

                state[i] = computerSymbol;

                const score = minimax(state, depth + 1, false);

                state[i] = "";

                bestScore = Math.max(bestScore, score);
            }
        }

        return bestScore;

    } else {

        let bestScore = Infinity;

        for (let i = 0; i < state.length; i++) {

            if (state[i] === "") {

                state[i] = humanSymbol;

                const score = minimax(state, depth + 1, true);

                state[i] = "";

                bestScore = Math.min(bestScore, score);
            }
        }

        return bestScore;
    }
}

function getWinner() {

    return winningPatterns.find(([a, b, c]) => {

        return board[a] &&
            board[a] === board[b] &&
            board[a] === board[c];

    });
}

function checkState(state) {

    for (const [a, b, c] of winningPatterns) {

        if (
            state[a] &&
            state[a] === state[b] &&
            state[a] === state[c]
        ) {
            return state[a];
        }
    }

    if (!state.includes("")) {
        return "draw";
    }

    return null;
}

function finishGame(pattern) {

    gameActive = false;

    scores[currentPlayer]++;

    updateScores();

    pattern.forEach(index => {
        cells[index].classList.add("winner");
    });

    if (gameMode === "computer" && currentPlayer === humanSymbol) {

        resultIcon.textContent = "🏆";
        resultText.textContent = "You Win!";
        resultSubText.textContent = "Congratulations!";

        gameOverIcon.textContent = "🏆";
        gameOverTitle.textContent = "You Win!";
        gameOverMessage.textContent = "Congratulations! You won this round.";

    } else {

        resultIcon.textContent = "🏆";
        resultText.textContent = `Player ${currentPlayer} Wins!`;
        resultSubText.textContent = "Great move!";

        gameOverIcon.textContent = "🏆";
        gameOverTitle.textContent = `Player ${currentPlayer} Wins!`;
        gameOverMessage.textContent = "Great move!";

    }

    turnText.textContent = "Game Over";

    playSound("win");

    setTimeout(() => {
        gameOverOverlay.classList.add("show");
    }, 500);
}

function finishDraw() {

    gameActive = false;

    scores.draw++;

    updateScores();

    resultIcon.textContent = "🤝";
    resultText.textContent = "It's a Draw!";
    resultSubText.textContent = "No winner this round.";

    turnText.textContent = "Game Over";

    gameOverIcon.textContent = "🤝";
    gameOverTitle.textContent = "It's a Draw!";
    gameOverMessage.textContent = "Nobody won this round.";

    playSound("draw");

    setTimeout(() => {
        gameOverOverlay.classList.add("show");
    }, 400);
}

function updateCell(index, symbol) {

    cells[index].textContent =
        symbol === "X" ? "✕" : "○";

    cells[index].classList.add(
        symbol === "X" ? "x" : "o"
    );
}

function updateTurn() {

    turnText.textContent = `${currentPlayer}'s Turn`;

    playerX.classList.toggle(
        "active",
        currentPlayer === "X"
    );

    playerO.classList.toggle(
        "active",
        currentPlayer === "O"
    );

    if (gameMode === "computer") {

        if (currentPlayer === humanSymbol) {
            turnText.textContent = "Your Turn";
        } else {
            turnText.textContent = "Computer's Turn";
        }
    }
}

function updateScores() {

    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;

    highScore.textContent = Math.max(scores.X, scores.O);
}

restartBtn.addEventListener("click", clearBoard);

function clearBoard() {

    board = ["", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;

    gameOverOverlay.classList.remove("show");

    cells.forEach(cell => {

        cell.textContent = "";
        cell.classList.remove("x", "o", "winner");

    });

    resultIcon.textContent = "🎮";
    resultText.textContent = "Game Ready";
    resultSubText.textContent = "Make your move";

    updateTurn();

    if (
        gameMode === "computer" &&
        currentPlayer === computerSymbol
    ) {
        setTimeout(computerMove, 450);
    }
}

resetScoreBtn.addEventListener("click", () => {

    scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    updateScores();
    clearBoard();
});

homeBtn.addEventListener("click", () => {

    gameContainer.classList.remove("show");
    startScreen.style.display = "flex";
    gameOverOverlay.classList.remove("show");
    gameActive = false;
});

closeBtn.addEventListener("click", () => {

    gameContainer.classList.remove("show");
    startScreen.style.display = "flex";
    gameOverOverlay.classList.remove("show");
    gameActive = false;
});

closeGameBtn.addEventListener("click", () => {

    gameOverOverlay.classList.remove("show");
    gameContainer.classList.remove("show");
    startScreen.style.display = "flex";
    gameActive = false;
});

playAgainBtn.addEventListener("click", () => {

    gameOverOverlay.classList.remove("show");
    clearBoard();
});

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent =
        soundEnabled ? "🔊" : "🔇";
});

function playSound(type) {

    if (!soundEnabled) {
        return;
    }

    const audioContext =
        new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    if (type === "move") {
        oscillator.frequency.value = 420;
    }

    if (type === "win") {
        oscillator.frequency.value = 700;
    }

    if (type === "draw") {
        oscillator.frequency.value = 250;
    }

    gain.gain.setValueAtTime(0.06, audioContext.currentTime);

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.15
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.15
    );
}

function capitalize(value) {

    return value.charAt(0).toUpperCase() + value.slice(1);
}

difficultyBox.style.display = "none";

updateScores();

