let sessionStats = {
  focus: 0,
  distraction: 0,
  unknown: 0
};

let sessionTimer = null;
let currentLabel = "unknown";
let chart = null;

function formatTime(s) {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function renderFocusStats(drawGraph = false) {
  document.getElementById('focus-time').textContent = formatTime(sessionStats.focus);
  document.getElementById('distraction-time').textContent = formatTime(sessionStats.distraction);
  document.getElementById('unknown-time').textContent = formatTime(sessionStats.unknown);

  const graphContainer = document.getElementById('focus-stats-graph');

  if (drawGraph) {
    drawFocusChart();
    drawBarGraph();
  }
}

// 🎯 상태 전달 함수
window.getFocusSessionUpdater = () => {
  return (label) => {
    if (!sessionTimer) return;
    currentLabel = label;
  };
};

// 🧠 공부 시작 시 타이머
window.startFocusSession = () => {
  currentLabel = "unknown";
  if (sessionTimer) clearInterval(sessionTimer);

  sessionTimer = setInterval(() => {
    if (currentLabel.includes("공부")) {
      sessionStats.focus++;
    } else if (
      currentLabel.includes("폰") ||
      currentLabel.includes("자리") ||
      currentLabel.includes("비움")
    ) {
      sessionStats.distraction++;
    } else {
      sessionStats.unknown++;
    }

    renderFocusStats();
  }, 1000);
};

// 🛑 공부 끝 버튼 눌렀을 때
window.endFocusSession = () => {
  clearInterval(sessionTimer);
  sessionTimer = null;

  const dateKey = new Date().toLocaleDateString();
  const totalSeconds = sessionStats.focus + sessionStats.distraction + sessionStats.unknown;

  // ⛳ localStorage 저장
  localStorage.setItem(`stats-${dateKey}`, JSON.stringify({
    total: totalSeconds,
    focus: sessionStats.focus,
    distraction: sessionStats.distraction,
    unknown: sessionStats.unknown
  }));

  window.setFocusSessionResult(sessionStats);
};

// 🖼️ 분석 이미지 → 그래프로 전환
window.setFocusSessionResult = (stats) => {
  sessionStats = stats;

  // 이미지 숨기고 그래프 보여주기
  const focusImage = document.getElementById('focus-image-container');
  if (focusImage) focusImage.style.display = 'none';

  const donutGraph = document.getElementById('focus-stats-graph');
  const barGraph = document.getElementById('focus-bar-graph');
  if (donutGraph) donutGraph.style.display = 'block';
  if (barGraph) barGraph.style.display = 'block';

  renderFocusStats(true);
  updateDailySummaryUI();
};

// 🍩 도넛 그래프
function drawFocusChart() {
  const graphContainer = document.getElementById('focus-stats-graph');
  graphContainer.innerHTML = '<canvas id="focus-chart" width="300" height="300"></canvas>';
  const ctx = document.getElementById('focus-chart').getContext('2d');

  const data = [
    sessionStats.focus,
    sessionStats.distraction,
    sessionStats.unknown
  ];
  const total = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels: ['학습 몰입 🧠', '몰입 저해 📵', '기타 ⏳'],
    datasets: [{
      data,
      backgroundColor: ['#F5C242', '#19BCFF', '#484340'],
      borderWidth: 0
    }]
  };

  const options = {
    cutout: '65%',
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label;
            const value = context.raw;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatTime(value)} (${percent}%)`;
          }
        }
      },
      legend: {
        display: false
      }
    }
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: options
  });
}

// 📊 막대 그래프
function drawBarGraph() {
  const container = document.getElementById('focus-bar-graph');
  container.innerHTML = '';

  const data = [
    { label: '📵', color: '#19BCFF', value: sessionStats.distraction },
    { label: '🧠', color: '#F5C242', value: sessionStats.focus },
    { label: '⏳', color: '#484340', value: sessionStats.unknown }
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  data.forEach(({ label, color, value }) => {
    const percent = total ? (value / total) * 100 : 0;

    const row = document.createElement('div');
    row.className = 'bar-row';

    row.innerHTML = `
      <div class="bar-label">${label}</div>
      <div class="bar-color" style="background:${color}"></div>
      <div class="bar-fill">
        <div class="bar-inner" style="width:${percent}%; background:${color};"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

// 📦 왼쪽 요약 시간 업데이트
function updateDailySummaryUI() {
  const total = sessionStats.focus + sessionStats.distraction + sessionStats.unknown;
  document.getElementById('total-time').textContent = formatTime(total);
  document.getElementById('todo-distraction-time').textContent = formatTime(sessionStats.distraction);
  document.getElementById('todo-focus-time').textContent = formatTime(sessionStats.focus);
  document.getElementById('todo-unknown-time').textContent = formatTime(sessionStats.unknown);
}

// ✅ 앱 실행되자마자 기본 메시지 출력
renderFocusStats(false);
