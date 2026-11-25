const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyX', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight']);

export class InputManager {
  constructor(target = window) {
    this.keys = new Set();
    this.justPressed = new Set();
    this.onKeyDown = (event) => {
      if (MOVEMENT_KEYS.has(event.code)) event.preventDefault();
      if (!this.keys.has(event.code)) this.justPressed.add(event.code);
      this.keys.add(event.code);
    };
    this.onKeyUp = (event) => {
      this.keys.delete(event.code);
    };
    this.onBlur = () => {
      this.keys.clear();
      this.justPressed.clear();
    };
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  down(...codes) {
    return codes.some((code) => this.keys.has(code));
  }

  pressed(code) {
    const result = this.justPressed.has(code);
    this.justPressed.delete(code);
    return result;
  }
}
