const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const state = {
  view: "month",
  cursorDate: startOfDay(new Date()),
  selectedDate: startOfDay(new Date()),
  mealsByDate: {},
  loading: false,
};

const monthViewBtn = document.getElementById("monthViewBtn");
const weekViewBtn = document.getElementById("weekViewBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const periodLabel = document.getElementById("periodLabel");
const weekdayHeader = document.getElementById("weekdayHeader");
const calendarGrid = document.getElementById("calendarGrid");
const editorDate = document.getElementById("editorDate");
const mealForm = document.getElementById("mealForm");
const breakfastInput = document.getElementById("breakfastInput");
const lunchInput = document.getElementById("lunchInput");
const dinnerInput = document.getElementById("dinnerInput");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = mealForm.querySelector('button[type="submit"]');

monthViewBtn.addEventListener("click", () => setView("month"));
weekViewBtn.addEventListener("click", () => setView("week"));
prevBtn.addEventListener("click", () => movePeriod(-1));
nextBtn.addEventListener("click", () => movePeriod(1));
clearBtn.addEventListener("click", clearSelectedDay);
mealForm.addEventListener("submit", saveSelectedDay);

bootstrap();

async function bootstrap() {
  render();
  await refreshVisibleRange();
}

function setView(nextView) {
  state.view = nextView;

  monthViewBtn.classList.toggle("active", nextView === "month");
  weekViewBtn.classList.toggle("active", nextView === "week");
  monthViewBtn.setAttribute("aria-selected", String(nextView === "month"));
  weekViewBtn.setAttribute("aria-selected", String(nextView === "week"));

  render();
  refreshVisibleRange();
}

function movePeriod(direction) {
  const d = new Date(state.cursorDate);
  if (state.view === "month") {
    d.setMonth(d.getMonth() + direction);
    d.setDate(1);
  } else {
    d.setDate(d.getDate() + direction * 7);
  }
  state.cursorDate = startOfDay(d);
  render();
  refreshVisibleRange();
}

function render() {
  renderWeekdayHeader();
  if (state.view === "month") {
    renderMonthGrid();
  } else {
    renderWeekGrid();
  }
  renderEditor();
}

function renderWeekdayHeader() {
  weekdayHeader.innerHTML = "";
  DAY_NAMES.forEach((day) => {
    const span = document.createElement("span");
    span.textContent = day;
    weekdayHeader.appendChild(span);
  });
}

function renderMonthGrid() {
  calendarGrid.innerHTML = "";
  const year = state.cursorDate.getFullYear();
  const month = state.cursorDate.getMonth();

  periodLabel.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    calendarGrid.appendChild(buildDayCell(day, day.getMonth() !== month));
  }
}

function renderWeekGrid() {
  calendarGrid.innerHTML = "";

  const weekStart = new Date(state.cursorDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  periodLabel.textContent = `${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)} ${weekEnd.getFullYear()}`;

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    calendarGrid.appendChild(buildDayCell(day, false));
  }
}

function buildDayCell(day, isMuted) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "day-cell";

  if (isMuted) {
    button.classList.add("muted");
  }

  const key = dateKey(day);
  if (dateKey(state.selectedDate) === key) {
    button.classList.add("selected");
  }

  const todayKey = dateKey(new Date());
  const dayNumber = document.createElement("div");
  dayNumber.className = "date-number";
  dayNumber.textContent = String(day.getDate());

  if (key === todayKey) {
    const pill = document.createElement("span");
    pill.className = "today-pill";
    pill.textContent = "today";
    dayNumber.appendChild(pill);
  }

  const preview = document.createElement("div");
  preview.className = "meal-preview";
  const meals = state.mealsByDate[key] || {};

  appendMealLine(preview, "B", meals.breakfast);
  appendMealLine(preview, "L", meals.lunch);
  appendMealLine(preview, "D", meals.dinner);

  button.append(dayNumber, preview);
  button.addEventListener("click", () => {
    state.selectedDate = startOfDay(day);
    state.cursorDate = startOfDay(day);
    render();
  });

  return button;
}

function appendMealLine(parent, shortLabel, value) {
  if (!value || !value.trim()) {
    return;
  }
  const row = document.createElement("div");
  row.textContent = `${shortLabel}: ${value}`;
  parent.appendChild(row);
}

function renderEditor() {
  const key = dateKey(state.selectedDate);
  const meals = state.mealsByDate[key] || {};

  editorDate.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(state.selectedDate);

  breakfastInput.value = meals.breakfast || "";
  lunchInput.value = meals.lunch || "";
  dinnerInput.value = meals.dinner || "";
}

async function saveSelectedDay(event) {
  event.preventDefault();
  const key = dateKey(state.selectedDate);
  const payload = {
    date: key,
    breakfast: breakfastInput.value.trim(),
    lunch: lunchInput.value.trim(),
    dinner: dinnerInput.value.trim(),
  };

  setSaving(true);
  try {
    const response = await fetch("/api/meals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("save failed");
    }

    if (!payload.breakfast && !payload.lunch && !payload.dinner) {
      delete state.mealsByDate[key];
    } else {
      state.mealsByDate[key] = {
        breakfast: payload.breakfast,
        lunch: payload.lunch,
        dinner: payload.dinner,
      };
    }

    render();
  } catch {
    alert("Could not save meals right now.");
  } finally {
    setSaving(false);
  }
}

async function clearSelectedDay() {
  const key = dateKey(state.selectedDate);

  setSaving(true);
  try {
    const response = await fetch("/api/meals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: key }),
    });

    if (!response.ok) {
      throw new Error("delete failed");
    }

    delete state.mealsByDate[key];
    render();
  } catch {
    alert("Could not clear meals right now.");
  } finally {
    setSaving(false);
  }
}

async function refreshVisibleRange() {
  const { start, end } = getVisibleRange();
  const startKey = dateKey(start);
  const endKey = dateKey(end);

  state.loading = true;

  try {
    const response = await fetch(`/api/meals?start=${encodeURIComponent(startKey)}&end=${encodeURIComponent(endKey)}`);
    if (!response.ok) {
      throw new Error("load failed");
    }

    const data = await response.json();
    state.mealsByDate = { ...state.mealsByDate, ...(data.meals || {}) };
    render();
  } catch {
    alert("Could not load meals from storage right now.");
  } finally {
    state.loading = false;
  }
}

function getVisibleRange() {
  if (state.view === "month") {
    const firstOfMonth = new Date(state.cursorDate.getFullYear(), state.cursorDate.getMonth(), 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 41);
    return { start, end };
  }

  const start = new Date(state.cursorDate);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function setSaving(isSaving) {
  breakfastInput.disabled = isSaving;
  lunchInput.disabled = isSaving;
  dinnerInput.disabled = isSaving;
  clearBtn.disabled = isSaving;
  saveBtn.disabled = isSaving;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMonthDay(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
