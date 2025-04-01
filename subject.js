let mainTimerInterval = null;
let mainTimerSeconds = 0;

// --- 햄버거 메뉴 토글 ---
const wrapper = document.getElementById('wrapper');
const modeTabs = document.querySelector('.mode-tabs');
const hamburger = document.getElementById('hamburger');

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// 햄버거 버튼 눌렀을 때 슬라이드 + 책갈피 토글
hamburger.addEventListener('click', () => {
  wrapper.classList.toggle('active');

  if (wrapper.classList.contains('active')) {
    modeTabs.style.left = '360px'; // 슬라이드 오른쪽에 책갈피 보여줌
  } else {
    modeTabs.style.left = '-100px'; // 숨김
  }
});


// --- 과목 색상 변경경 ---
const colors = [
  "#ad1457", "#c62828", "#ef6c00", "#f9a825", "#2e7d32", "#00695c", "#00838f", "#1565c0", "#4527a0", "#6a1b9a",
  "#d81b60", "#e53935", "#fb8c00", "#fdd835", "#43a047", "#00796b", "#0097a7", "#1e88e5", "#5e35b1", "#8e24aa",
  "#ec407a", "#ef5350", "#ffa726", "#fff176", "#66bb6a", "#26a69a", "#00acc1", "#42a5f5", "#7e57c2", "#ab47bc",
  "#f06292", "#e57373", "#ffb74d", "#fff59d", "#81c784", "#4db6ac", "#4dd0e1", "#64b5f6", "#9575cd", "#ba68c8",
  "#f48fb1", "#ef9a9a", "#ffcc80", "#fff9c4", "#a5d6a7", "#80cbc4", "#80deea", "#90caf9", "#b39ddb", "#ce93d8"
];

const timers = new Map();
const intervals = new Map();
let subjectCount = 0;

function formatTime(s) {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function createSubject(name = `과목 ${++subjectCount}`, color = colors[subjectCount % colors.length]) {
  const subject = document.createElement('div');
  subject.className = 'subject';
  subject.innerHTML = `
    <div class="subject-left">
      <button class="play-btn" style="background:${color};">▶</button>
      <span class="subject-name">${name}</span>
      <input class="edit-input" type="text" style="display:none;" />
    </div>
    <div class="subject-right">
      <span class="time">00:00:00</span>
      <button class="menu-btn">⋮</button>
      <div class="menu-popup" style="display: none;">
        <button class="edit-name">이름 수정</button>
        <button class="delete-subject">삭제</button>
        <button class="change-color">색상 변경</button>
        <div class="color-palette" style="display:none;"></div>
      </div>
    </div>
  `;

  document.getElementById('subject-list').appendChild(subject);
  initSubject(subject);
}

function initSubject(subject) {
  const playBtn = subject.querySelector('.play-btn');
  const time = subject.querySelector('.time');
  const name = subject.querySelector('.subject-name');
  const input = subject.querySelector('.edit-input');
  const menuBtn = subject.querySelector('.menu-btn');
  const popup = subject.querySelector('.menu-popup');
  const editBtn = subject.querySelector('.edit-name');
  const deleteBtn = subject.querySelector('.delete-subject');
  const colorBtn = subject.querySelector('.change-color');
  const colorPalette = subject.querySelector('.color-palette');
  const subjectRight = subject.querySelector('.subject-right');

  timers.set(subject, 0);
  intervals.set(subject, null);

  playBtn.addEventListener('click', () => {
    if (intervals.get(subject)) {
      clearInterval(intervals.get(subject));
      intervals.set(subject, null);
      playBtn.textContent = '▶';
    } else {
      intervals.set(subject, setInterval(() => {
        timers.set(subject, timers.get(subject) + 1);
        time.textContent = formatTime(timers.get(subject));
      }, 1000));
      playBtn.textContent = '⏸';
    }
  });

  menuBtn.addEventListener('click', () => {
    document.querySelectorAll('.menu-popup').forEach(p => {
      if (p !== popup) p.style.display = 'none';
    });
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    if (popup.style.display === 'block') {
      popup.querySelectorAll('button').forEach(btn => btn.style.display = 'block');
      colorPalette.style.display = 'none';
    }
  });

  editBtn.addEventListener('click', () => {
    input.value = name.textContent;
    input.style.display = 'inline-block';
    name.style.display = 'none';
    subjectRight.style.display = 'none';
    input.focus();
    popup.style.display = 'none';
  });

  input.addEventListener('blur', () => {
    name.textContent = input.value.trim() || name.textContent;
    input.style.display = 'none';
    name.style.display = 'inline-block';
    subjectRight.style.display = 'flex';
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
  });

  deleteBtn.addEventListener('click', () => {
    clearInterval(intervals.get(subject));
    subject.remove();
  });

  colorBtn.addEventListener('click', () => {
    popup.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
    colorPalette.innerHTML = '';
    colorPalette.style.display = 'grid';
    colors.forEach(color => {
      const el = document.createElement('div');
      el.className = 'color-option';
      el.style.backgroundColor = color;
      el.addEventListener('click', () => {
        playBtn.style.backgroundColor = color;
        colorPalette.style.display = 'none';
        popup.style.display = 'none';
        popup.querySelectorAll('button').forEach(btn => btn.style.display = 'block');
      });
      colorPalette.appendChild(el);
    });
  });
}

document.getElementById('add-subject').addEventListener('click', () => {
  createSubject();
});

createSubject("국어", "#f48c06");
createSubject("영어", "#ffbe0b");
createSubject("수학", "#3a86ff");
createSubject("과학탐구", "#06d6a0");
createSubject("사회탐구", "#9d4edd");
