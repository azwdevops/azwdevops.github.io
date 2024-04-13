let timer;
let loopCount = 0;
let totalTime;
let remainingTime;

const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const startButton = document.getElementById("startButton");
const timerDisplay = document.getElementById("timerDisplay");
const stage = document.getElementById("stage");

startButton.addEventListener("click", () => {
  const hours = parseInt(hoursInput.value, 10) || 0;
  const minutes = parseInt(minutesInput.value, 10) || 0;
  const seconds = parseInt(secondsInput.value, 10) || 0;
  totalTime = hours * 3600 + minutes * 60 + seconds;
  loopCount = 0;
  startTimer();
});

function startTimer() {
  if (loopCount < 3) {
    remainingTime = totalTime;
    runLoop();
  } else {
    timerDisplay.textContent = "Timer completed";
  }
}

function runLoop() {
  if (loopCount === 0) {
    stage.textContent = "Breathe in.....";
  } else if (loopCount === 1) {
    stage.textContent = "Hold breathe.....";
  } else if (loopCount === 2) {
    stage.textContent = "Breathe out.....";
  } else {
    stage.textContent = "";
  }
  if (remainingTime >= 0) {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${formatTime(hours)}:${formatTime(
      minutes
    )}:${formatTime(seconds)}`;
    remainingTime--;
    timer = setTimeout(runLoop, 1000);
  } else {
    loopCount++;
    if (loopCount < 3) {
      setTimeout(startTimer, 10);
    }
  }
}

function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}
