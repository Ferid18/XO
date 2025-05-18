  // Tema dəyişdirmə
    const themeToggle = document.getElementById('themeToggle');
    const themeSelect = document.getElementById('themeSelect');
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark');
        themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
        updateThemeIcons();
    };
    themeSelect.onchange = () => {
        document.body.classList.remove('theme-neon');
        if (themeSelect.value) document.body.classList.add('theme-' + themeSelect.value);
        updateThemeIcons();
    };
    function updateThemeIcons() {
        iconX.style.color = getComputedStyle(document.body).getPropertyValue('--accent');
        iconO.style.color = getComputedStyle(document.body).getPropertyValue('--accent2');
    }

    // Avatar seçimi
    let avatarX = "😎", avatarO = "🤖";
    document.querySelectorAll('#avatar1 .avatar-option').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('#avatar1 .avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            avatarX = opt.dataset.avatar;
        }
    });
    document.querySelectorAll('#avatar2 .avatar-option').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('#avatar2 .avatar-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            avatarO = opt.dataset.avatar;
        }
    });

    // Əsas dəyişənlər və DOM elementləri
    const menu = document.getElementById('menu');
    const game = document.getElementById('game');
    const board = document.getElementById('board');
    const statusDiv = document.getElementById('status');
    const resetBtn = document.getElementById('reset');
    const playAgainBtn = document.getElementById('playagain');
    const startBtn = document.getElementById('start');
    const backBtn = document.getElementById('back');
    const modeSelect = document.getElementById('mode');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const player2Div = document.getElementById('player2div');
    const difficultyDiv = document.getElementById('difficultyDiv');
    const difficultySelect = document.getElementById('difficulty');
    const playerXDiv = document.getElementById('playerX');
    const playerODiv = document.getElementById('playerO');
    const playerXName = document.getElementById('playerXName');
    const playerOName = document.getElementById('playerOName');
    const iconX = document.getElementById('iconX');
    const iconO = document.getElementById('iconO');
    const toast = document.getElementById('toast');
    const confettiCanvas = document.getElementById('confetti');
    const scoreXVal = document.getElementById('scoreXVal');
    const scoreOVal = document.getElementById('scoreOVal');
    const moveHistoryDiv = document.getElementById('moveHistory');
    const statsDiv = document.getElementById('stats');
    const moveSound = document.getElementById('moveSound');
    const winSound = document.getElementById('winSound');
    const drawSound = document.getElementById('drawSound');
    const timerDiv = document.getElementById('timer');

    let cells = [];
    let currentPlayer = 'X';
    let gameActive = true;
    let mode = '2p';
    let player1 = 'Oyunçu 1';
    let player2 = 'Oyunçu 2';
    let difficulty = 'easy';
    let scoreX = 0;
    let scoreO = 0;
    let totalGames = 0;
    let draws = 0;
    let moveHistory = [];
    let timer = null;
    let timeLeft = 15;

    // Menyu və oyun başlatma
    modeSelect.addEventListener('change', () => {
        if (modeSelect.value === 'cpu') {
            player2Div.style.display = 'none';
            difficultyDiv.style.display = 'block';
        } else {
            player2Div.style.display = 'block';
            difficultyDiv.style.display = 'none';
        }
    });

    startBtn.addEventListener('click', () => {
        mode = modeSelect.value;
        player1 = player1Input.value.trim() || 'Oyunçu 1';
        player2 = mode === 'cpu' ? 'Kompüter' : (player2Input.value.trim() || 'Oyunçu 2');
        difficulty = difficultySelect.value;
        menu.style.display = 'none';
        game.style.display = 'flex';
        playerXName.textContent = player1;
        playerOName.textContent = player2;
        iconX.textContent = avatarX;
        iconO.textContent = avatarO;
        showToast('Oyun başladı! Uğurlar!');
        startGame();
    });

    backBtn.addEventListener('click', () => {
        stopTimer();
        game.style.display = 'none';
        menu.style.display = 'flex';
        stopConfetti();
    });

    // Oyun başlat
    function startGame() {
        currentPlayer = 'X';
        gameActive = true;
        statusDiv.textContent = `Növbə: ${currentPlayer} (${getCurrentPlayerName()})`;
        playerXDiv.classList.add('active');
        playerODiv.classList.remove('active');
        createBoard();
        stopConfetti();
        playAgainBtn.style.display = 'none';
        moveHistory = [];
        updateMoveHistory();
        updateStats();
        startTimer();
        if (mode === 'cpu' && currentPlayer === 'O') {
            setTimeout(() => cpuMove(), 500);
        }
    }

    // Taxta yaradılması
    function createBoard() {
        board.innerHTML = '';
        cells = [];
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
            cells.push(cell);
        }
    }

    // Timer funksiyaları
    function startTimer() {
        clearInterval(timer);
        timeLeft = 15;
        timerDiv.textContent = `Vaxt: ${timeLeft} saniyə`;
        timer = setInterval(() => {
            timeLeft--;
            timerDiv.textContent = `Vaxt: ${timeLeft} saniyə`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                showToast("Vaxt bitdi! Növbə dəyişdi.");
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                statusDiv.textContent = `Növbə: ${currentPlayer} (${getCurrentPlayerName()})`;
                playerXDiv.classList.toggle('active', currentPlayer === 'X');
                playerODiv.classList.toggle('active', currentPlayer === 'O');
                startTimer();
                if (mode === 'cpu' && currentPlayer === 'O' && gameActive) {
                    setTimeout(() => cpuMove(), 500);
                }
            }
        }, 1000);
    }
    function stopTimer() {
        clearInterval(timer);
        timerDiv.textContent = "";
    }

    // Hüceyrəyə klik
    function handleCellClick(e) {
        const cell = e.target;
        if (!gameActive || cell.textContent !== '') return;
        cell.textContent = currentPlayer;
        playSound(moveSound);
        moveHistory.push({player: currentPlayer, pos: +cell.dataset.index});
        updateMoveHistory();
        if (checkWin()) {
            highlightWin();
            statusDiv.textContent = `Qalib: ${getCurrentPlayerName()} (${currentPlayer})`;
            showToast(`Qalib: ${getCurrentPlayerName()}! 🎉`);
            playSound(winSound);
            gameActive = false;
            stopTimer();
            startConfetti();
            updateScore(currentPlayer);
            playAgainBtn.style.display = 'inline-block';
            totalGames++;
            updateStats();
        } else if (cells.every(c => c.textContent !== '')) {
            statusDiv.textContent = 'Heç-heçə!';
            showToast('Heç-heçə! 🤝');
            playSound(drawSound);
            gameActive = false;
            stopTimer();
            playAgainBtn.style.display = 'inline-block';
            draws++;
            totalGames++;
            updateStats();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDiv.textContent = `Növbə: ${currentPlayer} (${getCurrentPlayerName()})`;
            playerXDiv.classList.toggle('active', currentPlayer === 'X');
            playerODiv.classList.toggle('active', currentPlayer === 'O');
            startTimer();
            if (mode === 'cpu' && currentPlayer === 'O' && gameActive) {
                setTimeout(() => cpuMove(), 500);
            }
        }
    }

    // Hərəkət tarixçəsi və geri al
    function updateMoveHistory() {
        moveHistoryDiv.innerHTML = '';
        moveHistory.forEach((move, i) => {
            const span = document.createElement('span');
            span.textContent = `${move.player} → [${Math.floor(move.pos/3)+1},${move.pos%3+1}]`;
            moveHistoryDiv.appendChild(span);
            if (i === moveHistory.length-1 && gameActive) {
                const btn = document.createElement('button');
                btn.textContent = "Geri al";
                btn.onclick = () => undoMove();
                moveHistoryDiv.appendChild(btn);
            }
        });
    }
    function undoMove() {
        if (!moveHistory.length || !gameActive) return;
        const last = moveHistory.pop();
        cells[last.pos].textContent = '';
        currentPlayer = last.player;
        statusDiv.textContent = `Növbə: ${currentPlayer} (${getCurrentPlayerName()})`;
        playerXDiv.classList.toggle('active', currentPlayer === 'X');
        playerODiv.classList.toggle('active', currentPlayer === 'O');
        updateMoveHistory();
    }

    // Kompüterin gedişi
    function cpuMove() {
        let move;
        if (difficulty === 'easy') {
            move = getRandomMove();
        } else if (difficulty === 'medium') {
            move = getMediumMove();
        } else if (difficulty === 'hard') {
            move = getBestMove('O', 2);
        } else {
            move = getBestMove('O', 6);
        }
        if (move !== undefined) {
            cells[move].textContent = 'O';
            playSound(moveSound);
            moveHistory.push({player: 'O', pos: move});
            updateMoveHistory();
            if (checkWin()) {
                highlightWin();
                statusDiv.textContent = `Qalib: Kompüter (O)`;
                showToast('Qalib: Kompüter! 🤖');
                playSound(winSound);
                gameActive = false;
                stopTimer();
                startConfetti();
                updateScore('O');
                playAgainBtn.style.display = 'inline-block';
                totalGames++;
                updateStats();
            } else if (cells.every(c => c.textContent !== '')) {
                statusDiv.textContent = 'Heç-heçə!';
                showToast('Heç-heçə! 🤝');
                playSound(drawSound);
                gameActive = false;
                stopTimer();
                playAgainBtn.style.display = 'inline-block';
                draws++;
                totalGames++;
                updateStats();
            } else {
                currentPlayer = 'X';
                statusDiv.textContent = `Növbə: X (${player1})`;
                playerXDiv.classList.add('active');
                playerODiv.classList.remove('active');
                startTimer();
            }
        }
    }

    // Kompüter üçün məntiq
    function getRandomMove() {
        let emptyCells = cells.map((cell, i) => cell.textContent === '' ? i : null).filter(i => i !== null);
        if (emptyCells.length === 0) return;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    function getMediumMove() {
        let emptyCells = cells.map((cell, i) => cell.textContent === '' ? i : null).filter(i => i !== null);
        for (let i of emptyCells) {
            cells[i].textContent = 'O';
            if (checkWin()) {
                cells[i].textContent = '';
                return i;
            }
            cells[i].textContent = '';
        }
        for (let i of emptyCells) {
            cells[i].textContent = 'X';
            if (checkWin()) {
                cells[i].textContent = '';
                return i;
            }
            cells[i].textContent = '';
        }
        return getRandomMove();
    }
    function getBestMove(player, maxDepth = 6) {
        let bestScore = -Infinity;
        let move;
        let emptyCells = cells.map((cell, i) => cell.textContent === '' ? i : null).filter(i => i !== null);
        for (let i of emptyCells) {
            cells[i].textContent = player;
            let score = minimax(0, false, player, maxDepth);
            cells[i].textContent = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
        return move;
    }
    function minimax(depth, isMaximizing, aiPlayer, maxDepth) {
        let winner = getWinner();
        if (winner === aiPlayer) return 10 - depth;
        if (winner && winner !== aiPlayer) return depth - 10;
        if (cells.every(c => c.textContent !== '')) return 0;
        if (depth >= maxDepth) return 0;
        let scores = [];
        let emptyCells = cells.map((cell, i) => cell.textContent === '' ? i : null).filter(i => i !== null);
        for (let i of emptyCells) {
            cells[i].textContent = isMaximizing ? aiPlayer : (aiPlayer === 'O' ? 'X' : 'O');
            let score = minimax(depth + 1, !isMaximizing, aiPlayer, maxDepth);
            cells[i].textContent = '';
            scores.push(score);
        }
        return isMaximizing ? Math.max(...scores) : Math.min(...scores);
    }
    function getWinner() {
        const winPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (
                cells[a].textContent &&
                cells[a].textContent === cells[b].textContent &&
                cells[a].textContent === cells[c].textContent
            ) {
                return cells[a].textContent;
            }
        }
        return null;
    }
    function checkWin() {
        return !!getWinner();
    }
    function highlightWin() {
        const winPatterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (
                cells[a].textContent &&
                cells[a].textContent === cells[b].textContent &&
                cells[a].textContent === cells[c].textContent
            ) {
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
            }
        }
    }
    resetBtn.addEventListener('click', () => {
        startGame();
    });
    playAgainBtn.addEventListener('click', () => {
        startGame();
    });
    backBtn.addEventListener('click', () => {
        stopTimer();
        game.style.display = 'none';
        menu.style.display = 'flex';
        stopConfetti();
    });
    document.getElementById('resetScore').addEventListener('click', () => {
        scoreX = 0;
        scoreO = 0;
        totalGames = 0;
        draws = 0;
        updateScore();
        updateStats();
        showToast("Xallar sıfırlandı!");
    });
    function getCurrentPlayerName() {
        if (mode === '2p') {
            return currentPlayer === 'X' ? player1 : player2;
        } else {
            return currentPlayer === 'X' ? player1 : 'Kompüter';
        }
    }
    // Skor yeniləmə
    function updateScore(winner) {
        if (winner === 'X') scoreX++;
        if (winner === 'O') scoreO++;
        scoreXVal.textContent = scoreX;
        scoreOVal.textContent = scoreO;
    }
    // Toast mesajı
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }
    // Konfeti effekti
    let confettiActive = false;
    function startConfetti() {
        confettiCanvas.style.display = 'block';
        confettiActive = true;
        drawConfetti();
        setTimeout(stopConfetti, 2200);
    }
    function stopConfetti() {
        confettiActive = false;
        confettiCanvas.style.display = 'none';
        const ctx = confettiCanvas.getContext('2d');
        ctx && ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    function drawConfetti() {
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        let confs = [];
        for (let i = 0; i < 80; i++) {
            confs.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height * 0.5,
                r: Math.random() * 8 + 4,
                c: `hsl(${Math.random()*360},80%,60%)`,
                v: Math.random() * 2 + 2
            });
        }
        function animate() {
            if (!confettiActive) return;
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            for (let conf of confs) {
                ctx.beginPath();
                ctx.arc(conf.x, conf.y, conf.r, 0, 2 * Math.PI);
                ctx.fillStyle = conf.c;
                ctx.fill();
                conf.y += conf.v;
                if (conf.y > confettiCanvas.height) conf.y = -10;
            }
            requestAnimationFrame(animate);
        }
        animate();
    }
    // Statistikalar
    function updateStats() {
        statsDiv.innerHTML = `Toplam oyun: <b>${totalGames}</b> | X qalibiyyəti: <b>${scoreX}</b> | O qalibiyyəti: <b>${scoreO}</b> | Heç-heçə: <b>${draws}</b>`;
    }
    // Səs effekti
    function playSound(audio) {
        try { audio.currentTime = 0; audio.play(); } catch(e){}
    }