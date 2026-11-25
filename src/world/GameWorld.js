import { Enemy } from '../objects/Enemy.js';
import { Crate } from '../objects/Crate.js';
import { Collectible } from '../objects/Collectible.js';
import { MovingHazard } from '../objects/MovingHazard.js';
import { canStomp, horizontalDistance, overlapsHazard } from './CollisionSystem.js';
import { LEVEL_01 } from '../levels/Level01.js';
import { Player } from '../player/Player.js';

export class GameWorld {
  constructor() {
    this.player = new Player();
    this.platforms = LEVEL_01.platforms;
    this.crates = LEVEL_01.crates.map((definition) => new Crate(definition));
    this.collectibles = LEVEL_01.collectibles.map((definition) => new Collectible(definition.position));
    this.enemies = LEVEL_01.enemies.map((definition) => new Enemy(definition));
    this.hazards = LEVEL_01.hazards.map((definition) => new MovingHazard(definition));
    this.collectibleCount = 0;
    this.time = 0;
    this.message = '';
    this.messageTime = 0;
  }

  notify(message, duration = 1.2) {
    this.message = message;
    this.messageTime = duration;
  }

  attackNearby() {
    let target = null;
    let targetDistance = 1.8;
    for (const crate of this.crates) {
      if (crate.broken) continue;
      const distance = horizontalDistance(this.player.position, crate.position);
      if (distance < targetDistance && Math.abs(this.player.position.y - crate.position[1]) < 2.1) {
        target = crate;
        targetDistance = distance;
      }
    }
    for (const enemy of this.enemies) {
      if (enemy.defeated) continue;
      const distance = horizontalDistance(this.player.position, enemy.position);
      if (distance < targetDistance && Math.abs(this.player.position.y - enemy.position[1]) < 1.8) {
        target = enemy;
        targetDistance = distance;
      }
    }
    if (!target) {
      this.notify('Giro no ar');
      return;
    }
    if (target instanceof Crate) {
      for (const position of target.break()) this.collectibles.push(new Collectible(position, 'crystal', 0.18));
      this.notify('Caixa quebrada!');
    } else if (target.defeat()) {
      this.collectibles.push(new Collectible([target.position[0], 1.15, target.position[2]], 'bonus', 0.18));
      this.notify('Inimigo derrotado!');
    }
  }

  update(delta, input) {
    this.time += delta;
    this.messageTime = Math.max(0, this.messageTime - delta);
    const previousY = this.player.position.y;
    const previousVelocityY = this.player.velocity.y;
    const solidCrates = this.crates.filter((crate) => !crate.broken);
    this.player.update(delta, input, this.platforms, solidCrates);

    if (input.pressed('KeyX')) {
      this.player.triggerAttack();
      this.attackNearby();
    }

    for (const crate of this.crates) crate.update(delta);
    for (const enemy of this.enemies) enemy.update(delta);
    for (const hazard of this.hazards) hazard.update(delta);

    for (const collectible of this.collectibles) {
      if (collectible.update(this.player, delta)) {
        this.collectibleCount += 1;
        this.notify('Cristal coletado!');
      }
    }
    this.collectibles = this.collectibles.filter((collectible) => !collectible.collected);

    for (const enemy of this.enemies) {
      if (enemy.defeated || horizontalDistance(this.player.position, enemy.position) > 0.82) continue;
      const enemyTop = enemy.position[1] + 1.25;
      if (canStomp(this.player, previousY, previousVelocityY, enemyTop)) {
        enemy.defeat();
        this.player.velocity.y = 6.3;
        this.player.grounded = false;
        this.collectibles.push(new Collectible([enemy.position[0], 1.25, enemy.position[2]], 'bonus', 0.18));
        this.notify('Pulo certeiro! Inimigo derrotado!');
      } else if (this.player.position.y < enemyTop + 0.25 && this.player.takeHit(enemy.position[0])) {
        this.notify('O inimigo te atingiu!');
      }
    }

    for (const hazard of this.hazards) {
      if (overlapsHazard(this.player, hazard) && this.player.takeHit(hazard.position[0])) {
        this.notify('Desvie do perigo móvel!');
      }
    }
  }

  get status() {
    if (this.messageTime > 0) return this.message;
    return this.player.grounded ? 'Explore a trilha' : 'No ar';
  }

  draw(renderer, time) {
    for (const platform of this.platforms) renderer.drawBox(platform.position, platform.size, platform.color);
    renderer.drawBox([-7, 1.2, -20], [1.5, 1.2, 1.5], [0.18, 0.42, 0.27]);
    renderer.drawBox([7, 0.7, -17], [2, 0.7, 2], [0.2, 0.45, 0.29]);
    renderer.drawBox([-7, 2.5, -20], [2.4, 1.5, 2.4], [0.28, 0.56, 0.31]);
    renderer.drawBox([7, 1.7, -17], [3, 1.2, 3], [0.32, 0.6, 0.35]);
    for (const hazard of this.hazards) hazard.draw(renderer);
    for (const crate of this.crates) crate.draw(renderer);
    for (const enemy of this.enemies) enemy.draw(renderer);
    for (const collectible of this.collectibles) collectible.draw(renderer, time);
    this.player.draw(renderer, time);
  }
}
