export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.running = false;
    this.previousTime = 0;
    this.frame = (time) => {
      if (!this.running) return;
      const delta = Math.min((time - this.previousTime) / 1000 || 0, 1 / 30);
      this.previousTime = time;
      this.update(delta);
      this.render(time / 1000);
      requestAnimationFrame(this.frame);
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.previousTime = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
  }
}
