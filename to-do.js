let selectedDate = new Date().toLocaleDateString(); // 오늘 날짜 기본 선택



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
    div.setAttribute('data-date', date.toLocaleDateString()); // ✅ 여기에 추가!
  
    div.innerHTML = `
      <div>${weekdays[date.getDay()]}</div>
      <div>${date.getDate()}</div>
    `;
  
    if (date.toDateString() === today.toDateString()) {
      div.classList.add('selected-day');
    }
  
    div.addEventListener('click', () => {
      handleDateClick(date); // 👈 날짜 클릭 시 동작
    });
  
    calendarBar.appendChild(div);
  });
  
}

function handleDateClick(dateObj) {
  selectedDate = dateObj.toLocaleDateString();
  document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));
  document.querySelectorAll('.calendar-day').forEach(d => {
    d.classList.toggle('selected-day', d.dataset.date === dateObj.toLocaleDateString());
  });
  
  loadTodoListForDate(selectedDate);
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
    // 없으면 기본 5개 생성
    for (let i = 0; i < 5; i++) {
      createTodoItem();
    }
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
  const todoCheckLabel = todoItem.querySelector('.todo-check-label'); // ✅ 추가됨
  const menuBtn = todoItem.querySelector('.todo-menu-btn');
  const popup = todoItem.querySelector('.todo-popup');
  const editBtn = todoItem.querySelector('.edit-btn');
  const deleteBtn = todoItem.querySelector('.delete-btn');

  let isFinalized = !!text;

  if (isFinalized) input.style.display = 'none';

  // ✅ 체크 이벤트로 파란색 배경 토글 + 저장
  checkbox.addEventListener('change', () => {
    todoCheckLabel.classList.toggle('checked', checkbox.checked);
    saveTodoListForDate(selectedDate);
  });

  // ✅ 처음부터 체크돼있다면 파란색 배경
  if (checked) {
    todoCheckLabel.classList.add('checked');
  }

  input.addEventListener('blur', () => {
    const trimmed = input.value.trim();

    if (!trimmed) {
      // ⚠️ 글자 다 지운 경우 초기화
      input.value = '';
      span.textContent = '';
      input.style.display = 'inline-block';
      span.style.display = 'none';
      isFinalized = false;
      saveTodoListForDate(selectedDate);
      return;
    }

    if (!isFinalized) {
      span.textContent = trimmed;
      input.style.display = 'none';
      span.style.display = 'inline-block';
      isFinalized = true;
      saveTodoListForDate(selectedDate);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
  });

  deleteBtn.addEventListener('click', () => {
    todoItem.remove();
    saveTodoListForDate(selectedDate);
  });

  editBtn.addEventListener('click', () => {
    input.style.display = 'inline-block';
    span.style.display = 'none';
    input.focus();
    isFinalized = false;
    popup.style.display = 'none';
  });

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.todo-popup').forEach(p => {
      if (p !== popup) p.style.display = 'none';
    });
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  });

  todoList.appendChild(todoItem);

  // ✅ 항목 추가 직후에도 저장
  saveTodoListForDate(selectedDate);
}




// ✅ 초기화는 여기서 딱 한 번만
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

  const addTodoBtn = document.getElementById('add-todo');
  addTodoBtn.addEventListener('click', () => createTodoItem());

  // 팝업 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.todo-popup') && !e.target.closest('.todo-menu-btn')) {
      document.querySelectorAll('.todo-popup').forEach(p => p.style.display = 'none');
    }
  });
});

