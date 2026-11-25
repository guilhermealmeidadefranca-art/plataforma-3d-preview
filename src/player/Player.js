export class Player {
  constructor() {
    this.position = { x: 0, y: 0, z: 3 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.facing = 0;
    this.grounded = true;
    this.jumpHeld = false;
    this.jumpHoldTime = 0;
    this.animationTime = 0;
    this.invulnerability = 0;
    this.attackTimer = 0;
  }

  update(delta, input, platforms = [], solids = []) {
    this.invulnerability = Math.max(0, this.invulnerability - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    const forward = Number(input.down('KeyW', 'ArrowUp')) - Number(input.down('KeyS', 'ArrowDown'));
    const sideways = Number(input.down('KeyD', 'ArrowRight')) - Number(input.down('KeyA', 'ArrowLeft'));
    const inputLength = Math.hypot(forward, sideways);
    const speed = input.down('ShiftLeft', 'ShiftRight') ? 8.2 : 5.6;
    const targetX = inputLength ? (sideways / inputLength) * speed : 0;
    const targetZ = inputLength ? (-forward / inputLength) * speed : 0;
    const blend = Math.min(1, (inputLength ? 13 : 10) * delta);
    this.velocity.x += (targetX - this.velocity.x) * blend;
    this.velocity.z += (targetZ - this.velocity.z) * blend;
    const previousX = this.position.x;
    const previousZ = this.position.z;
    this.position.x += this.velocity.x * delta;
    for (const solid of solids) {
      const [solidX, solidY, solidZ] = solid.position;
      const overlapsVertically = this.position.y < solidY + solid.halfSize && this.position.y + 1.9 > solidY - solid.halfSize;
      const overlapsDepth = Math.abs(previousZ - solidZ) < solid.halfSize + 0.32;
      const overlapsWidth = Math.abs(this.position.x - solidX) < solid.halfSize + 0.32;
      if (overlapsVertically && overlapsDepth && overlapsWidth) {
        this.position.x = previousX;
        this.velocity.x = 0;
      }
    }
    this.position.z += this.velocity.z * delta;
    for (const solid of solids) {
      const [solidX, solidY, solidZ] = solid.position;
      const overlapsVertically = this.position.y < solidY + solid.halfSize && this.position.y + 1.9 > solidY - solid.halfSize;
      const overlapsWidth = Math.abs(this.position.x - solidX) < solid.halfSize + 0.32;
      const overlapsDepth = Math.abs(this.position.z - solidZ) < solid.halfSize + 0.32;
      if (overlapsVertically && overlapsWidth && overlapsDepth) {
        this.position.z = previousZ;
        this.velocity.z = 0;
      }
    }

    if (Math.hypot(this.velocity.x, this.velocity.z) > 0.25) {
      this.facing = Math.atan2(this.velocity.x, -this.velocity.z);
    }

    const jumpDown = input.down('Space');
    const jumpPressed = input.pressed('Space');
    if (jumpPressed && this.grounded) {
      this.velocity.y = 8.6;
      this.grounded = false;
      this.jumpHeld = true;
      this.jumpHoldTime = 0;
    }
    if (!jumpDown && this.jumpHeld && this.velocity.y > 0) this.velocity.y *= 0.5;
    this.jumpHeld = jumpDown && this.velocity.y > 0;
    const gravity = this.jumpHeld && this.jumpHoldTime < 0.2 ? 14 : 24;
    if (this.jumpHeld) this.jumpHoldTime += delta;
    const previousY = this.position.y;
    this.velocity.y -= gravity * delta;
    this.position.y += this.velocity.y * delta;
    this.grounded = false;
    if (this.velocity.y <= 0) {
      let landingHeight = -Infinity;
      for (const platform of platforms) {
        const [px, py, pz] = platform.position;
        const [sx, , sz] = platform.size;
        const top = py + platform.size[1];
        const overlaps = Math.abs(this.position.x - px) <= sx + 0.24 && Math.abs(this.position.z - pz) <= sz + 0.24;
        if (overlaps && previousY >= top - 0.01 && this.position.y <= top && top > landingHeight) landingHeight = top;
      }
      if (landingHeight > -Infinity) {
        this.position.y = landingHeight;
        this.velocity.y = 0;
        this.grounded = true;
      }
    }
    this.animationTime += delta * Math.hypot(this.velocity.x, this.velocity.z);
  }

  takeHit(sourceX) {
    if (this.invulnerability > 0) return false;
    this.invulnerability = 0.9;
    this.velocity.x = Math.sign(this.position.x - sourceX || 1) * 5;
    this.velocity.y = 5.2;
    this.grounded = false;
    return true;
  }

  triggerAttack() {
    this.attackTimer = 0.28;
  }

  draw(renderer, time) {
    const { x, y, z } = this.position;
    const moving = Math.hypot(this.velocity.x, this.velocity.z) > 0.5 && this.grounded;
    const stride = moving ? Math.sin(this.animationTime * 1.8) * 0.24 : 0;
    const bob = moving ? Math.abs(Math.sin(this.animationTime * 1.8)) * 0.07 : Math.sin(time * 2) * 0.025;
    const yaw = this.facing;
    const drawPart = (localX, localY, localZ, size, color) => {
      const cosine = Math.cos(this.facing);
      const sine = Math.sin(this.facing);
      const worldX = x + cosine * localX - sine * localZ;
      const worldZ = z + sine * localX + cosine * localZ;
      renderer.drawBox([worldX, y + localY, worldZ], size, color, yaw);
    };
    const flicker = this.invulnerability > 0 && Math.floor(time * 14) % 2 === 0;
    if (!flicker) {
      drawPart(0, 0.85 + bob, 0, [0.42, 0.55, 0.32], [0.95, 0.39, 0.16]);
      drawPart(0, 1.56 + bob, -0.02, [0.34, 0.34, 0.31], [1.0, 0.68, 0.34]);
    }
    drawPart(-0.13, 1.64 + bob, -0.29, [0.055, 0.07, 0.035], [0.08, 0.12, 0.16]);
    drawPart(0.13, 1.64 + bob, -0.29, [0.055, 0.07, 0.035], [0.08, 0.12, 0.16]);
    const armSpread = this.attackTimer > 0 ? 0.68 : 0.48;
    drawPart(-armSpread, 0.88 + bob - stride, 0, [0.15, 0.43, 0.16], [0.88, 0.3, 0.12]);
    drawPart(armSpread, 0.88 + bob + stride, 0, [0.15, 0.43, 0.16], [0.88, 0.3, 0.12]);
    drawPart(-0.2, 0.28 + bob + stride, 0, [0.18, 0.31, 0.2], [0.12, 0.36, 0.54]);
    drawPart(0.2, 0.28 + bob - stride, 0, [0.18, 0.31, 0.2], [0.12, 0.36, 0.54]);
  }
}
