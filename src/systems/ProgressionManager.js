const SAVE_KEY = 'aventura3d-progress-v1';

function readSave() {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return {
      unlocked: Math.min(8, Math.max(1, Number(value.unlocked) || 1)),
      completed: Array.isArray(value.completed) ? value.completed.filter((id) => Number.isInteger(id) && id >= 1 && id <= 8) : [],
      bestItems: value.bestItems && typeof value.bestItems === 'object' ? value.bestItems : {},
    };
  } catch {
    return { unlocked: 1, completed: [], bestItems: {} };
  }
}

export class ProgressionManager {
  constructor() { this.save = readSave(); }
  isUnlocked(id) { return id <= this.save.unlocked; }
  complete(id, items) {
    if (!this.save.completed.includes(id)) this.save.completed.push(id);
    this.save.bestItems[id] = Math.max(Number(this.save.bestItems[id]) || 0, items);
    this.save.unlocked = Math.min(8, Math.max(this.save.unlocked, id + 1));
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch { /* storage can be disabled */ }
  }
}
