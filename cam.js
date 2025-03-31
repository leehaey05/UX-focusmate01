
// --- 캠 및 Teachable Machine 기능 20243951이혜인 ---
const URL = "./my_model/";
let model, tmWebcam;
let focusTime = 0;
let distractionTime = 0;
let tracking = false;
let previousState = "";
let lastPredictionTime = 0;
const webcamWrapper = document.getElementById("webcam-wrapper");
const timerDisplay = document.getElementById("main-timer");
const overlayStatus = document.getElementById("overlay-status");
const startBtn = document.getElementById("start-btn");

async function loadModel() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
}

async function setupWebcam() {
  tmWebcam = new tmImage.Webcam(1200, 800, true);
  await tmWebcam.setup();
  await tmWebcam.play();
  webcamWrapper.appendChild(tmWebcam.canvas);
  tmWebcam.canvas.style.width = "1200px";
  tmWebcam.canvas.style.height = "800px";
}

async function loop(timestamp) {
  if (tracking) {
    await tmWebcam.update();
    if (timestamp - lastPredictionTime > 2000) {
      await predict();
      lastPredictionTime = timestamp;
    }
    requestAnimationFrame(loop);
  }
}

async function predict() {
  const prediction = await model.predict(tmWebcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  const top = prediction[0];
  const label = top.className;
  const confidence = top.probability;
  let newState = "";

  if (confidence > 0.85) {
    if (label.includes("공부")) {
      distractionTime = 0;
      focusTime++;
      newState = "🧠 공부 중!";
    } else if (label.includes("폰")) {
      newState = "❌ 집중 깨짐! (휴대폰 감지)";
    } else if (label.includes("자리") || label.includes("비움")) {
      newState = "🚪 자리에 없음!";
    } else {
      newState = `🤔 ${label} (알 수 없음)`;
    }
  } else {
    newState = "❓ 인식 불확실";
  }

  if (newState !== previousState) {
    log(newState);
    previousState = newState;
  }

  updateTimer();
}

function updateTimer() {
  const h = String(Math.floor(focusTime / 3600)).padStart(2, "0");
  const m = String(Math.floor((focusTime % 3600) / 60)).padStart(2, "0");
  const s = String(focusTime % 60).padStart(2, "0");
  timerDisplay.textContent = `${h}:${m}:${s}`;
}

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  overlayStatus.textContent = msg;
  overlayStatus.style.display = 'block';
}

startBtn.addEventListener("click", async () => {
  if (!tracking) {
    log("📦 모델 불러오는 중...");
    await tf.setBackend("webgl");
    await loadModel();
    await setupWebcam();
    tracking = true;
    startBtn.textContent = "공부 끝!";
    log("🧠 분석 시작!");
    requestAnimationFrame(loop);

    // ✅ 메인 타이머 시작
    mainTimerInterval = setInterval(() => {
      mainTimerSeconds++;
      timerDisplay.textContent = formatTime(mainTimerSeconds);
    }, 1000);

  } else {
    tracking = false;
    if (tmWebcam) {
      await tmWebcam.stop();
      tmWebcam.canvas.remove();
    }
    startBtn.textContent = "공부 시작!";
    log("✅ 분석 종료됨. 캠 꺼졌습니다.");
    overlayStatus.textContent = "공부 끝!";

    // ✅ 메인 타이머 멈춤
    clearInterval(mainTimerInterval);
    mainTimerInterval = null;
  }
});
