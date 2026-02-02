class ExerciseTimer {
    constructor() {
        this.countdownTime = 0;
        this.restTime = 0;
        this.repetitions = 0;
        this.currentRep = 0;
        this.currentTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isResting = false;
        this.intervalId = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerValue = document.getElementById('timerValue');
        this.timerStatus = document.getElementById('timerStatus');
        this.roundInfo = document.getElementById('roundInfo');
        this.countdownInput = document.getElementById('countdownTime');
        this.restInput = document.getElementById('restTime');
        this.repetitionsInput = document.getElementById('repetitions');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.inputGroup = document.getElementById('inputGroup');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (this.isPaused) {
            // Resume from pause
            this.isPaused = false;
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.runTimer();
            return;
        }

        // Get values from inputs
        this.countdownTime = parseInt(this.countdownInput.value) || 30;
        this.restTime = parseInt(this.restInput.value) || 10;
        this.repetitions = parseInt(this.repetitionsInput.value) || 3;

        if (this.countdownTime <= 0 || this.repetitions <= 0) {
            alert('Please enter valid values for countdown time and repetitions.');
            return;
        }

        // Initialize timer
        this.currentRep = 1;
        this.currentTime = this.countdownTime;
        this.isRunning = true;
        this.isResting = false;

        // Update UI
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.inputGroup.style.opacity = '0.5';
        this.inputGroup.style.pointerEvents = 'none';
        this.progressContainer.style.display = 'block';

        this.updateDisplay();
        this.runTimer();
    }

    runTimer() {
        this.intervalId = setInterval(() => {
            if (!this.isRunning || this.isPaused) {
                return;
            }

            // Update display first to show current time (including 0)
            this.updateDisplay();

            if (this.isResting) {
                // Rest period - just wait, don't count down
                if (this.currentTime <= 0) {
                    // Rest period over, start next countdown
                    this.currentRep++;
                    if (this.currentRep > this.repetitions) {
                        // All repetitions complete
                        this.complete();
                        return;
                    }
                    this.isResting = false;
                    this.currentTime = this.countdownTime;
                    this.timerDisplay.classList.remove('resting');
                    this.updateDisplay();
                } else {
                    this.currentTime--;
                }
            } else {
                // Countdown period
                if (this.currentTime <= 0) {
                    // Countdown complete, start rest
                    if (this.currentRep < this.repetitions) {
                        this.isResting = true;
                        this.currentTime = this.restTime;
                        this.timerDisplay.classList.add('resting');
                        this.updateDisplay();
                    } else {
                        // Last repetition complete
                        this.complete();
                        return;
                    }
                } else {
                    this.currentTime--;
                }
            }
        }, 1000);
    }

    pause() {
        this.isPaused = true;
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.timerDisplay.classList.remove('resting');
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isResting = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Reset UI
        this.currentTime = 0;
        this.currentRep = 0;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.inputGroup.style.opacity = '1';
        this.inputGroup.style.pointerEvents = 'auto';
        this.progressContainer.style.display = 'none';
        this.timerDisplay.classList.remove('resting');

        this.updateDisplay();
    }

    complete() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.timerDisplay.classList.remove('resting');
        this.timerStatus.textContent = 'Complete!';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = false;
        this.inputGroup.style.opacity = '1';
        this.inputGroup.style.pointerEvents = 'auto';
        
        // Update display to show completion
        this.updateDisplay();
    }

    updateDisplay() {
        // Format time as MM:SS
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerValue.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update status
        if (this.isResting) {
            this.timerStatus.textContent = 'Rest';
        } else if (this.isRunning && !this.isPaused) {
            this.timerStatus.textContent = 'Exercise';
        } else if (this.isPaused) {
            this.timerStatus.textContent = 'Paused';
        } else {
            this.timerStatus.textContent = 'Ready';
        }

        // Update round info
        if (this.isRunning || this.isPaused) {
            this.roundInfo.textContent = `Round ${this.currentRep} of ${this.repetitions}`;
        } else {
            this.roundInfo.textContent = '';
        }

        // Update progress bar
        if (this.isRunning || this.isPaused) {
            const totalCycles = this.repetitions;
            const completedCycles = this.currentRep - 1;
            
            if (this.isResting) {
                // During rest, show progress for current cycle
                const cycleProgress = 1 - (this.currentTime / this.restTime);
                const totalProgress = (completedCycles + cycleProgress) / totalCycles;
                this.progressFill.style.width = `${totalProgress * 100}%`;
                this.progressText.textContent = `Resting... Round ${this.currentRep} of ${this.repetitions}`;
            } else {
                // During countdown, show progress
                const cycleProgress = 1 - (this.currentTime / this.countdownTime);
                const totalProgress = (completedCycles + cycleProgress) / totalCycles;
                this.progressFill.style.width = `${totalProgress * 100}%`;
                this.progressText.textContent = `Round ${this.currentRep} of ${this.repetitions}`;
            }
        }
    }
}

// Initialize timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExerciseTimer();
});

