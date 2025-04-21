// 📅 오늘 날짜로 초기화된 selectedDate
let selectedDate = new Date().toLocaleDateString();

// ✅ 캘린더 바 렌더링
function renderCalendarBar() {
  const calendarBar = document.getElementById('calendar-bar');
  calendarBar.innerHTML = '';
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  const currentDay = today.getDay();
  const currentDate = today.getDate();
  const weekDates = [];

  for (let i = -currentDay; i < 7 - currentDay; i++) {
    const d = new Date(today);
    d.setDate(currentDate + i);
    weekDates.push(d);
  }

  weekDates.forEach(date => {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.setAttribute('data-date', date.toLocaleDateString());
    div.innerHTML = `
      <div>${weekdays[date.getDay()]}</div>
      <div>${date.getDate()}</div>
    `;
    if (date.toDateString() === today.toDateString()) {
      div.classList.add('selected-day');
    }
    div.addEventListener('click', () => handleDateClick(date));
    calendarBar.appendChild(div);
  });
}

function handleDateClick(dateObj) {
  selectedDate = dateObj.toLocaleDateString();
  document.querySelectorAll('.calendar-day').forEach(d => {
    d.classList.toggle('selected-day', d.dataset.date === selectedDate);
  });
  loadTodoListForDate(selectedDate);
  loadStatsForDate(selectedDate);
}

function saveTodoListForDate(date) {
  const todos = [];
  document.querySelectorAll('.todo-item').forEach(item => {
    const input = item.querySelector('.todo-input');
    const span = item.querySelector('.todo-text');
    const checkbox = item.querySelector('.todo-check');
    const text = input?.value || span?.textContent || '';
    const checked = checkbox?.checked || false;
    todos.push({ text, checked });
  });
  localStorage.setItem(`todo-${date}`, JSON.stringify(todos));
}

function loadTodoListForDate(date) {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';
  const saved = localStorage.getItem(`todo-${date}`);
  if (saved) {
    const todos = JSON.parse(saved);
    todos.forEach(todo => createTodoItem(todo.text, todo.checked));
  } else {
    for (let i = 0; i < 5; i++) createTodoItem();
  }
}

function createTodoItem(text = '', checked = false) {
  const todoList = document.getElementById('todo-list');
  const todoItem = document.createElement('div');
  todoItem.className = 'todo-item';
  todoItem.innerHTML = `
    <label class="todo-check-label">
      <input type="checkbox" class="todo-check" ${checked ? 'checked' : ''}>
      <span class="custom-check">✔</span>
    </label>
    <input type="text" class="todo-input" value="${text}" placeholder="오늘의 계획을 입력하세요.">
    <span class="todo-text" style="display: ${text ? 'inline-block' : 'none'};">${text}</span>
    <button class="todo-menu-btn">⋮</button>
    <div class="todo-popup" style="display: none;">
      <button class="edit-btn">수정</button>
      <button class="delete-btn">삭제</button>
    </div>
  `;

  const input = todoItem.querySelector('.todo-input');
  const span = todoItem.querySelector('.todo-text');
  const checkbox = todoItem.querySelector('.todo-check');
  const label = todoItem.querySelector('.todo-check-label');
  const menuBtn = todoItem.querySelector('.todo-menu-btn');
  const popup = todoItem.querySelector('.todo-popup');
  const editBtn = todoItem.querySelector('.edit-btn');
  const deleteBtn = todoItem.querySelector('.delete-btn');

  let isFinalized = !!text;
  if (isFinalized) input.style.display = 'none';
  if (checked) label.classList.add('checked');

  checkbox.addEventListener('change', () => {
    label.classList.toggle('checked', checkbox.checked);
    saveTodoListForDate(selectedDate);
  });

  input.addEventListener('blur', () => {
    const trimmed = input.value.trim();
    if (!trimmed) {
      input.value = ''; span.textContent = '';
      input.style.display = 'inline-block';
      span.style.display = 'none';
      isFinalized = false;
    } else {
      span.textContent = trimmed;
      input.style.display = 'none';
      span.style.display = 'inline-block';
      isFinalized = true;
    }
    saveTodoListForDate(selectedDate);
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  deleteBtn.addEventListener('click', () => { todoItem.remove(); saveTodoListForDate(selectedDate); });
  editBtn.addEventListener('click', () => {
    input.style.display = 'inline-block';
    span.style.display = 'none';
    input.focus();
    isFinalized = false;
    popup.style.display = 'none';
  });
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.todo-popup').forEach(p => p !== popup && (p.style.display = 'none'));
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  });

  todoList.appendChild(todoItem);
  saveTodoListForDate(selectedDate);
}

function loadStatsForDate(date) {
  const stats = JSON.parse(localStorage.getItem(`stats-${date}`));
  document.getElementById('total-time').textContent = stats ? formatTime(stats.total) : '00:00:00';
  document.getElementById('todo-focus-time').textContent = stats ? formatTime(stats.focus) : '00:00:00';
  document.getElementById('todo-distraction-time').textContent = stats ? formatTime(stats.distraction) : '00:00:00';
  document.getElementById('todo-unknown-time').textContent = stats ? formatTime(stats.unknown) : '00:00:00';
}

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ✅ DOMContentLoaded 에서 초기 렌더링 및 이벤트 등록

document.addEventListener('DOMContentLoaded', () => {
  const slideContainer = document.getElementById('slide-container');
  const timerContent = document.getElementById('timer-content');
  const todoContent = document.getElementById('todo-content');

  document.querySelectorAll('.mode-tab').forEach((tab, index) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      slideContainer.style.display = 'block';
      timerContent.style.display = index === 0 ? 'block' : 'none';
      todoContent.style.display = index === 1 ? 'block' : 'none';
    });
  });

  renderCalendarBar();
  loadTodoListForDate(selectedDate);
  loadStatsForDate(selectedDate);

  document.getElementById('add-todo').addEventListener('click', () => createTodoItem());

  // ✅ 통계 초기화 버튼
  const resetBtn = document.getElementById('reset-summary');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('total-time').textContent = '00:00:00';
      document.getElementById('todo-distraction-time').textContent = '00:00:00';
      document.getElementById('todo-focus-time').textContent = '00:00:00';
      document.getElementById('todo-unknown-time').textContent = '00:00:00';

      const resetStats = {
        total: 0,
        focus: 0,
        distraction: 0,
        unknown: 0
      };
      localStorage.setItem(`stats-${selectedDate}`, JSON.stringify(resetStats));

      const popup = resetBtn.closest('.summary-popup');
      if (popup) popup.style.display = 'none';
    });
  }

document.addEventListener('click', (e) => {
  const allTodoPopups = document.querySelectorAll('.todo-popup');
  const summaryBtn = document.querySelector('.summary-menu-btn');
  const summaryPopup = document.querySelector('.summary-popup');

  const clickedTodoBtn = e.target.closest('.todo-menu-btn');
  const clickedTodoPopup = e.target.closest('.todo-popup');
  const clickedSummaryBtn = e.target.closest('.summary-menu-btn');
  const clickedSummaryPopup = e.target.closest('.summary-popup');

  // 1️⃣ todo 버튼 클릭 시
  if (clickedTodoBtn) {
    // summary 닫기
    if (summaryPopup) summaryPopup.style.display = 'none';

    // 현재 todo만 열기
    const thisPopup = clickedTodoBtn.nextElementSibling;
    allTodoPopups.forEach(p => {
      if (p !== thisPopup) p.style.display = 'none';
    });
    thisPopup.style.display = thisPopup.style.display === 'block' ? 'none' : 'block';
    return;
  }

  // 2️⃣ summary 버튼 클릭 시
  if (clickedSummaryBtn) {
    // 모든 todo 닫기
    allTodoPopups.forEach(p => p.style.display = 'none');

    // summary popup toggle
    summaryPopup.style.display = summaryPopup.style.display === 'block' ? 'none' : 'block';
    return;
  }

  // 3️⃣ 외부 클릭 시 모두 닫기
  if (!clickedTodoPopup && !clickedSummaryPopup) {
    allTodoPopups.forEach(p => p.style.display = 'none');
    if (summaryPopup) summaryPopup.style.display = 'none';
  }
});

  
  
});