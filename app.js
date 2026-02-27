import axios from "axios";

/* =========================
   CONFIG
========================= */
const QUOTE_API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";
const LOCAL_API_BASE = "http://localhost:3000/api/v1";

/* =========================
   QUOTE FEATURE
========================= */

/**
 * Fetch a quote from the API
 * @param {string} category - quote category
 */
const loadQuote = async (category = "general") => {
  try {
    const response = await axios.get(`${QUOTE_API_BASE}/quotes`, {
      params: { category },
    });
    const { quote, author } = response.data;

    const blockquote = document.getElementById("quote-text");
    const figcaption = document.getElementById("quote-author");

    blockquote.textContent = `"${quote}"`;
    figcaption.textContent = author;
  } catch (error) {
    console.error("Error loading quote:", error);
  }
};

const wireQuoteEvents = () => {
  const select = document.getElementById("quote-category-select");
  const button = document.getElementById("new-quote-btn");

  select?.addEventListener("change", () => {
    loadQuote(select.value);
  });

  button?.addEventListener("click", () => {
    const category = select?.value || "general";
    loadQuote(category);
  });
};

/* =========================
   TASKS FEATURE
========================= */

const loadTasks = async () => {
  try {
    const response = await axios.get(`${LOCAL_API_BASE}/tasks`);
    const tasks = response.data;
    const taskList = document.querySelector(".task-list");
    taskList.innerHTML = "";
    tasks.forEach((task) => renderTask(task));
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
};

const renderTask = (task) => {
  const taskList = document.querySelector(".task-list");
  const li = document.createElement("li");
  li.classList.add("task-item");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `task-${task.id}`;
  checkbox.checked = task.finished === 1;

  checkbox.addEventListener("change", async () => {
    try {
      await axios.patch(`${LOCAL_API_BASE}/tasks/${task.id}`, {
        finished: checkbox.checked ? 1 : 0,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      checkbox.checked = !checkbox.checked; // revert on failure
    }
  });

  const label = document.createElement("label");
  label.htmlFor = `task-${task.id}`;
  label.textContent = task.task;

  li.appendChild(checkbox);
  li.appendChild(label);
  taskList.appendChild(li);
};

const addTask = async () => {
  const input = document.getElementById("new-task");
  const taskText = input.value.trim();
  if (!taskText) return;

  try {
    const response = await axios.post(`${LOCAL_API_BASE}/tasks`, { task: taskText });
    renderTask(response.data);
    input.value = "";
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

const wireTaskEvents = () => {
  const button = document.getElementById("add-task-btn");
  const input = document.getElementById("new-task");

  button?.addEventListener("click", addTask);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });
};

/* =========================
   NOTES FEATURE
========================= */

const loadNotes = async () => {
  try {
    const response = await axios.get(`${LOCAL_API_BASE}/notes`);
    const textarea = document.getElementById("notes-text");
    textarea.value = response.data.notes;
  } catch (error) {
    console.error("Error loading notes:", error);
  }
};

const wireNotesEvents = () => {
  const textarea = document.getElementById("notes-text");
  const saveBtn = document.getElementById("save-notes-btn");

  textarea?.addEventListener("input", () => {
    saveBtn.disabled = false;
  });

  saveBtn?.addEventListener("click", async () => {
    try {
      await axios.put(`${LOCAL_API_BASE}/notes`, { notes: textarea.value });
      saveBtn.disabled = true;
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  });
};


/* =========================
   INIT
========================= */

/**
 * Initialize application
 */
const init = async () => {
  wireQuoteEvents();
  wireTaskEvents();
  wireNotesEvents();

  const select = document.getElementById("quote-category-select");
  const category = select?.value || "general";

  await loadQuote(category);
  await loadTasks();
  await loadNotes();
};

/* =========================
   EXPORT (DO NOT REMOVE)
========================= */

export { init, loadQuote, wireQuoteEvents };

init();