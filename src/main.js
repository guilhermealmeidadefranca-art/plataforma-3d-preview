const app = document.querySelector('#app');

if (!app) {
  throw new Error('Elemento principal #app não encontrado.');
}

import { Renderer } from './core/Renderer.js';
import { GameLoop } from './core/GameLoop.js';
import { InputManager } from './core/InputManager.js';
import { CameraController } from './camera/CameraController.js';
import { GameWorld } from './world/GameWorld.js';

const canvas = document.querySelector('#game-canvas');
const errorElement = document.querySelector('#game-error');
const statusElement = document.querySelector('#game-status');
const collectibleCountElement = document.querySelector('#collectible-count');

try {
  const renderer = new Renderer(canvas);
  const world = new GameWorld();
  const camera = new CameraController();
  const input = new InputManager();

  const update = (delta) => {
    world.update(delta, input);
    camera.update(delta, world.player.position);
    statusElement.textContent = world.status;
    collectibleCountElement.textContent = String(world.collectibleCount);
  };

  const render = (time) => {
    renderer.begin(
      [camera.position.x, camera.position.y, camera.position.z],
      camera.lookTarget(world.player.position),
    );
    world.draw(renderer, time);
  };

  new GameLoop(update, render).start();
} catch (error) {
  errorElement.hidden = false;
  errorElement.textContent = `Não foi possível iniciar o jogo: ${error.message}`;
  statusElement.textContent = 'Falha ao iniciar';
  console.error(error);
}
