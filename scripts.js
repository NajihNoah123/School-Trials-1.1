// Game state management
let gameState = {
    characterSelected: null,
    survivorCount: 310,
    currentChapter: 'chapterone',
    timeRemaining: 0,
    timerInterval: null,
    soundVolume: 0.7,
    musicVolume: 0.5,
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'normal',
    textSpeed: 'normal',
    saveDate: null
};

// Initialize game state
function initGameState() {
    // Check if there's a saved game state
    const savedState = localStorage.getItem('schoolTrialsGameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
    } else {
        // Set default state
        gameState = {
            characterSelected: null,
            survivorCount: 310,
            currentChapter: 'chapterone',
            timeRemaining: 0,
            timerInterval: null,
            soundVolume: 0.7,
            musicVolume: 0.5,
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal',
            textSpeed: 'normal',
            saveDate: null
        };
        
        // Save initial state
        localStorage.setItem('schoolTrialsGameState', JSON.stringify(gameState));
    }
    
    // Set up sound and music toggle buttons
    setupAudioControls();
}

// Load game state
function loadGameState() {
    const savedState = localStorage.getItem('schoolTrialsGameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
    }
    
    // Set up sound and music toggle buttons
    setupAudioControls();
}

// Save game state
function saveGameState() {
    gameState.saveDate = new Date().toISOString();
    localStorage.setItem('schoolTrialsGameState', JSON.stringify(gameState));
}

// Update survivor count
function updateSurvivorCount() {
    const survivorCountElement = document.getElementById('survivor-count');
    if (survivorCountElement) {
        survivorCountElement.textContent = `${gameState.survivorCount} students remain`;
    }
}

// Timer functions
function startTimer(seconds, onTimeUp) {
    // Clear any existing timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Set time remaining
    gameState.timeRemaining = seconds;
    
    // Update timer display
    updateTimerDisplay();
    
    // Start interval
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        
        // Update timer display
        updateTimerDisplay();
        
        // Check if time is up
        if (gameState.timeRemaining <= 0) {
            stopTimer();
            if (onTimeUp) onTimeUp();
        }
        
        // Add warning class when time is running low
        const timerElement = document.getElementById('timer');
        if (timerElement && gameState.timeRemaining <= 10) {
            timerElement.classList.add('warning');
            
            // Play countdown sound if not already playing
            if (gameState.timeRemaining <= 5) {
                playSound('sounds/countdown.mp3');
            }
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Stop timer
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Audio functions
function playSound(soundPath) {
    if (!gameState.soundEnabled) return;
    
    const sound = new Audio(soundPath);
    sound.volume = gameState.soundVolume;
    sound.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

// Background music
let currentMusic = null;

function playMusic(musicPath) {
    if (!gameState.musicEnabled) return;
    
    // Stop current music if playing
    if (currentMusic) {
        currentMusic.pause();
        currentMusic = null;
    }
    
    // Play new music
    currentMusic = new Audio(musicPath);
    currentMusic.volume = gameState.musicVolume;
    currentMusic.loop = true;
    currentMusic.play().catch(error => {
        console.error('Error playing music:', error);
    });
}

function stopMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic = null;
    }
}

// Set up audio controls
function setupAudioControls() {
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');
    
    if (soundToggle) {
        soundToggle.textContent = gameState.soundEnabled ? '🔊' : '🔇';
        soundToggle.addEventListener('click', function() {
            gameState.soundEnabled = !gameState.soundEnabled;
            this.textContent = gameState.soundEnabled ? '🔊' : '🔇';
            saveGameState();
        });
    }
    
    if (musicToggle) {
        musicToggle.textContent = gameState.musicEnabled ? '♪ ON' : '♪ OFF';
        musicToggle.addEventListener('click', function() {
            gameState.musicEnabled = !gameState.musicEnabled;
            this.textContent = gameState.musicEnabled ? '♪ ON' : '♪ OFF';
            
            if (gameState.musicEnabled) {
                // Resume music
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    playMusic('sounds/menu_theme.mp3');
                } else {
                    playMusic('sounds/trial_theme.mp3');
                }
            } else {
                // Stop music
                stopMusic();
            }
            
            saveGameState();
        });
    }
}

// Update audio volumes
function updateAudioVolumes() {
    if (currentMusic) {
        currentMusic.volume = gameState.musicVolume;
    }
}

// Show modal
function showModal(title, message, buttonText, onClose) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-900 border border-red-600 p-6 w-96 max-w-full';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'text-xl mb-4 text-center';
    modalTitle.textContent = title;
    
    const modalMessage = document.createElement('p');
    modalMessage.className = 'mb-6 text-center';
    modalMessage.textContent = message;
    
    const modalButton = document.createElement('button');
    modalButton.className = 'game-btn px-4 py-2 bg-red-900 hover:bg-red-800 w-full';
    modalButton.textContent = buttonText;
    modalButton.addEventListener('click', function() {
        playSound('sounds/click.mp3');
        document.body.removeChild(modal);
        if (onClose) onClose();
    });
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalMessage);
    modalContent.appendChild(modalButton);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Game over function
function gameOver(reason) {
    stopTimer();
    stopMusic();
    playSound('sounds/failure.mp3');
    
    // Show game over modal
    showModal('TRIAL FAILED', reason, 'Continue', function() {
        window.location.href = 'failure.html';
    });
}

// Trial success function
function trialSuccess(newSurvivorCount, nextChapter) {
    stopTimer();
    playSound('sounds/success.mp3');
    
    // Calculate elimination
    const eliminated = gameState.survivorCount - newSurvivorCount;
    
    // Update game state
    gameState.survivorCount = newSurvivorCount;
    gameState.currentChapter = nextChapter.replace('.html', '');
    saveGameState();
    
    // Show success modal
    showModal('TRIAL COMPLETED', `${eliminated} students have been eliminated.\n${newSurvivorCount} students remain.`, 'Continue', function() {
        window.location.href = nextChapter;
    });
}

// Add scan lines effect to all pages
document.addEventListener("DOMContentLoaded", () => {
  const scanLines = document.createElement("div")
  scanLines.className = "scan-lines"
  document.body.appendChild(scanLines)

  // Load game state
  initGameState();

  // Initialize sound and music toggles
  const soundBtn = document.getElementById("sound-toggle")
  if (soundBtn) {
    soundBtn.textContent = gameState.soundEnabled ? "🔊" : "🔇"
    soundBtn.addEventListener("click", toggleSound)
  }

  const musicBtn = document.getElementById("music-toggle")
  if (musicBtn) {
    musicBtn.textContent = gameState.musicEnabled ? "♪ ON" : "♪ OFF"
    musicBtn.addEventListener("click", toggleMusic)
  }

  // Toggle sound function
  function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled
    const soundBtn = document.getElementById("sound-toggle")
    if (soundBtn) {
      soundBtn.textContent = gameState.soundEnabled ? "🔊" : "🔇"
    }
    saveGameState()
  }

  // Toggle music function
  function toggleMusic() {
    gameState.musicEnabled = !gameState.musicEnabled
    const musicBtn = document.getElementById("music-toggle")
    if (musicBtn) {
      musicBtn.textContent = gameState.musicEnabled ? "♪ ON" : "♪ OFF"
    }

    if (gameState.musicEnabled) {
      // Resume music
      if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
        playMusic("sounds/menu_theme.mp3")
      } else {
        playMusic("sounds/trial_theme.mp3")
      }
    } else {
      // Stop music
      stopMusic()
    }

    saveGameState()
  }
})

// Random utilities
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
