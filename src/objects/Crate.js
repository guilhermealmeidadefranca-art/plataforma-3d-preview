export class Crate {
  constructor({ position, drops = 1, color = [0.62, 0.34, 0.14] }) {
    this.position = [...position];
    this.halfSize = 0.5;
    this.drops = drops;
    this.color = color;
    this.broken = false;
    this.breakAge = 0;
    this.fragments = [];
  }

  break() {
    if (this.broken) return [];
    this.broken = true;
    this.fragments = Array.from({ length: 7 }, (_, index) => ({
      offset: [((index % 3) - 1) * 0.2, 0, (Math.floor(index / 3) - 1) * 0.2],
      velocity: [((index % 3) - 1) * 2.2, 2.5 + (index % 2), (Math.floor(index / 3) - 1) * 2],
    }));
    return Array.from({ length: this.drops }, (_, index) => [
      this.position[0] + (index - (this.drops - 1) / 2) * 0.32,
      this.position[1] + 0.4,
      this.position[2],
    ]);
  }

  update(delta) {
    if (!this.broken) return;
    this.breakAge += delta;
    for (const fragment of this.fragments) {
      fragment.velocity[1] -= 10 * delta;
      for (let axis = 0; axis < 3; axis += 1) fragment.offset[axis] += fragment.velocity[axis] * delta;
    }
  }

  draw(renderer) {
    if (!this.broken) {
      renderer.drawBox(this.position, [0.5, 0.5, 0.5], this.color);
      renderer.drawBox([this.position[0], this.position[1], this.position[2] - 0.51], [0.12, 0.38, 0.025], [0.84, 0.58, 0.25]);
      renderer.drawBox([this.position[0], this.position[1], this.position[2] + 0.51], [0.12, 0.38, 0.025], [0.84, 0.58, 0.25]);
      return;
    }
    if (this.breakAge > 1.1) return;
    for (const fragment of this.fragments) {
      const p = fragment.offset;
      renderer.drawBox([this.position[0] + p[0], this.position[1] + p[1], this.position[2] + p[2]], [0.13, 0.13, 0.13], [0.74, 0.43, 0.2]);
    }
  }
}
