// --- 캠 + 감성 모드 + Teachable Machine 예측 통합 ---

const URL = "./my_model/";
let model, tmWebcam;
let tracking = false;
let previousState = "";
let lastPredictionTime = 0;
let focusTime = 0, distractionTime = 0;
let sessionTimerInterval = null;
let sessionTimerSeconds = 0;
let videoStream = null;

const webcamWrapper = document.getElementById("webcam-wrapper");
const overlayStatus = document.getElementById("overlay-status");
const timerDisplay = document.getElementById("main-timer");
const startBtn = document.getElementById("start-btn");
const camImage = document.getElementById("cam-image");

// 🎧 감성 모드
const moodModeBtn = document.getElementById("mood-mode-btn");
const moodOverlay = document.getElementById("mood-overlay");
let moodModeOn = false;

moodModeBtn.addEventListener("click", () => {
  moodModeOn = !moodModeOn;
  webcamWrapper.classList.toggle("mood-mode", moodModeOn);
  moodOverlay.style.display = moodModeOn ? "block" : "none";
  moodModeBtn.textContent = moodModeOn ? "👀" : "🎧";

  const moodBox = document.querySelector(".mood-box");
  const oldIframe = document.getElementById("mood-video-iframe");

  if (moodModeOn) {
    // 동적 iframe 삽입
    if (!oldIframe) {
      const iframe = document.createElement("iframe");
      iframe.id = "mood-video-iframe";
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=1&loop=1&playlist=jfKfPfyJRdk";
      iframe.title = "lofi hip hop radio - beats to relax/study to";
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      moodBox.appendChild(iframe);
    }
  } else {
    // 감성 모드 해제 시 iframe 제거
    if (oldIframe) oldIframe.remove();
  }
});

// 📦 모델 로드
async function loadModel() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
}

// 📷 웹캠 설정
async function setupWebcam() {
  const constraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user"
    }
  };

  videoStream = await navigator.mediaDevices.getUserMedia(constraints);
  const video = document.createElement("video");
  video.setAttribute("autoplay", true);
  video.setAttribute("playsinline", true);
  video.srcObject = videoStream;
  Object.assign(video.style, {
    objectFit: "cover",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: "0",
    left: "0",
    zIndex: "0",
    transform: "scaleX(-1)"
  });

  await video.play();

  const oldVideo = webcamWrapper.querySelector("video");
  if (oldVideo) oldVideo.remove();
  webcamWrapper.appendChild(video);

  tmWebcam = new tmImage.Webcam(1280, 720, true);
  await tmWebcam.setup({ video });
  await tmWebcam.play();
  tmWebcam.canvas.style.transform = "scaleX(-1)";
}

// 🔁 예측 루프
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

// 🧠 예측 처리
async function predict() {
  const prediction = await model.predict(tmWebcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);
  const top = prediction[0];
  const label = top.className;
  const confidence = top.probability;

  let newState = "❓ 인식 불확실";
  if (confidence > 0.85) {
    if (label.includes("공부")) {
      distractionTime = 0;
      focusTime++;
      newState = "🧠 공부 중!";
    } else if (label.includes("폰")) {
      newState = "❌ 집중 깨짐! (휴대폰 감지)";
    } else if (label.includes("자리") || label.includes("비움")) {
      newState = "🚪 자리에 없음!";
    } else if (label.includes("노트북")) {
      newState = "💻 노트북 사용 중";
    } else {
      newState = `🤔 ${label} (알 수 없음)`;
    }
  }

  if (newState !== previousState) {
    log(newState);
    previousState = newState;
  }

  const updateFocusStats = window.getFocusSessionUpdater?.();
  if (updateFocusStats) updateFocusStats(label);
}

// 📝 자막 출력
function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  overlayStatus.textContent = msg;
  overlayStatus.style.display = "block";
}

// ▶️ 공부 시작/끝 버튼
startBtn.addEventListener("click", async () => {
  if (!tracking) {
    if (camImage) camImage.style.display = "none";

    log("📦 모델 불러오는 중...");
    await tf.setBackend("webgl");
    await loadModel();
    await setupWebcam();

    tracking = true;
    startBtn.textContent = "공부 끝!";
    log("🧠 분석 시작!");
    requestAnimationFrame(loop);

    sessionTimerInterval = setInterval(() => {
      sessionTimerSeconds++;
      timerDisplay.textContent = formatTime(sessionTimerSeconds);
    }, 1000);

    window.startFocusSession?.();

  } else {
    tracking = false;

    if (tmWebcam) {
      await tmWebcam.stop();
      tmWebcam.canvas.remove();
    }

    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }

    const video = webcamWrapper.querySelector("video");
    if (video) video.remove();

    if (camImage) camImage.style.display = "block";

    startBtn.textContent = "공부 시작!";
    log("분석 종료됨. 캠 꺼졌습니다.");
    overlayStatus.style.display = "none";

    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;

    window.endFocusSession?.();
  }
});

// ⏰ 시간 포맷
function formatTime(s) {
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
