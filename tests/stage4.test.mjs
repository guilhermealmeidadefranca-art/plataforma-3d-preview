import test from 'node:test';
import assert from 'node:assert/strict';
import { CameraController } from '../src/camera/CameraController.js';
import { Player } from '../src/player/Player.js';
import { GameWorld } from '../src/world/GameWorld.js';
import { LEVELS } from '../src/levels/Levels.js';
import { ProgressionManager } from '../src/systems/ProgressionManager.js';
import { overlapsHazard } from '../src/world/CollisionSystem.js';

const input = ({ keys = [], pressed = [] } = {}) => ({
  down: (...codes) => codes.some((code) => keys.includes(code)),
  pressed: (code) => pressed.includes(code),
});
const floor = [{ position: [0, -0.4, 0], size: [7, 0.4, 28] }];

test('campanha contém oito fases nomeadas e cada uma tem uma chegada alcançável', () => {
  assert.equal(LEVELS.length, 8);
  assert.equal(new Set(LEVELS.map((level) => level.name)).size, 8);
  for (const level of LEVELS) {
    const world = new GameWorld(level.id);
    assert.ok(world.crates.length && world.collectibles.length && world.enemies.length && world.hazards.length);
    const floorCoversFinish = world.platforms.some((platform) =>
      Math.abs(platform.position[0] - level.finishX) <= platform.size[0]
      && Math.abs(platform.position[2] - level.finishZ) <= platform.size[2]);
    assert.ok(floorCoversFinish, `chegada sem chão: ${level.name}`);
    world.player.position.x = level.finishX;
    world.player.position.z = level.finishZ;
    world.update(0, input());
    assert.equal(world.completed, true, `gatilho da chegada: ${level.name}`);
  }
});

test('andar, correr, saltar e pousar funcionam', () => {
  const walker = new Player();
  const runner = new Player();
  for (let i = 0; i < 60; i += 1) {
    walker.update(1 / 60, input({ keys: ['KeyW'] }), floor);
    runner.update(1 / 60, input({ keys: ['KeyW', 'ShiftLeft'] }), floor);
  }
  assert.ok(walker.position.z < 0);
  assert.ok(runner.position.z < walker.position.z);

  const jumper = new Player();
  let peak = 0;
  for (let i = 0; i < 90; i += 1) {
    jumper.update(1 / 60, input({ keys: i < 12 ? ['Space'] : [], pressed: i === 0 ? ['Space'] : [] }), floor);
    peak = Math.max(peak, jumper.position.y);
  }
  assert.ok(peak > 1.1);
  assert.equal(jumper.grounded, true);
  assert.ok(Math.abs(jumper.position.y) < 0.001);
});

test('caixa bloqueia passagem até o giro quebrá-la', () => {
  const world = new GameWorld(1);
  world.player.position.z = -1.5;
  for (let i = 0; i < 90; i += 1) world.player.update(1 / 60, input({ keys: ['KeyW'] }), world.platforms, world.crates);
  assert.ok(world.player.position.z > -2.4);
  world.update(1 / 60, { down: () => false, pressed: (code) => code === 'KeyX' });
  assert.equal(world.crates[0].broken, true);
  assert.ok(world.player.attackTimer > 0);
});

test('itens atualizam o contador e perigos causam dano', () => {
  const pickupWorld = new GameWorld(1);
  const item = pickupWorld.collectibles[0];
  pickupWorld.player.position = { x: item.position[0], y: item.position[1] - 0.8, z: item.position[2] };
  pickupWorld.update(1 / 60, input());
  assert.equal(pickupWorld.collectibleCount, 1);

  const hazardWorld = new GameWorld(1);
  const hazard = hazardWorld.hazards[0];
  hazardWorld.player.position = { x: hazard.position[0], y: 0, z: hazard.position[2] };
  assert.equal(overlapsHazard(hazardWorld.player, hazard), true);
  hazardWorld.update(1 / 60, input());
  assert.ok(hazardWorld.player.invulnerability > 0);

  const enemyWorld = new GameWorld(1);
  enemyWorld.player.position = { x: 0, y: 0, z: -7.7 };
  enemyWorld.update(1 / 60, { down: () => false, pressed: (code) => code === 'KeyX' });
  assert.equal(enemyWorld.enemies[0].defeated, true);
});

test('progresso salva desbloqueios e melhores totais entre instâncias', () => {
  const values = new Map();
  const originalStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  try {
    for (let id = 1; id <= 8; id += 1) {
      const progress = new ProgressionManager();
      assert.equal(progress.isUnlocked(id), true);
      progress.complete(id, id * 2);
    }
    const restored = new ProgressionManager();
    assert.equal(restored.save.unlocked, 8);
    assert.equal(restored.save.completed.length, 8);
    assert.equal(restored.save.bestItems[8], 16);
  } finally {
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
  }
});

test('câmera acompanha um alvo sem valores inválidos', () => {
  const camera = new CameraController();
  camera.update(1 / 60, { x: 2, y: 1, z: -4 });
  assert.ok(Number.isFinite(camera.position.x));
  assert.deepEqual(camera.lookTarget({ x: 2, y: 1, z: -4 }), [2, 1.85, -5.2]);
});
