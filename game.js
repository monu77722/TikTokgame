class TikTokGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.combo = 0;
        this.bestCombo = 0;
        this.missedLogos = 0;
        this.maxMissed = 3;
        this.lastCatchTime = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Get DOM elements
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startScreen = document.getElementById('start-screen');
        this.endScreen = document.getElementById('end-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.highScoreElement = document.getElementById('high-score');
        this.bestComboElement = document.getElementById('best-combo');
        this.comboIndicator = document.getElementById('combo-indicator');
        this.comboCountElement = document.getElementById('combo-count');
        
        // Sound effects
        this.popSound = document.getElementById('pop-sound');
        this.comboSound = document.getElementById('combo-sound');
        
        // Event listeners
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('share-btn').addEventListener('click', () => this.shareScore());
        
        // Update high score display
        this.highScoreElement.textContent = this.highScore;
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.combo = 0;
        this.bestCombo = 0;
        this.missedLogos = 0;
        this.lastCatchTime = 0;
        
        this.updateScore();
        this.updateTimer();
        this.startScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        this.gameArea.innerHTML = '';
        this.comboIndicator.classList.add('hidden');
        
        this.gameInterval = setInterval(() => this.updateGame(), 1000);
        this.spawnInterval = setInterval(() => this.spawnLogo(), 
            Math.max(300, 1000 - this.score / 10));
    }

    updateGame() {
        this.timeLeft--;
        this.updateTimer();
        
        if (this.timeLeft <= 0 || this.missedLogos >= this.maxMissed) {
            this.endGame();
        }
    }

    spawnLogo() {
        const logo = document.createElement('div');
        logo.className = 'tiktok-logo spawning';
        
        // Create TikTok logo using image
        const img = document.createElement('img');
        img.src = 'https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png';
        img.alt = 'TikTok';
        logo.appendChild(img);
        
        // Random position
        const maxX = this.gameArea.clientWidth - 60;
        const maxY = this.gameArea.clientHeight - 60;
        logo.style.left = Math.random() * maxX + 'px';
        logo.style.top = Math.random() * maxY + 'px';
        
        // Random movement
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + this.score / 100;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        logo.addEventListener('click', () => this.catchLogo(logo));
        this.gameArea.appendChild(logo);
        
        const moveInterval = setInterval(() => {
            if (!logo.parentNode) {
                clearInterval(moveInterval);
                return;
            }
            
            const currentX = parseFloat(logo.style.left);
            const currentY = parseFloat(logo.style.top);
            
            let newX = currentX + vx;
            let newY = currentY + vy;
            
            // Bounce off walls
            if (newX <= 0 || newX >= maxX) {
                newX = Math.max(0, Math.min(newX, maxX));
            }
            if (newY <= 0 || newY >= maxY) {
                newY = Math.max(0, Math.min(newY, maxY));
            }
            
            logo.style.left = newX + 'px';
            logo.style.top = newY + 'px';
        }, 16);
        
        // Remove logo after some time if not caught
        setTimeout(() => {
            if (logo.parentNode) {
                logo.classList.add('popping');
                setTimeout(() => {
                    if (logo.parentNode) {
                        logo.remove();
                        this.missLogo();
                    }
                }, 300);
                clearInterval(moveInterval);
            }
        }, 2000);
    }

    catchLogo(logo) {
        const now = Date.now();
        const timeSinceLastCatch = now - this.lastCatchTime;
        
        // Update combo
        if (timeSinceLastCatch < 1000) {
            this.combo++;
            if (this.combo > this.bestCombo) {
                this.bestCombo = this.combo;
            }
            this.updateComboIndicator();
        } else {
            this.combo = 1;
            this.comboIndicator.classList.add('hidden');
        }
        
        // Calculate points
        const points = 10 * (1 + this.combo * 0.1);
        this.score += Math.round(points);
        
        // Update last catch time
        this.lastCatchTime = now;
        
        // Play sound
        if (this.combo > 1) {
            this.comboSound.currentTime = 0;
            this.comboSound.play();
        } else {
            this.popSound.currentTime = 0;
            this.popSound.play();
        }
        
        // Visual effects
        logo.classList.add('popping');
        this.updateScore();
        setTimeout(() => logo.remove(), 300);
    }

    missLogo() {
        this.missedLogos++;
        this.combo = 0;
        this.comboIndicator.classList.add('hidden');
        
        // Visual feedback
        this.gameArea.style.animation = 'shake 0.5s';
        setTimeout(() => this.gameArea.style.animation = '', 500);
    }

    updateComboIndicator() {
        if (this.combo > 1) {
            this.comboIndicator.classList.remove('hidden');
            this.comboCountElement.textContent = this.combo;
            
            // Position the combo indicator
            const rect = this.gameArea.getBoundingClientRect();
            this.comboIndicator.style.left = (rect.width / 2 - 50) + 'px';
            this.comboIndicator.style.top = '100px';
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateTimer() {
        this.timerElement.textContent = this.timeLeft;
    }

    endGame() {
        clearInterval(this.gameInterval);
        clearInterval(this.spawnInterval);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
        
        this.finalScoreElement.textContent = this.score;
        this.bestComboElement.textContent = this.bestCombo;
        this.endScreen.classList.remove('hidden');
    }

    shareScore() {
        const text = `🎮 I scored ${this.score} points in TikTok Tap Challenge! Best combo: ${this.bestCombo}x`;
        if (navigator.share) {
            navigator.share({
                title: 'TikTok Tap Challenge',
                text: text
            }).catch(console.error);
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text)
                .then(() => alert('Score copied to clipboard!'))
                .catch(console.error);
        }
    }

    restartGame() {
        this.startGame();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new TikTokGame();
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}`;
document.head.appendChild(style);
