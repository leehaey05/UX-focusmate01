
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
    div.innerHTML = `
      <div>${weekdays[date.getDay()]}</div>
      <div>${date.getDate()}</div>
    `;
    div.style.cursor = 'pointer';
  
    // 오늘이면 자동 포커스!
    if (date.toDateString() === today.toDateString()) {
      div.classList.add('selected-day');
    }
  
    div.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));
      div.classList.add('selected-day');
      console.log(`📅 선택된 날짜: ${date.toLocaleDateString()}`);
    });
  
    calendarBar.appendChild(div);
  });
  
}

function formatTime(s) {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}


document.addEventListener('DOMContentLoaded', () => {
  const slideContainer = document.getElementById('slide-container');
  const timerContent = document.getElementById('timer-content');
  const todoContent = document.getElementById('todo-content');

  document.querySelectorAll('.mode-tab').forEach((tab, index) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (index === 0) {
        slideContainer.style.display = 'block';
        timerContent.style.display = 'block';
        todoContent.style.display = 'none';
      } else if (index === 1) {
        slideContainer.style.display = 'block';
        timerContent.style.display = 'none';
        todoContent.style.display = 'block';
      } else {
        slideContainer.style.display = 'none';
      }
    });
  });

  renderCalendarBar(); // 날짜 생성
});

function createTodoItem() {
  const todoList = document.getElementById('todo-list');
  const todoItem = document.createElement('div');
  todoItem.className = 'todo-item';

  todoItem.innerHTML = `
    <label class="todo-check-label">
      <input type="checkbox" class="todo-check">
      <span class="custom-check">✔</span>
    </label>
    <input type="text" class="todo-input" placeholder="오늘의 계획을 입력하세요.">
    <span class="todo-text" style="display:none;"></span>
    <button class="todo-menu-btn">⋮</button>
    <div class="todo-popup" style="display: none;">
      <button class="edit-btn">수정</button>
      <button class="delete-btn">삭제</button>
    </div>
  `;

  const input = todoItem.querySelector('.todo-input');
  const span = todoItem.querySelector('.todo-text');
  const menuBtn = todoItem.querySelector('.todo-menu-btn');
  const popup = todoItem.querySelector('.todo-popup');
  const editBtn = todoItem.querySelector('.edit-btn');
  const deleteBtn = todoItem.querySelector('.delete-btn');

  let isFinalized = false;

  // 입력 완료 후 블러되면 span으로 전환
  input.addEventListener('blur', () => {
    if (!isFinalized && input.value.trim() !== '') {
      span.textContent = input.value.trim();
      input.style.display = 'none';
      span.style.display = 'inline-block';
      isFinalized = true;
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
  });

  // 점점점 버튼 클릭 → 메뉴 토글
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 클릭 이벤트가 바깥으로 안 퍼지게
  
    // 다른 팝업은 모두 닫아주고
    document.querySelectorAll('.todo-popup').forEach(p => {
      if (p !== popup) p.style.display = 'none';
    });
  
    // 내 것만 토글
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  });
  
  // 수정 버튼 클릭 → 다시 input 보이게
  editBtn.addEventListener('click', () => {
    input.style.display = 'inline-block';
    span.style.display = 'none';
    input.focus();
    popup.style.display = 'none';
    isFinalized = false; // 다시 수정 허용
  });

  // 삭제 버튼
  deleteBtn.addEventListener('click', () => {
    todoItem.remove();
  });

  todoList.appendChild(todoItem);
}



document.addEventListener('DOMContentLoaded', () => {
  // 처음에 5개만 생성
  for (let i = 0; i < 5; i++) {
    createTodoItem();
  }

  // 버튼 이벤트는 여기서만 등록
  const addTodoBtn = document.getElementById('add-todo');
  addTodoBtn.addEventListener('click', () => {
    createTodoItem();
  });
});

// 화면 아무 곳이나 클릭하면 모든 팝업 닫기
document.addEventListener('click', (e) => {
  const allPopups = document.querySelectorAll('.todo-popup');
  const allButtons = document.querySelectorAll('.todo-menu-btn');

  if (![...allPopups, ...allButtons].some(el => el.contains(e.target))) {
    allPopups.forEach(popup => popup.style.display = 'none');
  }
});







