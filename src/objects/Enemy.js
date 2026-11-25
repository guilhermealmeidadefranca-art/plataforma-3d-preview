export class Enemy {
  constructor({ position, patrolRange = 1.5, speed = 1 }) {
    this.origin = [...position];
    this.position = [...position];
    this.patrolRange = patrolRange;
    this.speed = speed;
    this.time = 0;
    this.defeated = false;
  }

  update(delta) {
    if (this.defeated) return;
    this.time += delta;
    this.position[0] = this.origin[0] + Math.sin(this.time * this.speed) * this.patrolRange;
  }

  defeat() {
    if (this.defeated) return false;
    this.defeated = true;
    return true;
  }

  draw(renderer) {
    if (this.defeated) return;
    const [x, y, z] = this.position;
    const lean = Math.sin(this.time * 4) * 0.08;
    renderer.drawBox([x, y + 0.55, z], [0.42, 0.55, 0.38], [0.45, 0.22, 0.62], lean);
    renderer.drawBox([x, y + 1.17, z - 0.02], [0.3, 0.28, 0.29], [0.67, 0.4, 0.78], lean);
    renderer.drawBox([x - 0.12, y + 1.2, z - 0.29], [0.05, 0.06, 0.025], [1, 0.85, 0.35]);
    renderer.drawBox([x + 0.12, y + 1.2, z - 0.29], [0.05, 0.06, 0.025], [1, 0.85, 0.35]);
  }
}
