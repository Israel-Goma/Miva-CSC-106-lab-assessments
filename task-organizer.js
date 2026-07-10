class TaskOrganizer {
  constructor() {
    this.storageKey = "israel-organizer-log";
    this.form = document.getElementById("organizer-form");
    this.titleField = document.getElementById("organizer-title");
    this.dueField = document.getElementById("organizer-due");
    this.priorityField = document.getElementById("organizer-priority");
    this.listEl = document.getElementById("organizer-list");
    this.emptyEl = document.getElementById("organizer-empty");
    this.filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
    this.clearButton = document.getElementById("organizer-clear");

    this.entries = this.load();
    this.activeFilter = "all";

    this.bindEvents();
    this.render();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
  }

  static makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  static isLate(entry) {
    if (!entry.due || entry.done) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(entry.due) < today;
  }

  static formatDue(due) {
    if (!due) return "No due date";
    return new Date(due).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  visibleEntries() {
    if (this.activeFilter === "active") return this.entries.filter((e) => !e.done);
    if (this.activeFilter === "done") return this.entries.filter((e) => e.done);
    return this.entries;
  }

  addEntry(title, due, priority) {
    this.entries.unshift({ id: TaskOrganizer.makeId(), title, due: due || null, priority, done: false });
    this.persist();
    this.render();
  }

  toggleEntry(id) {
    const entry = this.entries.find((e) => e.id === id);
    if (entry) {
      entry.done = !entry.done;
      this.persist();
      this.render();
    }
  }

  removeEntry(id) {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.persist();
    this.render();
  }

  clearDone() {
    this.entries = this.entries.filter((e) => !e.done);
    this.persist();
    this.render();
  }

  buildRow(entry) {
    const row = document.createElement("li");
    row.className = `organizer-item${entry.done ? " is-done" : ""}`;
    row.dataset.id = entry.id;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "organizer-item__check";
    check.checked = entry.done;
    check.setAttribute("aria-label", `Mark "${entry.title}" as ${entry.done ? "not done" : "done"}`);
    check.addEventListener("change", () => this.toggleEntry(entry.id));

    const body = document.createElement("div");
    body.className = "organizer-item__body";

    const title = document.createElement("div");
    title.className = "organizer-item__title";
    title.textContent = entry.title;

    const meta = document.createElement("div");
    meta.className = "organizer-item__meta";

    const flag = document.createElement("span");
    flag.className = `priority-flag priority-flag--${entry.priority}`;
    flag.textContent = entry.priority;

    const due = document.createElement("span");
    due.className = `organizer-item__due${TaskOrganizer.isLate(entry) ? " is-late" : ""}`;
    due.textContent = TaskOrganizer.formatDue(entry.due);

    meta.append(flag, due);
    body.append(title, meta);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "organizer-item__remove";
    remove.setAttribute("aria-label", `Remove "${entry.title}"`);
    remove.textContent = "✕";
    remove.addEventListener("click", () => this.removeEntry(entry.id));

    row.append(check, body, remove);
    return row;
  }

  render() {
    this.listEl.innerHTML = "";
    const visible = this.visibleEntries();
    visible.forEach((entry) => this.listEl.appendChild(this.buildRow(entry)));

    this.emptyEl.classList.toggle("is-shown", visible.length === 0);
    this.emptyEl.textContent =
      this.entries.length === 0
        ? "No tasks yet — add your first one above."
        : "No tasks match this filter.";
  }

  bindEvents() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.titleField.value.trim();
      if (!title) return;

      this.addEntry(title, this.dueField.value, this.priorityField.value);
      this.form.reset();
      this.priorityField.value = "medium";
      this.titleField.focus();
    });

    this.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.filterButtons.forEach((b) => b.classList.remove("is-active"));
        button.classList.add("is-active");
        this.activeFilter = button.dataset.filter;
        this.render();
      });
    });

    this.clearButton.addEventListener("click", () => this.clearDone());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("organizer-form")) {
    new TaskOrganizer();
  }
});
