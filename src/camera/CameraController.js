export class CameraController {
  constructor() {
    this.position = { x: 0, y: 4.5, z: 10 };
  }

  update(delta, target) {
    const desired = { x: target.x, y: target.y + 4.1, z: target.z + 8.5 };
    const blend = 1 - Math.exp(-5 * delta);
    this.position.x += (desired.x - this.position.x) * blend;
    this.position.y += (desired.y - this.position.y) * blend;
    this.position.z += (desired.z - this.position.z) * blend;
  }

  lookTarget(target) {
    return [target.x, target.y + 0.85, target.z - 1.2];
  }
}
