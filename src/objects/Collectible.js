export class Collectible {
  constructor(position, type = 'crystal', pickupDelay = 0) {
    this.position = [...position];
    this.type = type;
    this.collected = false;
    this.pickupDelay = pickupDelay;
  }

  update(player, delta = 0) {
    if (this.collected) return false;
    if (this.pickupDelay > 0) {
      this.pickupDelay = Math.max(0, this.pickupDelay - delta);
      return false;
    }
    const dx = player.position.x - this.position[0];
    const dy = player.position.y + 0.8 - this.position[1];
    const dz = player.position.z - this.position[2];
    if (Math.hypot(dx, dy, dz) < 0.9) {
      this.collected = true;
      return true;
    }
    return false;
  }

  draw(renderer, time) {
    if (this.collected) return;
    const bob = Math.sin(time * 3 + this.position[2]) * 0.1;
    const color = this.type === 'crystal' ? [0.2, 0.9, 0.88] : [1, 0.8, 0.24];
    renderer.drawBox([this.position[0], this.position[1] + bob, this.position[2]], [0.17, 0.24, 0.17], color, time * 1.7);
  }
}
