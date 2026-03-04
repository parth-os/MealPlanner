const STORAGE_KEY = "mealPlannerDataV1";
const INGREDIENTS_KEY = "mealPlannerIngredientsV1";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PANTRY_SUGGESTIONS = [
  "rice",
  "pasta",
  "lentils",
  "beans",
  "eggs",
  "bread",
  "chickpeas",
  "canned tomatoes",
  "garlic",
  "onion",
  "olive oil",
  "yogurt",
  "moong dal",
  "suji",
  "poha",
  "ghee",
  "ragi flour",
  "besan",
];

const VEGETABLE_SUGGESTIONS = [
  "spinach",
  "broccoli",
  "carrot",
  "bell pepper",
  "zucchini",
  "cauliflower",
  "cabbage",
  "mushroom",
  "tomato",
  "potato",
  "peas",
  "green beans",
  "bottle gourd",
  "pumpkin",
  "beetroot",
  "sweet potato",
];

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "egg-free", label: "Egg-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "gluten-free", label: "Gluten-free" },
];

const LOCAL_RECIPES = [
  { name: "Veggie Omelette", required: ["eggs", "onion"], optional: ["tomato", "spinach", "mushroom"], tags: ["breakfast", "high-protein"], timeMins: 15 },
  { name: "Chickpea Spinach Curry", required: ["chickpeas", "onion", "garlic"], optional: ["spinach", "tomato", "rice"], tags: ["vegan", "one-pot"], timeMins: 30 },
  { name: "Pasta Primavera", required: ["pasta", "olive oil", "garlic"], optional: ["broccoli", "bell pepper", "zucchini"], tags: ["vegetarian", "quick"], timeMins: 25 },
  { name: "Lentil Soup", required: ["lentils", "onion", "carrot"], optional: ["garlic", "tomato", "cabbage"], tags: ["vegan", "soup"], timeMins: 35 },
  { name: "Rice and Beans Bowl", required: ["rice", "beans"], optional: ["tomato", "onion", "bell pepper"], tags: ["vegan", "meal-prep"], timeMins: 20 },
  { name: "Vegetable Fried Rice", required: ["rice", "eggs", "onion"], optional: ["peas", "carrot", "green beans"], tags: ["quick", "one-pan"], timeMins: 20 },
  { name: "Tomato Basil Pasta", required: ["pasta", "tomato", "olive oil"], optional: ["garlic", "onion", "spinach"], tags: ["vegetarian", "quick"], timeMins: 18 },
  { name: "Aloo Matar", required: ["potato", "peas", "onion"], optional: ["tomato", "garlic", "rice"], tags: ["vegan", "indian"], timeMins: 30 },
  { name: "Moong Dal Khichdi (Baby)", required: ["rice", "moong dal"], optional: ["carrot", "bottle gourd", "ghee"], tags: ["indian", "baby-friendly", "toddler-friendly", "one-pot"], timeMins: 25 },
  { name: "Vegetable Suji Upma (Toddler)", required: ["suji", "onion"], optional: ["carrot", "peas", "ghee"], tags: ["indian", "toddler-friendly", "quick"], timeMins: 18 },
  { name: "Ragi Porridge", required: ["ragi flour"], optional: ["ghee", "milk", "banana"], tags: ["indian", "baby-friendly", "breakfast"], timeMins: 12 },
  { name: "Poha with Veg (Toddler)", required: ["poha", "onion"], optional: ["peas", "carrot", "potato"], tags: ["indian", "toddler-friendly", "quick"], timeMins: 15 },
  { name: "Dal Rice Mash", required: ["rice", "lentils"], optional: ["ghee", "pumpkin", "carrot"], tags: ["indian", "baby-friendly", "comfort"], timeMins: 25 },
  { name: "Pumpkin Dal Soup (Baby)", required: ["pumpkin", "moong dal"], optional: ["ghee", "garlic", "carrot"], tags: ["indian", "baby-friendly", "soup"], timeMins: 22 },
  { name: "Besan Chilla (Soft)", required: ["besan", "onion"], optional: ["tomato", "spinach", "ghee"], tags: ["indian", "toddler-friendly", "breakfast"], timeMins: 15 },
];

const ingredientState = loadIngredients();

const state = {
  view: "month",
  cursorDate: startOfDay(new Date()),
  selectedDate: startOfDay(new Date()),
  mealsByDate: loadMeals(),
  pantry: ingredientState.pantry,
  vegetables: ingredientState.vegetables,
  dietaryRestrictions: ingredientState.dietaryRestrictions,
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
const pantryInput = document.getElementById("pantryInput");
const vegetablesInput = document.getElementById("vegetablesInput");
const pantrySelected = document.getElementById("pantrySelected");
const vegetablesSelected = document.getElementById("vegetablesSelected");
const pantrySuggestions = document.getElementById("pantrySuggestions");
const vegetablesSuggestions = document.getElementById("vegetablesSuggestions");
const restrictionOptions = document.getElementById("restrictionOptions");
const recommendBtn = document.getElementById("recommendBtn");
const recommendResults = document.getElementById("recommendResults");
const calendarTooltip = createCalendarTooltip();

monthViewBtn.addEventListener("click", () => setView("month"));
weekViewBtn.addEventListener("click", () => setView("week"));
prevBtn.addEventListener("click", () => movePeriod(-1));
nextBtn.addEventListener("click", () => movePeriod(1));
clearBtn.addEventListener("click", clearSelectedDay);
mealForm.addEventListener("submit", saveSelectedDay);
recommendBtn.addEventListener("click", recommendMeals);

setupChipInput(pantryInput, "pantry");
setupChipInput(vegetablesInput, "vegetables");

render();
renderIngredientSelectors();

function setupChipInput(input, category) {
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const items = input.value
      .split(",")
      .map((v) => normalizeIngredient(v))
      .filter(Boolean);

    if (!items.length) {
      return;
    }

    addIngredients(category, items);
    input.value = "";
  });
}

function setView(nextView) {
  state.view = nextView;

  monthViewBtn.classList.toggle("active", nextView === "month");
  weekViewBtn.classList.toggle("active", nextView === "week");
  monthViewBtn.setAttribute("aria-selected", String(nextView === "month"));
  weekViewBtn.setAttribute("aria-selected", String(nextView === "week"));

  render();
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

  const hoverLines = [];
  if (meals.breakfast && meals.breakfast.trim()) {
    hoverLines.push(`Breakfast: ${meals.breakfast}`);
  }
  if (meals.lunch && meals.lunch.trim()) {
    hoverLines.push(`Lunch: ${meals.lunch}`);
  }
  if (meals.dinner && meals.dinner.trim()) {
    hoverLines.push(`Dinner: ${meals.dinner}`);
  }
  const hoverText = hoverLines.length ? hoverLines.join("\n") : "No meals logged";
  button.removeAttribute("title");
  button.addEventListener("mouseenter", (event) => {
    showCalendarTooltip(hoverText, event.clientX, event.clientY);
  });
  button.addEventListener("mousemove", (event) => {
    moveCalendarTooltip(event.clientX, event.clientY);
  });
  button.addEventListener("mouseleave", hideCalendarTooltip);
  button.addEventListener("focus", () => {
    const rect = button.getBoundingClientRect();
    showCalendarTooltip(hoverText, rect.left + rect.width / 2, rect.top);
  });
  button.addEventListener("blur", hideCalendarTooltip);

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

  if (!payload.breakfast && !payload.lunch && !payload.dinner) {
    delete state.mealsByDate[key];
  } else {
    state.mealsByDate[key] = {
      breakfast: payload.breakfast,
      lunch: payload.lunch,
      dinner: payload.dinner,
    };
  }

  persistMeals();

  // Database integration (Edge Config) temporarily disabled.
  // Uncomment to re-enable remote persistence.
  // try {
  //   await fetch("/api/meals", {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });
  // } catch {
  //   // Keep local save even if remote is unavailable.
  // }

  render();
}

async function clearSelectedDay() {
  const key = dateKey(state.selectedDate);
  delete state.mealsByDate[key];
  persistMeals();

  // Database integration (Edge Config) temporarily disabled.
  // Uncomment to re-enable remote delete.
  // try {
  //   await fetch("/api/meals", {
  //     method: "DELETE",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ date: key }),
  //   });
  // } catch {
  //   // Keep local delete even if remote is unavailable.
  // }

  render();
}

function addIngredients(category, values) {
  const current = new Set(state[category]);
  values.forEach((value) => {
    current.add(value);
  });

  state[category] = [...current];
  persistIngredients();
  renderIngredientSelectors();
}

function removeIngredient(category, value) {
  state[category] = state[category].filter((item) => item !== value);
  persistIngredients();
  renderIngredientSelectors();
}

function renderIngredientSelectors() {
  renderSelectedChips("pantry", pantrySelected);
  renderSelectedChips("vegetables", vegetablesSelected);
  renderSuggestionChips("pantry", PANTRY_SUGGESTIONS, pantrySuggestions);
  renderSuggestionChips("vegetables", VEGETABLE_SUGGESTIONS, vegetablesSuggestions);
  renderRestrictionOptions();
}

function renderRestrictionOptions() {
  restrictionOptions.innerHTML = "";
  DIETARY_OPTIONS.forEach((option) => {
    const label = document.createElement("label");
    label.className = "restriction-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.dietaryRestrictions.includes(option.id);
    input.addEventListener("change", () => {
      toggleRestriction(option.id, input.checked);
    });

    const text = document.createElement("span");
    text.textContent = option.label;
    label.append(input, text);
    restrictionOptions.appendChild(label);
  });
}

function toggleRestriction(restriction, enabled) {
  const next = new Set(state.dietaryRestrictions);
  if (enabled) {
    next.add(restriction);
  } else {
    next.delete(restriction);
  }
  state.dietaryRestrictions = [...next];
  persistIngredients();
}

function renderSelectedChips(category, container) {
  container.innerHTML = "";
  state[category].forEach((item) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip selected";
    chip.innerHTML = `${escapeHtml(item)} <span class="remove">×</span>`;
    chip.addEventListener("click", () => removeIngredient(category, item));
    container.appendChild(chip);
  });
}

function renderSuggestionChips(category, source, container) {
  container.innerHTML = "";
  source.forEach((raw) => {
    const value = normalizeIngredient(raw);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip ${state[category].includes(value) ? "selected" : ""}`;
    chip.textContent = raw;
    chip.addEventListener("click", () => {
      if (state[category].includes(value)) {
        removeIngredient(category, value);
      } else {
        addIngredients(category, [value]);
      }
    });
    container.appendChild(chip);
  });
}

async function recommendMeals() {
  recommendBtn.disabled = true;

  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pantry: state.pantry,
        vegetables: state.vegetables,
        prefs: {
          view: state.view,
          selectedDate: dateKey(state.selectedDate),
          dietaryRestrictions: state.dietaryRestrictions,
        },
      }),
    });

    const data = await safeJson(response);
    if (!response.ok) {
      throw new Error(data?.error || "Could not generate recommendations.");
    }

    renderRecommendations(data);
  } catch (error) {
    const fallback = recommendMealsLocally();
    renderRecommendations(fallback);
    const note = document.createElement("p");
    note.className = "helper";
    note.textContent = `Using offline recommendations (${error?.message || "network unavailable"}).`;
    recommendResults.prepend(note);
  } finally {
    recommendBtn.disabled = false;
  }
}

function renderRecommendations(data) {
  const makeNow = Array.isArray(data.makeNow) ? data.makeNow : [];
  const withFewMissing = Array.isArray(data.withFewMissing) ? data.withFewMissing : [];

  recommendResults.innerHTML = "";
  const applied = document.createElement("p");
  applied.className = "helper";
  applied.textContent = state.dietaryRestrictions.length
    ? `Applied restrictions: ${state.dietaryRestrictions.join(", ")}`
    : "Applied restrictions: none";
  recommendResults.appendChild(applied);

  recommendResults.append(
    createResultGroup("Make now", makeNow, "You already have all required ingredients."),
    createResultGroup("With few missing", withFewMissing, "Up to 2 required ingredients missing.")
  );
}

function createResultGroup(title, items, emptyText) {
  const group = document.createElement("div");
  group.className = "result-group";

  const heading = document.createElement("h4");
  heading.textContent = title;
  group.appendChild(heading);

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "helper";
    empty.textContent = emptyText;
    group.appendChild(empty);
    return group;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "result-item";

    const name = document.createElement("div");
    name.className = "result-name";
    name.textContent = `${item.name} · ${item.timeMins} mins`;

    const tags = document.createElement("div");
    tags.className = "helper";
    tags.textContent = `Tags: ${(item.tags || []).join(", ") || "none"}`;

    const missing = document.createElement("div");
    missing.className = "missing";
    missing.textContent = item.missingRequired?.length
      ? `Missing: ${item.missingRequired.join(", ")}`
      : "Missing: none";

    row.append(name, tags, missing);
    group.appendChild(row);
  });

  return group;
}

function recommendMealsLocally() {
  const available = new Set([...state.pantry, ...state.vegetables].map(normalizeIngredient));
  const restrictions = state.dietaryRestrictions.map(normalizeIngredient);

  const ranked = LOCAL_RECIPES.filter((recipe) => recipeMatchesRestrictions(recipe, restrictions)).map((recipe) => {
    const required = recipe.required.map(normalizeIngredient);
    const optional = recipe.optional.map(normalizeIngredient);
    const missingRequired = required.filter((item) => !available.has(item));
    const optionalHits = optional.filter((item) => available.has(item)).length;
    const score = (required.length - missingRequired.length) * 4 + optionalHits * 2 - recipe.timeMins / 20;

    return {
      name: recipe.name,
      tags: recipe.tags,
      timeMins: recipe.timeMins,
      missingRequired,
      score,
    };
  });

  const makeNow = ranked
    .filter((item) => item.missingRequired.length === 0)
    .sort((a, b) => b.score - a.score || a.timeMins - b.timeMins || a.name.localeCompare(b.name))
    .slice(0, 5);

  const withFewMissing = ranked
    .filter((item) => item.missingRequired.length > 0 && item.missingRequired.length <= 2)
    .sort(
      (a, b) =>
        a.missingRequired.length - b.missingRequired.length ||
        b.score - a.score ||
        a.timeMins - b.timeMins ||
        a.name.localeCompare(b.name)
    )
    .slice(0, 5);

  return { makeNow, withFewMissing };
}

function recipeMatchesRestrictions(recipe, restrictions) {
  if (!restrictions.length) {
    return true;
  }

  const ingredients = [...recipe.required, ...recipe.optional].map(normalizeIngredient);
  const tags = recipe.tags.map(normalizeIngredient);

  for (const restriction of restrictions) {
    if (restriction === "vegan") {
      if (
        !tags.includes("vegan") ||
        ingredients.some((item) => ["eggs", "yogurt", "ghee", "milk"].includes(item))
      ) {
        return false;
      }
    }

    if (restriction === "egg-free" && ingredients.includes("eggs")) {
      return false;
    }

    if (
      restriction === "dairy-free" &&
      ingredients.some((item) => ["yogurt", "ghee", "milk"].includes(item))
    ) {
      return false;
    }

    if (
      restriction === "gluten-free" &&
      ingredients.some((item) => ["bread", "pasta", "suji"].includes(item))
    ) {
      return false;
    }
  }

  return true;
}

function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistMeals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.mealsByDate));
}

function loadIngredients() {
  try {
    const raw = localStorage.getItem(INGREDIENTS_KEY);
    if (!raw) {
      return { pantry: [], vegetables: [], dietaryRestrictions: [] };
    }

    const data = JSON.parse(raw);
    return {
      pantry: Array.isArray(data.pantry) ? data.pantry.map(normalizeIngredient).filter(Boolean) : [],
      vegetables: Array.isArray(data.vegetables)
        ? data.vegetables.map(normalizeIngredient).filter(Boolean)
        : [],
      dietaryRestrictions: Array.isArray(data.dietaryRestrictions)
        ? data.dietaryRestrictions
            .map((value) => String(value || "").trim().toLowerCase())
            .filter((value) => DIETARY_OPTIONS.some((option) => option.id === value))
        : [],
    };
  } catch {
    return { pantry: [], vegetables: [], dietaryRestrictions: [] };
  }
}

function persistIngredients() {
  localStorage.setItem(
    INGREDIENTS_KEY,
    JSON.stringify({
      pantry: state.pantry,
      vegetables: state.vegetables,
      dietaryRestrictions: state.dietaryRestrictions,
    })
  );
}

function normalizeIngredient(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createCalendarTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "calendar-tooltip hidden";
  document.body.appendChild(tooltip);
  return tooltip;
}

function showCalendarTooltip(text, x, y) {
  calendarTooltip.textContent = text;
  calendarTooltip.classList.remove("hidden");
  moveCalendarTooltip(x, y);
}

function moveCalendarTooltip(x, y) {
  const offset = 12;
  calendarTooltip.style.left = `${x + offset}px`;
  calendarTooltip.style.top = `${y + offset}px`;
}

function hideCalendarTooltip() {
  calendarTooltip.classList.add("hidden");
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
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
