import { Renderer } from './core/Renderer.js';
import { GameLoop } from './core/GameLoop.js';
import { InputManager } from './core/InputManager.js';
import { CameraController } from './camera/CameraController.js';
import { GameWorld } from './world/GameWorld.js';
import { LEVELS } from './levels/Levels.js';
import { ProgressionManager } from './systems/ProgressionManager.js';

const canvas = document.querySelector('#game-canvas');
const errorElement = document.querySelector('#game-error');
const statusElement = document.querySelector('#game-status');
const collectibleCountElement = document.querySelector('#collectible-count');
const levelNameElement = document.querySelector('#level-name');
const screen = document.querySelector('#campaign-screen');

try {
  const renderer = new Renderer(canvas);
  const camera = new CameraController();
  const input = new InputManager();
  const progress = new ProgressionManager();
  let world = null;
  let screenMode = 'menu';

  function showMenu(message = '') {
    screenMode = 'menu';
    const continueLevel = LEVELS.find((level) => level.id <= progress.save.unlocked && !progress.save.completed.includes(level.id))
      ?? LEVELS[progress.save.unlocked - 1]
      ?? LEVELS[0];
    const campaignAction = progress.save.completed.length ? 'Continuar campanha' : 'Iniciar campanha';
    const buttons = LEVELS.map((level) => {
      const unlocked = progress.isUnlocked(level.id);
      const completed = progress.save.completed.includes(level.id);
      const best = progress.save.bestItems[level.id];
      return `<button class="level-card ${unlocked ? '' : 'locked'}" data-level="${level.id}" ${unlocked ? '' : 'disabled'}><span>FASE ${String(level.id).padStart(2, '0')}</span><strong>${level.name}</strong><small>${completed ? `Concluída · melhor: ${best} itens` : unlocked ? 'Disponível' : 'Bloqueada'}</small></button>`;
    }).join('');
    screen.innerHTML = `<div class="screen-card"><p class="eyebrow">AVENTURA 3D</p><h2>${message || 'Escolha sua próxima aventura'}</h2><p>Uma campanha de oito trilhas, ruínas e lugares secretos.</p><div class="screen-actions menu-actions"><button class="primary-button" data-action="start" data-level="${continueLevel.id}">${campaignAction}</button></div><div class="level-grid">${buttons}</div></div>`;
    screen.hidden = false;
  }

  function startLevel(id) {
    const level = LEVELS.find((entry) => entry.id === id);
    if (!level || !progress.isUnlocked(id)) return;
    world = new GameWorld(id);
    screenMode = 'playing';
    screen.hidden = true;
    levelNameElement.textContent = level.name;
    statusElement.textContent = 'Explore a trilha';
    collectibleCountElement.textContent = '0';
    camera.position = { x: 0, y: 4.5, z: 10 };
  }

  function showCompletion() {
    if (screenMode !== 'playing' || !world?.completed) return;
    progress.complete(world.level.id, world.collectibleCount);
    screenMode = 'complete';
    const nextId = world.level.id + 1;
    const isLast = world.level.id === LEVELS.length;
    const next = LEVELS.find((level) => level.id === nextId);
    screen.innerHTML = `<div class="screen-card result-card"><p class="eyebrow">FASE ${String(world.level.id).padStart(2, '0')} CONCLUÍDA</p><h2>${isLast ? 'A campanha terminou!' : 'Muito bem!'} </h2><p>${world.level.name} · ${world.collectibleCount} itens coletados</p><div class="screen-actions">${next ? `<button class="primary-button" data-action="next" data-level="${nextId}">Próxima fase: ${next.name}</button>` : ''}<button class="secondary-button" data-action="menu">Seleção de fases</button></div></div>`;
    screen.hidden = false;
  }

  screen.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const { action, level } = button.dataset;
    if (action === 'menu') {
      showMenu();
      return;
    }
    if (action === 'start' || action === 'next' || level) startLevel(Number(level));
  });

  screen.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.matches('button')) event.target.click();
  });

  const update = (delta) => {
    if (!world || screenMode !== 'playing') return;
    world.update(delta, input);
    camera.update(delta, world.player.position);
    statusElement.textContent = world.status;
    collectibleCountElement.textContent = String(world.collectibleCount);
    showCompletion();
  };

  const render = (time) => {
    const playerPosition = world?.player.position ?? { x: 0, y: 0, z: 3 };
    renderer.begin([camera.position.x, camera.position.y, camera.position.z], camera.lookTarget(playerPosition), world?.level.theme.sky);
    if (world) world.draw(renderer, time);
  };

  new GameLoop(update, render).start();
  showMenu();
} catch (error) {
  errorElement.hidden = false;
  errorElement.textContent = `Não foi possível iniciar o jogo: ${error.message}`;
  statusElement.textContent = 'Falha ao iniciar';
  console.error(error);
}
