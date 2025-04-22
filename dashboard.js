document.addEventListener("DOMContentLoaded", () => {
    const liveTab = document.getElementById("live-tab");
    const dashboardTab = document.getElementById("dashboard-tab");
    const webcamMain = document.querySelector(".main");
    const wrapper = document.getElementById("wrapper");
    const modeTabs = document.querySelector(".mode-tabs");
    const dashboardContent = document.getElementById("dashboard-content");
    const hamburger = document.getElementById("hamburger");
  
    liveTab.addEventListener("click", () => {
      liveTab.classList.add("active");
      dashboardTab.classList.remove("active");
      webcamMain.style.display = "flex";
      dashboardContent.style.display = "none";
      modeTabs.style.display = "flex";
    });
  
    dashboardTab.addEventListener("click", () => {
      dashboardTab.classList.add("active");
      liveTab.classList.remove("active");
      webcamMain.style.display = "none";
      dashboardContent.style.display = "block";
      modeTabs.style.display = "flex";
    });
  
    hamburger.addEventListener("click", () => {
      wrapper.classList.toggle("active");
      if (modeTabs.style.display !== 'none') {
        modeTabs.style.left = wrapper.classList.contains("active") ? "360px" : "-100px";
      }
    });
  });

  
  
  function loadMonthlyStats() {
    const stats = {
      total: 0,
      focus: 0,
      distraction: 0,
      unknown: 0
    };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("stats-")) {
        const value = JSON.parse(localStorage.getItem(key));
        stats.total += value.total || 0;
        stats.focus += value.focus || 0;
        stats.distraction += value.distraction || 0;
        stats.unknown += value.unknown || 0;
      }
    }
    return stats;
  }
  
  const monthlyStudyStats = [
    { date: "2025-03-25", total: 5382, focus: 3222, distraction: 1116, unknown: 1044 },
    { date: "2025-03-26", total: 3231, focus: 2220, distraction: 419, unknown: 592 },
    { date:"2025-03-27", total: 2195, focus: 871, distraction: 494, unknown: 830 },
    { date: "2025-03-28", total: 3213, focus: 987, distraction: 488, unknown: 1738 },
    { date: "2025-03-29", total: 2610, focus: 1620, distraction: 128, unknown: 862 },
    { date: "2025-03-30", total: 3859, focus: 1451, distraction: 420, unknown: 1988 },
    { date: "2025-03-31", total: 1818, focus: 804, distraction: 369, unknown: 645 },
    { date: "2025-04-01", total: 3850, focus: 1874, distraction: 723, unknown: 1253 },
    { date: "2025-04-02", total: 2062, focus: 792, distraction: 211, unknown: 1059 },
    { date: "2025-04-03", total: 2879, focus: 1029, distraction: 412, unknown: 1438 },
    { date: "2025-04-04", total: 3664, focus: 1166, distraction: 1255, unknown: 1243 },
    { date: "2025-04-05", total: 2211, focus: 928, distraction: 342, unknown: 941 },
    { date: "2025-04-06", total: 5189, focus: 3350, distraction: 789, unknown: 1050 },
    { date: "2025-04-07", total: 3942, focus: 2040, distraction: 666, unknown: 1236 },
    { date: "2025-04-08", total: 3633, focus: 1455, distraction: 1012, unknown: 1166 },
    { date: "2025-04-09", total: 4796, focus: 1676, distraction: 441, unknown: 2679 },
    { date: "2025-04-10", total: 2020, focus: 1159, distraction: 96, unknown: 765 },
    { date: "2025-04-11", total: 2067, focus: 764, distraction: 781, unknown: 522 },
    { date: "2025-04-12", total: 1871, focus: 991, distraction: 508, unknown: 372 },
    { date: "2025-04-13", total: 5202, focus: 3605, distraction: 677, unknown: 920 },
    { date: "2025-04-14", total: 2016, focus: 865, distraction: 394, unknown: 757 },
    { date: "2025-04-15", total: 3860, focus: 2086, distraction: 333, unknown: 1441 },
    { date: "2025-04-16", total: 3088, focus: 1893, distraction: 337, unknown: 858 },
    { date: "2025-04-17", total: 2040, focus: 649, distraction: 598, unknown: 793 },
    { date: "2025-04-18", total: 3662, focus: 2240, distraction: 427, unknown: 995 },
    { date: "2025-04-19", total: 4482, focus: 2603, distraction: 637, unknown: 1242 },
    { date: "2025-04-20", total: 4392, focus: 2076, distraction: 399, unknown: 1917 },
    { date: "2025-04-21", total: 3630, focus: 2114, distraction: 292, unknown: 1224 },
    { date: "2025-04-22", total: 0, focus: 0, distraction: 0, unknown: 0 }
  ];
  
  
  const ctxLine = document.getElementById('monthly-line-chart').getContext('2d');
  new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: monthlyStudyStats.map(d => d.date),
      datasets: [
        {
          label: '총 공부 시간',
          data: monthlyStudyStats.map(d => d.total / 3600), // ✅ 쉼표!
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 5 // ✅ 점 크기 키우기
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'nearest', // ✅ 툴팁 잘 뜨게
        axis: 'x',
        intersect: false
      },
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          min: 0,
          title: { display: true, text: '시간 (h)' }
        },
        x: {
          title: { display: true, text: '날짜' }
        }
      }
    }
  });
  
  
  const monthly = loadMonthlyStatsFromArray(monthlyStudyStats); // ✅ 한 달 데이터 누적

  function loadMonthlyStatsFromArray(dataArray) {
    const stats = {
      total: 0,
      focus: 0,
      distraction: 0,
      unknown: 0
    };
  
    dataArray.forEach(day => {
      stats.total += day.total;
      stats.focus += day.focus;
      stats.distraction += day.distraction;
      stats.unknown += day.unknown;
    });
  
    console.log("📊 월간 통계 확인:", stats); // 콘솔 확인용
    return stats;
  }
  

  
  const ctxDonut = document.getElementById('monthly-donut-chart').getContext('2d');

  new Chart(ctxDonut, {
    type: 'doughnut',
    data: {
      labels: ['학습 몰입 🧠', '저해 행동 📵', '기타 ⏳'],
      datasets: [{
        data: [monthly.focus, monthly.distraction, monthly.unknown],
        backgroundColor: ['#4dabf7', '#f7679c', '#ffa94d'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // ❗ 차트 박스에 맞게 꽉 차게
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      layout: {
        padding: 0
      }
    }
  });
  
  
  
  
  const weekdayMap = [ '일', '월', '화', '수', '목', '금', '토' ];
  const weekdayStats = new Array(7).fill(0);
  monthlyStudyStats.forEach(entry => {
    const day = new Date(entry.date).getDay();
    weekdayStats[day] += entry.total;
  });
  
  const ctxBar = document.getElementById('weekday-bar-chart').getContext('2d');
  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: weekdayMap,
      datasets: [{
        label: '요일별 총 공부시간 (h)',
        data: weekdayStats.map(s => (s / 3600).toFixed(2)),
        borderWidth: 1,
        backgroundColor: '#74c0fc'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '시간 (h)' }
        }
      }
    }
  });
  const ctxHeatmap = document.getElementById('monthly-heatmap').getContext('2d');

  // 예시용 샘플 데이터 (29일치, 24시간 집중 분 단위)
  const heatmapData = [];
  for (let d = 0; d < 28; d++) {  // ✅ 28일치로 줄이기
    for (let h = 0; h < 24; h++) {
      heatmapData.push({
        x: h,
        y: 27 - d,  // → y축이 27~0 (28칸)으로 떨어지게!
        v: Math.floor(Math.random() * 60)
      });
    }
  }
  
  
  
  new Chart(ctxHeatmap, {
    type: 'matrix',
    data: {
      datasets: [{
        label: '시간별 집중 히트맵',
        data: heatmapData,
        backgroundColor(context) {
          const value = context.dataset.data[context.dataIndex].v;
          const alpha = value / 60;
          return `rgba(33, 150, 243, ${alpha})`; // 파랑 계열
        },
        borderWidth: 1,
        width: ({ chart }) => (chart.chartArea || {}).width / 24 - 1,
        height: ({ chart }) => (chart.chartArea || {}).height / 29 - 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title: d => `Day ${29 - d[0].raw.y}`,
            label: d => `${d.raw.v}분 집중`
          }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'top',
          ticks: {
            callback: v => `${v}시`,
            maxTicksLimit: 24
          },
          title: {
            display: true,
            text: '시간'
          }
        },
        y: {
            type: 'linear',
            min: 0,           // ✅ 최소값 고정
            max: 28,          // ✅ 최대값 고정
            ticks: {
              callback: v => `${29 - v}일`
            },
            title: {
              display: true,
              text: '날짜 (최근 → 과거)'
            }
          }
          
      }
    }
  });
  