const storageKey = "lift-log-state-v1";

const parts = [
  { id: "chest", name: "胸", color: "#ff5a4f" },
  { id: "back", name: "背中", color: "#4f8dff" },
  { id: "shoulders", name: "肩", color: "#f7c948" },
  { id: "triceps", name: "三頭", color: "#ff8a3d" },
  { id: "biceps", name: "二頭", color: "#c57cff" },
  { id: "legs", name: "脚", color: "#39c77f" },
];

const defaultExercises = [
  ["bench-press", "ベンチプレス", "chest", "#ff5a4f", "weight", 100],
  ["incline-db-press", "インクラインダンベルプレス", "chest", "#ff7168", "weight", 100],
  ["db-press", "ダンベルプレス", "chest", "#ff665e", "weight", 100],
  ["chest-press", "チェストプレス", "chest", "#ff7d75", "weight", 100],
  ["pec-fly", "ペックフライ", "chest", "#ff948d", "weight", 100],
  ["cable-crossover", "ケーブルクロスオーバー", "chest", "#ffaaa4", "weight", 100],
  ["dips-chest", "ディップス（胸）", "chest", "#ff5a4f", "bodyweight", 90],
  ["push-up", "腕立て伏せ", "chest", "#ff5a4f", "bodyweight", 65],
  ["lat-pulldown", "ラットプルダウン", "back", "#4f8dff", "weight", 100],
  ["deadlift", "デッドリフト", "back", "#5da0ff", "weight", 100],
  ["pull-up", "懸垂", "back", "#4f8dff", "bodyweight", 95],
  ["seated-row", "シーテッドロー", "back", "#69a6ff", "weight", 100],
  ["onehand-row", "ワンハンドロー", "back", "#7cb2ff", "weight", 100],
  ["barbell-row", "ベントオーバーロー", "back", "#8bbdff", "weight", 100],
  ["straight-arm-pulldown", "ストレートアームプルダウン", "back", "#9ac7ff", "weight", 100],
  ["shoulder-press", "ショルダープレス", "shoulders", "#f7c948", "weight", 100],
  ["side-raise", "サイドレイズ", "shoulders", "#f9d772", "weight", 100],
  ["rear-raise", "リアレイズ", "shoulders", "#f8cf5f", "weight", 100],
  ["front-raise", "フロントレイズ", "shoulders", "#f6c23f", "weight", 100],
  ["face-pull", "フェイスプル", "shoulders", "#f5bd34", "weight", 100],
  ["upright-row", "アップライトロー", "shoulders", "#f2b829", "weight", 100],
  ["triceps-pushdown", "トライセプスプッシュダウン", "triceps", "#ff8a3d", "weight", 100],
  ["skull-crusher", "スカルクラッシャー", "triceps", "#ff9955", "weight", 100],
  ["french-press", "フレンチプレス", "triceps", "#ffa66a", "weight", 100],
  ["close-grip-bench", "ナローベンチプレス", "triceps", "#ffb17a", "weight", 100],
  ["triceps-extension", "ケーブルオーバーヘッドエクステンション", "triceps", "#ffbd8b", "weight", 100],
  ["arm-curl", "アームカール", "biceps", "#c57cff", "weight", 100],
  ["hammer-curl", "ハンマーカール", "biceps", "#cf90ff", "weight", 100],
  ["preacher-curl", "プリーチャーカール", "biceps", "#d7a1ff", "weight", 100],
  ["incline-curl", "インクラインカール", "biceps", "#dfb1ff", "weight", 100],
  ["cable-curl", "ケーブルカール", "biceps", "#e7c2ff", "weight", 100],
  ["squat", "スクワット", "legs", "#39c77f", "weight", 100],
  ["leg-press", "レッグプレス", "legs", "#57d990", "weight", 100],
  ["leg-extension", "レッグエクステンション", "legs", "#68df9d", "weight", 100],
  ["leg-curl", "レッグカール", "legs", "#78e6aa", "weight", 100],
  ["romanian-deadlift", "ルーマニアンデッドリフト", "legs", "#86ebb5", "weight", 100],
  ["bulgarian-squat", "ブルガリアンスクワット", "legs", "#94efbf", "weight", 100],
  ["calf-raise", "カーフレイズ", "legs", "#a2f2c9", "weight", 100],
].map(([id, name, part, color, type, bodyRate]) => ({ id, name, part, color, type, bodyRate }));

const state = loadState();
let selectedDate = toDateKey(new Date());
let visibleMonth = startOfMonth(new Date());
let activeView = "calendar";
let selectedRecordPart = "chest";

const els = {
  views: document.querySelectorAll(".view"),
  tabs: document.querySelectorAll(".tab-button"),
  monthLabel: document.querySelector("#monthLabel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  recordDateLabel: document.querySelector("#recordDateLabel"),
  dayLogList: document.querySelector("#dayLogList"),
  recordForm: document.querySelector("#recordForm"),
  recordPartFilter: document.querySelector("#recordPartFilter"),
  exerciseSelect: document.querySelector("#exerciseSelect"),
  setEditor: document.querySelector("#setEditor"),
  setTemplate: document.querySelector("#setRowTemplate"),
  memoInput: document.querySelector("#memoInput"),
  exerciseForm: document.querySelector("#exerciseForm"),
  exerciseList: document.querySelector("#exerciseList"),
  partInput: document.querySelector("#partInput"),
  bodyWeightInput: document.querySelector("#bodyWeightInput"),
};

function loadState() {
  const fallback = {
    exercises: defaultExercises,
    logs: {},
    settings: { bodyWeight: 70 },
  };

  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey));
    if (!parsed || typeof parsed !== "object") return fallback;
    return {
      exercises: mergeDefaultExercises(normalizeExercises(parsed.exercises)),
      logs: normalizeLogs(parsed.logs),
      settings: {
        bodyWeight: Number(parsed.settings?.bodyWeight) > 0 ? Number(parsed.settings.bodyWeight) : 70,
      },
    };
  } catch {
    return fallback;
  }
}

function mergeDefaultExercises(exercises) {
  const existingIds = new Set(exercises.map((exercise) => exercise.id));
  const missingDefaults = defaultExercises.filter((exercise) => !existingIds.has(exercise.id));
  return [...exercises, ...missingDefaults];
}

function normalizeExercises(value) {
  if (!Array.isArray(value)) return defaultExercises;
  const exercises = value
    .filter((exercise) => exercise && typeof exercise.name === "string")
    .map((exercise) => ({
      id: typeof exercise.id === "string" ? exercise.id : createId(),
      name: exercise.name.trim(),
      part: normalizePartId(exercise.part),
      color: typeof exercise.color === "string" ? exercise.color : "#9aa3b2",
      type: exercise.type === "bodyweight" ? "bodyweight" : "weight",
      bodyRate: Number(exercise.bodyRate) >= 0 ? Number(exercise.bodyRate) : 100,
      archived: exercise.archived === true,
    }))
    .filter((exercise) => exercise.name);
  return exercises.length ? exercises : defaultExercises;
}

function normalizeLogs(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([dateKey, logs]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && Array.isArray(logs))
      .map(([dateKey, logs]) => [
        dateKey,
        logs
          .filter((log) => log && typeof log.exerciseId === "string" && Array.isArray(log.sets))
          .map((log) => ({
            id: typeof log.id === "string" ? log.id : createId(),
            exerciseId: log.exerciseId,
            exerciseSnapshot: normalizeExerciseSnapshot(log.exerciseSnapshot),
            memo: typeof log.memo === "string" ? log.memo : "",
            createdAt: typeof log.createdAt === "string" ? log.createdAt : new Date().toISOString(),
            sets: log.sets
              .map((set) => ({ weight: Number(set.weight) || 0, reps: Number(set.reps) || 0 }))
              .filter((set) => set.weight >= 0 && set.reps > 0),
          }))
          .filter((log) => log.sets.length),
      ])
      .filter(([, logs]) => logs.length)
  );
}

function normalizeExerciseSnapshot(value) {
  if (!value || typeof value !== "object") return null;
  return {
    name: typeof value.name === "string" ? value.name : "",
    part: normalizePartId(value.part),
    color: typeof value.color === "string" ? value.color : "#9aa3b2",
    type: value.type === "bodyweight" ? "bodyweight" : "weight",
    bodyRate: Number(value.bodyRate) >= 0 ? Number(value.bodyRate) : 100,
    bodyWeight: Number(value.bodyWeight) > 0 ? Number(value.bodyWeight) : 70,
  };
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    alert("保存できませんでした。iPhoneの空き容量やSafariのストレージ設定を確認してください。");
    return false;
  }
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromDateKey(dateKey) {
  const [year, month, date] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, date);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long" }).format(date);
}

function formatDate(dateKey) {
  return new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(fromDateKey(dateKey));
}

function getExercise(exerciseId) {
  return state.exercises.find((exercise) => exercise.id === exerciseId);
}

function getLogExercise(log) {
  const exercise = getExercise(log.exerciseId);
  if (log.exerciseSnapshot) return log.exerciseSnapshot;
  if (exercise) return exercise;
  return { name: "削除済みの種目", part: "other", color: "#9aa3b2", type: "weight", bodyRate: 100, bodyWeight: 70 };
}

function getPart(partId) {
  return parts.find((part) => part.id === partId) || parts[0];
}

function normalizePartId(partId) {
  if (parts.some((part) => part.id === partId)) return partId;
  if (partId === "arms") return "biceps";
  return "chest";
}

function getCalendarDates(monthDate) {
  const firstDate = startOfMonth(monthDate);
  const mondayIndex = (firstDate.getDay() + 6) % 7;
  const startDate = new Date(firstDate);
  startDate.setDate(firstDate.getDate() - mondayIndex);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function calculateVolume(log) {
  const exercise = getLogExercise(log);
  const bodyWeight = Number(log.exerciseSnapshot?.bodyWeight || state.settings.bodyWeight) || 0;
  return log.sets.reduce((total, set) => {
    const weight = exercise?.type === "bodyweight" ? bodyWeight * ((exercise.bodyRate || 100) / 100) + set.weight : set.weight;
    return total + weight * set.reps;
  }, 0);
}

function switchView(viewName) {
  activeView = viewName;
  els.views.forEach((view) => view.classList.toggle("is-active", view.id === `view-${viewName}`));
  els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === viewName));
  render();
}

function render() {
  renderCalendar();
  renderDayLogs();
  renderRecordPartFilter();
  renderExerciseOptions();
  renderExercises();
  els.selectedDateLabel.textContent = formatDate(selectedDate);
  els.recordDateLabel.textContent = formatDate(selectedDate);
  els.bodyWeightInput.value = state.settings.bodyWeight;
}

function renderCalendar() {
  const todayKey = toDateKey(new Date());
  els.monthLabel.textContent = formatMonth(visibleMonth);
  els.calendarGrid.innerHTML = "";

  getCalendarDates(visibleMonth).forEach((date) => {
    const dateKey = toDateKey(date);
    const logs = state.logs[dateKey] || [];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    button.setAttribute("aria-label", `${formatDate(dateKey)} ${logs.length}件`);
    if (date.getMonth() !== visibleMonth.getMonth()) button.classList.add("is-muted");
    if (dateKey === todayKey) button.classList.add("is-today");
    if (dateKey === selectedDate) button.classList.add("is-selected");

    const number = document.createElement("span");
    number.className = "date-number";
    number.textContent = date.getDate();
    button.append(number);

    const markers = document.createElement("span");
    markers.className = "day-markers";
    [...new Set(logs.map((log) => getLogExercise(log).part))]
      .filter(Boolean)
      .slice(0, 4)
      .forEach((partId) => {
        const marker = document.createElement("span");
        marker.className = "day-marker";
        marker.style.background = getPart(partId).color;
        markers.append(marker);
      });
    button.append(markers);

    button.addEventListener("click", () => {
      selectedDate = dateKey;
      visibleMonth = startOfMonth(date);
      render();
    });

    els.calendarGrid.append(button);
  });
}

function renderDayLogs() {
  const logs = state.logs[selectedDate] || [];
  els.dayLogList.innerHTML = "";
  if (!logs.length) {
    els.dayLogList.append(empty("この日の記録はまだありません。"));
    return;
  }

  logs.forEach((log) => {
    const exercise = getLogExercise(log);
    const item = document.createElement("article");
    item.className = "log-item";
    item.innerHTML = `
      <div class="log-item-head">
        <div>
          <h3>${escapeHtml(exercise.name)}</h3>
          <p class="log-meta">${escapeHtml(getPart(exercise.part).name)} / ${Math.round(calculateVolume(log)).toLocaleString()} kg</p>
        </div>
        <button class="delete-button" type="button" aria-label="記録を削除">×</button>
      </div>
      <ul class="set-lines">${log.sets
        .map((set, index) => `<li>${index + 1}. ${formatSetLine(exercise, set)}</li>`)
        .join("")}</ul>
      ${log.memo ? `<p class="log-meta">${escapeHtml(log.memo)}</p>` : ""}
    `;
    item.querySelector(".delete-button").addEventListener("click", () => deleteLog(log.id));
    els.dayLogList.append(item);
  });
}

function renderExerciseOptions() {
  const selected = els.exerciseSelect.value || state.exercises[0]?.id;
  const activeExercises = state.exercises.filter((exercise) => !exercise.archived);
  let visibleExercises = activeExercises.filter((exercise) => exercise.part === selectedRecordPart);
  if (!visibleExercises.length) visibleExercises = activeExercises;
  els.exerciseSelect.innerHTML = visibleExercises
    .map((exercise) => `<option value="${exercise.id}">${escapeHtml(exercise.name)}</option>`)
    .join("");
  if (visibleExercises.some((exercise) => exercise.id === selected)) {
    els.exerciseSelect.value = selected;
  }
}

function renderRecordPartFilter() {
  els.recordPartFilter.innerHTML = "";
  parts.forEach((part) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "part-filter-button";
    button.classList.toggle("is-active", part.id === selectedRecordPart);
    button.textContent = part.name;
    button.style.setProperty("--part-color", part.color);
    button.addEventListener("click", () => {
      selectedRecordPart = part.id;
      renderRecordPartFilter();
      renderExerciseOptions();
    });
    els.recordPartFilter.append(button);
  });
}

function renderExercises() {
  els.partInput.innerHTML = parts.map((part) => `<option value="${part.id}">${part.name}</option>`).join("");
  els.exerciseList.innerHTML = "";
  state.exercises.filter((exercise) => !exercise.archived).forEach((exercise) => {
    const item = document.createElement("article");
    item.className = "exercise-item";
    item.innerHTML = `
      <div class="exercise-item-head">
        <div>
          <h3>${escapeHtml(exercise.name)}</h3>
          <p class="exercise-meta">${escapeHtml(getPart(exercise.part).name)} / ${exercise.type === "bodyweight" ? `自重 ${exercise.bodyRate}%` : "ウェイト"}</p>
        </div>
        <button class="delete-button" type="button" aria-label="種目を削除">×</button>
      </div>
    `;
    item.style.borderColor = exercise.color;
    item.querySelector(".delete-button").addEventListener("click", () => deleteExercise(exercise.id));
    els.exerciseList.append(item);
  });
}

function addSet(weight = "", reps = "") {
  const row = els.setTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector(".set-weight").value = weight;
  row.querySelector(".set-reps").value = reps;
  row.querySelector(".delete-set").addEventListener("click", () => {
    row.remove();
    renumberSets();
  });
  els.setEditor.append(row);
  renumberSets();
}

function resetSetEditor() {
  els.setEditor.innerHTML = "";
  addSet();
  addSet();
  addSet();
}

function renumberSets() {
  els.setEditor.querySelectorAll(".set-row").forEach((row, index) => {
    row.querySelector(".set-number").textContent = index + 1;
  });
}

function readSets() {
  return [...els.setEditor.querySelectorAll(".set-row")]
    .map((row) => ({
      weight: Number(row.querySelector(".set-weight").value) || 0,
      reps: Number(row.querySelector(".set-reps").value) || 0,
    }))
    .filter((set) => set.reps > 0);
}

function repeatPrevious() {
  const exerciseId = els.exerciseSelect.value;
  const previous = Object.entries(state.logs)
    .flatMap(([dateKey, logs]) => logs.map((log) => ({ ...log, dateKey })))
    .filter((log) => log.exerciseId === exerciseId && log.dateKey < selectedDate)
    .sort((a, b) => `${b.dateKey}${b.createdAt}`.localeCompare(`${a.dateKey}${a.createdAt}`))[0];
  if (!previous) return;
  els.setEditor.innerHTML = "";
  previous.sets.forEach((set) => addSet(set.weight, set.reps));
  els.memoInput.value = previous.memo || "";
}

function deleteLog(logId) {
  const nextLogs = (state.logs[selectedDate] || []).filter((log) => log.id !== logId);
  if (nextLogs.length) state.logs[selectedDate] = nextLogs;
  else delete state.logs[selectedDate];
  if (!saveState()) return;
  render();
}

function deleteExercise(exerciseId) {
  const used = Object.values(state.logs).some((logs) => logs.some((log) => log.exerciseId === exerciseId));
  if (used) {
    if (!confirm("この種目を使った記録があります。過去ログを守るため、種目一覧から非表示にします。")) return;
    state.exercises = state.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, archived: true } : exercise));
  } else {
    state.exercises = state.exercises.filter((exercise) => exercise.id !== exerciseId);
  }
  if (!state.exercises.length) state.exercises = defaultExercises;
  if (!saveState()) return;
  render();
}

function formatSetLine(exercise, set) {
  if (exercise.type !== "bodyweight") return `${set.weight || "-"} kg × ${set.reps} reps`;
  const bodyWeight = Number(exercise.bodyWeight || state.settings.bodyWeight) || 0;
  const base = bodyWeight * ((exercise.bodyRate || 100) / 100);
  const extra = set.weight > 0 ? ` + ${set.weight}kg` : "";
  return `自重${exercise.bodyRate}%${extra} × ${set.reps} reps（約${Math.round(base + set.weight)}kg）`;
}

function empty(text) {
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = text;
  return p;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

document.querySelector("#prevMonth").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  render();
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  render();
});

document.querySelector("#todayButton").addEventListener("click", () => {
  selectedDate = toDateKey(new Date());
  visibleMonth = startOfMonth(new Date());
  switchView("calendar");
});

document.querySelector("#openRecordButton").addEventListener("click", () => switchView("record"));
document.querySelector("#addExerciseShortcut").addEventListener("click", () => switchView("exercises"));
document.querySelector("#addSetButton").addEventListener("click", () => addSet());
document.querySelector("#repeatPreviousButton").addEventListener("click", repeatPrevious);

els.tabs.forEach((tab) => tab.addEventListener("click", () => switchView(tab.dataset.view)));

els.recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const sets = readSets();
  const exercise = getExercise(els.exerciseSelect.value);
  if (!exercise) {
    alert("先に種目を追加してください。");
    return;
  }
  if (!sets.length) {
    alert("回数を入力したセットが必要です。");
    return;
  }
  const log = {
    id: createId(),
    exerciseId: els.exerciseSelect.value,
    sets,
    memo: els.memoInput.value.trim(),
    createdAt: new Date().toISOString(),
  };
  log.exerciseSnapshot = {
    name: exercise.name,
    part: exercise.part,
    color: exercise.color,
    type: exercise.type,
    bodyRate: exercise.bodyRate,
    bodyWeight: state.settings.bodyWeight,
  };
  state.logs[selectedDate] = [...(state.logs[selectedDate] || []), log];
  if (!saveState()) return;
  els.memoInput.value = "";
  resetSetEditor();
  switchView("calendar");
});

els.exerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#exerciseNameInput").value.trim();
  if (!name) return;
    state.exercises.push({
    id: createId(),
    name,
    part: normalizePartId(document.querySelector("#partInput").value),
    color: document.querySelector("#colorInput").value,
    type: document.querySelector("#typeInput").value,
    bodyRate: Number(document.querySelector("#bodyRateInput").value) || 100,
  });
  if (!saveState()) return;
  els.exerciseForm.reset();
  document.querySelector("#colorInput").value = "#ff5a4f";
  document.querySelector("#bodyRateInput").value = 100;
  render();
});

els.bodyWeightInput.addEventListener("change", () => {
  state.settings.bodyWeight = Number(els.bodyWeightInput.value) || 70;
  if (!saveState()) return;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

resetSetEditor();
render();
