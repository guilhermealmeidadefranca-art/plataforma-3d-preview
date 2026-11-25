export const LEVEL_01 = {
  name: 'Trilha de Treino',
  floor: { from: -28, to: 28, halfWidth: 7 },
  platforms: [
    { position: [0, -0.4, 0], size: [7, 0.4, 28], color: [0.24, 0.48, 0.32] },
    { position: [0, -0.45, -15], size: [5.5, 0.5, 8], color: [0.32, 0.53, 0.34] },
    { position: [-2.1, 0.4, -7], size: [1.4, 0.45, 1.4], color: [0.55, 0.42, 0.26] },
    { position: [2.1, 0.95, -11], size: [1.4, 0.45, 1.4], color: [0.55, 0.42, 0.26] },
  ],
  crates: [
    { position: [0, 0.55, -4], drops: 2 },
    { position: [-2.1, 1.42, -7], drops: 2 },
    { position: [2.1, 1.95, -11], drops: 3 },
  ],
  collectibles: [
    { position: [0, 0.8, -1.8] },
    { position: [-1.2, 1.15, -6.4] },
    { position: [0, 0.8, -9.3] },
    { position: [2.1, 1.95, -11] },
    { position: [0, 0.8, -15] },
  ],
  enemies: [
    { position: [0, 0, -19], patrolRange: 2.2, speed: 1.1 },
  ],
  hazards: [
    { position: [0, 0, -13.4], range: 2.4, speed: 1.5 },
  ],
};
