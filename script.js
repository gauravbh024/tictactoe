// Game logic
document.addEventListener('DOMContentLoaded', () => {
    // Create galaxy background
    createGalaxyBackground();
    
    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const status = document.getElementById('status');
    const playerIndicator = document.getElementById('player-indicator');
    const resetBtn = document.getElementById('resetBtn');
    const changeMode = document.getElementById('changeMode');
    const greeting = document.getElementById('greeting');
    const modeSelection = document.getElementById('mode-selection');
    const gameInfo = document.getElementById('game-info');
    const vsComputerBtn = document.getElementById('vsComputerBtn');
    const passNPlayBtn = document.getElementById('passNPlayBtn');
    
    // Game state variables
    let currentPlayer = 'x';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = false;
    let isComputerMode = false;
    
    // Win patterns (row, col, diagonals)
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Create tiles
    function createGameBoard() {
        // Clear previous tiles
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.index = i;
            
            tile.addEventListener('click', () => handleTileClick(i));
            gameBoard.appendChild(tile);
        }
    }
    
    // Handle tile click
    function handleTileClick(index) {
        if (!gameActive || gameState[index] !== '') return;
        
        // Update game state
        makeMove(index);
        
        // Check for win or draw
        if (checkWin()) {
            endGame(false);
        } else if (checkDraw()) {
            endGame(true);
        } else if (isComputerMode && currentPlayer === 'o') {
            // Computer's turn
            setTimeout(() => {
                computerMove();
            }, 700); // Small delay for better experience
        }
    }
    
    // Make a move
    function makeMove(index) {
        // Update game state
        gameState[index] = currentPlayer;
        
        // Update UI
        const tile = document.querySelector(`.tile[data-index="${index}"]`);
        tile.classList.add(currentPlayer);
        
        // Switch player if no win/draw
        if (!checkWin() && !checkDraw()) {
            switchPlayer();
        }
    }
    
    // Computer move
    function computerMove() {
        if (!gameActive) return;
        
        const move = getBestMove();
        makeMove(move);
        
        // Check for win or draw
        if (checkWin()) {
            endGame(false);
        } else if (checkDraw()) {
            endGame(true);
        }
    }
    
    // AI logic to find best move
    function getBestMove() {
        // First, check if computer can win in the next move
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'o';
                const isWin = checkWinWithoutDrawing();
                gameState[i] = ''; // Reset
                
                if (isWin) {
                    return i;
                }
            }
        }
        
        // Second, check if player can win in their next move and block them
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'x';
                const isWin = checkWinWithoutDrawing();
                gameState[i] = ''; // Reset
                
                if (isWin) {
                    return i;
                }
            }
        }
        
        // Third, try to take the center
        if (gameState[4] === '') {
            return 4;
        }
        
        // Fourth, try to take the corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => gameState[i] === '');
        if (availableCorners.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCorners.length);
            return availableCorners[randomIndex];
        }
        
        // Last, take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => gameState[i] === '');
        if (availableEdges.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableEdges.length);
            return availableEdges[randomIndex];
        }
        
        // If no move found (shouldn't happen), pick first available
        return gameState.findIndex(cell => cell === '');
    }
    
    // Check for win without drawing the line
    function checkWinWithoutDrawing() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (
                gameState[a] !== '' &&
                gameState[a] === gameState[b] &&
                gameState[a] === gameState[c]
            ) {
                return true;
            }
        }
        return false;
    }
    
    // Check for win
    function checkWin() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (
                gameState[a] !== '' &&
                gameState[a] === gameState[b] &&
                gameState[a] === gameState[c]
            ) {
                drawWinLine(pattern);
                return true;
            }
        }
        return false;
    }
    
    // Draw win line
    function drawWinLine(pattern) {
        const [a, c] = [pattern[0], pattern[pattern.length - 1]];
        const tileA = document.querySelector(`.tile[data-index="${a}"]`);
        const tileC = document.querySelector(`.tile[data-index="${c}"]`);
        
        // Get positions
        const rectA = tileA.getBoundingClientRect();
        const rectC = tileC.getBoundingClientRect();
        const boardRect = gameBoard.getBoundingClientRect();
        
        // Calculate start point, length and angle
        const startX = rectA.left + rectA.width / 2 - boardRect.left;
        const startY = rectA.top + rectA.height / 2 - boardRect.top;
        const endX = rectC.left + rectC.width / 2 - boardRect.left;
        const endY = rectC.top + rectC.height / 2 - boardRect.top;
        
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        // Create the line
        const line = document.createElement('div');
        line.classList.add('win-line');
        line.style.position = 'absolute';
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        gameBoard.appendChild(line);
    }
    
    // Check for draw
    function checkDraw() {
        return !gameState.includes('');
    }
    
    // Switch player
    function switchPlayer() {
        currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
        
        // Update UI
        status.textContent = `Player ${currentPlayer.toUpperCase()}'s Turn`;
        playerIndicator.classList.toggle('o');
        
        // If it's computer mode and computer's turn
        if (isComputerMode && currentPlayer === 'o') {
            status.textContent = "Computer is thinking...";
        }
    }
    
    // End game
    function endGame(isDraw) {
        gameActive = false;
        
        if (isDraw) {
            status.textContent = "Game Draw!";
            greeting.textContent = "The cosmic forces have reached equilibrium. It's a draw!";
        } else {
            if (isComputerMode && currentPlayer === 'o') {
                status.textContent = "Computer Wins!";
                greeting.textContent = "The cosmic AI has outsmarted you this time!";
            } else {
                status.textContent = `Player ${currentPlayer.toUpperCase()} Wins!`;
                greeting.textContent = `Congratulations Player ${currentPlayer.toUpperCase()}! You've conquered the galaxy!`;
            }
            greeting.classList.add('win-animation');
        }
    }
    
    // Reset game
    function resetGame() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'x';
        
        // Clear the board
        document.querySelectorAll('.tile').forEach(tile => {
            tile.classList.remove('x', 'o');
        });
        
        // Remove win line
        const winLine = document.querySelector('.win-line');
        if (winLine) winLine.remove();
        
        // Update UI
        status.textContent = "Player X's Turn";
        playerIndicator.classList.remove('o');
        greeting.textContent = "New game started! May the cosmic forces be with you.";
        greeting.classList.remove('win-animation');
    }
    
    // Show game mode selection
    function showModeSelection() {
        modeSelection.style.display = 'flex';
        gameBoard.style.display = 'none';
        gameInfo.style.display = 'none';
        greeting.textContent = "Welcome to Cosmic Tic-Tac-Toe! Select a game mode to begin your journey.";
        greeting.classList.remove('win-animation');
    }
    
    // Start game with selected mode
    function startGame(vsComputer) {
        isComputerMode = vsComputer;
        modeSelection.style.display = 'none';
        gameBoard.style.display = 'grid';
        gameInfo.style.display = 'flex';
        
        // Reset and create new game
        createGameBoard();
        resetGame();
        gameActive = true;
        
        if (vsComputer) {
            greeting.textContent = "You're playing against the cosmic AI. Good luck!";
        } else {
            greeting.textContent = "Pass & Play mode activated. Player X starts!";
        }
    }
    
    // Event listeners
    resetBtn.addEventListener('click', resetGame);
    changeMode.addEventListener('click', showModeSelection);
    vsComputerBtn.addEventListener('click', () => startGame(true));
    passNPlayBtn.addEventListener('click', () => startGame(false));
    
    // Initialize game mode selection screen
    createGameBoard();
    showModeSelection();
});

// Galaxy background creation
function createGalaxyBackground() {
    const galaxyBg = document.getElementById('galaxy-bg');
    const numberOfStars = 200;
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random properties
        const size = Math.random() * 3;
        const opacity = Math.random() * 0.5 + 0.3;
        const duration = Math.random() * 5 + 3;
        
        // Position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // Apply styles
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.setProperty('--opacity', opacity);
        star.style.setProperty('--opacity-mid', opacity * 1.5);
        star.style.setProperty('--duration', `${duration}s`);
        
        galaxyBg.appendChild(star);
    }
    
    // Add a few larger "planets"
    for (let i = 0; i < 5; i++) {
        const planet = document.createElement('div');
        planet.classList.add('star');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const opacity = Math.random() * 0.3 + 0.1;
        const duration = Math.random() * 10 + 10;
        
        // Position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // Colors
        const hue = Math.random() * 360;
        
        // Apply styles
        planet.style.width = `${size}px`;
        planet.style.height = `${size}px`;
        planet.style.left = `${left}%`;
        planet.style.top = `${top}%`;
        planet.style.background = `hsla(${hue}, 80%, 70%, ${opacity})`;
        planet.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, 80%, 70%, ${opacity})`;
        planet.style.setProperty('--opacity', opacity);
        planet.style.setProperty('--opacity-mid', opacity * 1.5);
        planet.style.setProperty('--duration', `${duration}s`);
        
        galaxyBg.appendChild(planet);
    }
}
