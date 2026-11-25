export class MovingHazard {
  constructor({ position, range = 2, speed = 1.4 }) {
    this.origin = [...position];
    this.position = [...position];
    this.range = range;
    this.speed = speed;
    this.time = 0;
    this.halfWidth = 1.15;
    this.halfDepth = 0.36;
  }

  update(delta) {
    this.time += delta;
    this.position[0] = this.origin[0] + Math.sin(this.time * this.speed) * this.range;
  }

  draw(renderer) {
    const [x, y, z] = this.position;
    renderer.drawBox([x, y + 0.35, z], [this.halfWidth, 0.35, this.halfDepth], [0.8, 0.16, 0.12]);
    renderer.drawBox([x, y + 0.73, z], [0.82, 0.06, 0.19], [1, 0.72, 0.24]);
  }
}
