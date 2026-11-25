const themes = [
  { name: 'Trilha de Treino', ground: [0.24, 0.48, 0.32], platform: [0.32, 0.53, 0.34], side: [0.16, 0.35, 0.22], crate: [0.62, 0.34, 0.14], hazard: [0.8, 0.16, 0.12], sky: [0.42, 0.72, 0.86] },
  { name: 'Ruínas do Sol Antigo', ground: [0.59, 0.42, 0.25], platform: [0.72, 0.56, 0.32], side: [0.38, 0.29, 0.2], crate: [0.48, 0.27, 0.12], hazard: [0.85, 0.27, 0.1], sky: [0.85, 0.67, 0.42] },
  { name: 'Passagem das Nuvens', ground: [0.42, 0.53, 0.62], platform: [0.57, 0.66, 0.73], side: [0.32, 0.42, 0.53], crate: [0.45, 0.32, 0.2], hazard: [0.9, 0.4, 0.2], sky: [0.56, 0.76, 0.92] },
  { name: 'Grutas Luminosas', ground: [0.26, 0.34, 0.43], platform: [0.35, 0.43, 0.55], side: [0.16, 0.23, 0.31], crate: [0.47, 0.29, 0.17], hazard: [0.2, 0.8, 0.75], sky: [0.2, 0.3, 0.4] },
  { name: 'Caldeira Rubra', ground: [0.43, 0.25, 0.2], platform: [0.58, 0.33, 0.22], side: [0.3, 0.16, 0.15], crate: [0.45, 0.25, 0.13], hazard: [1, 0.35, 0.08], sky: [0.62, 0.3, 0.23] },
  { name: 'Costa das Marés', ground: [0.28, 0.48, 0.48], platform: [0.36, 0.62, 0.58], side: [0.18, 0.38, 0.42], crate: [0.58, 0.36, 0.19], hazard: [0.9, 0.42, 0.18], sky: [0.44, 0.72, 0.84] },
  { name: 'Núcleo das Engrenagens', ground: [0.31, 0.39, 0.44], platform: [0.42, 0.52, 0.56], side: [0.2, 0.28, 0.33], crate: [0.49, 0.36, 0.23], hazard: [0.94, 0.55, 0.14], sky: [0.34, 0.49, 0.58] },
  { name: 'Fortaleza do Eclipse', ground: [0.34, 0.28, 0.39], platform: [0.48, 0.38, 0.53], side: [0.22, 0.17, 0.3], crate: [0.45, 0.28, 0.18], hazard: [0.94, 0.22, 0.3], sky: [0.31, 0.29, 0.47] },
];

function buildLevel(index, theme) {
  const courseStyles = [
    { width: 7, spacing: 5.2, depth: 5.4, offset: 'straight', raised: false },
    { width: 5.8, spacing: 5.2, depth: 4.6, offset: 'straight', raised: false },
    { width: 4.2, spacing: 5.2, depth: 4.5, offset: 'zigzag', raised: false },
    { width: 4.7, spacing: 5.35, depth: 4.3, offset: 'wide-zigzag', raised: false },
    { width: 5.0, spacing: 5.2, depth: 4.45, offset: 'straight', raised: true },
    { width: 5.2, spacing: 5.2, depth: 4.5, offset: 'coast', raised: false },
    { width: 4.8, spacing: 5.3, depth: 4.35, offset: 'zigzag', raised: true },
    { width: 4.0, spacing: 5.4, depth: 4.0, offset: 'wide-zigzag', raised: true },
  ];
  const course = courseStyles[index];
  const routeX = (section) => {
    if (course.offset === 'zigzag') return section % 2 ? 1.05 : -1.05;
    if (course.offset === 'wide-zigzag') return section % 2 ? 1.5 : -1.5;
    if (course.offset === 'coast') return section < 4 ? -1.15 : 1.15;
    return 0;
  };
  const platforms = [];
  for (let segment = 0; segment < 9; segment += 1) {
    const z = 1 - segment * course.spacing;
    const x = routeX(Math.min(3, Math.floor(segment / 2)));
    const top = course.raised && segment > 1 && segment < 8 && segment % 2 === 0 ? 0.45 : 0;
    platforms.push({ position: [x, top - 0.4, z], size: [course.width, 0.4, course.depth], color: theme.ground });
  }
  const crates = [];
  const collectibles = [];
  const enemies = [];
  const hazards = [];
  for (let section = 0; section < 4; section += 1) {
    const z = -3 - section * 8;
    const lane = routeX(section);
    const routeHeight = course.raised && section > 0 && section < 4 && section % 2 === 0 ? 0.45 : 0;
    platforms.push({ position: [lane + (section % 2 ? 0.7 : -0.7), routeHeight + 0.18, z - 2], size: [1.35, 0.38, 1.55], color: theme.platform });
    crates.push({ position: [lane, routeHeight + 0.55, z], drops: 1 + (section % 2), color: theme.crate });
    collectibles.push({ position: [lane + (section % 2 ? 0.7 : -0.7), routeHeight + 0.9, z - 2] });
    collectibles.push({ position: [lane, routeHeight + 0.8, z - 3.8] });
    if (section % 2 === 0 || index > 2) enemies.push({ position: [lane, routeHeight, z - 4.7], patrolRange: 1.3 + (index % 3) * 0.3, speed: 0.8 + index * 0.08 });
    hazards.push({ position: [lane, routeHeight, z - 5.8], range: 1.3 + (index % 2) * 0.7, speed: 1 + index * 0.09 });
  }
  for (let side = -1; side <= 1; side += 2) {
    platforms.push({ position: [side * 7, 1.6, -14], size: [2.2, 1.6, 2.2], color: theme.side });
    platforms.push({ position: [side * 7, 2.8, -27], size: [2.2, 2.8, 2.2], color: theme.side });
    platforms.push({ position: [side * 7, 1.2, -35], size: [2.2, 1.2, 2.2], color: theme.side });
  }
  return {
    id: index + 1,
    name: theme.name,
    theme,
    platforms,
    crates,
    collectibles,
    enemies,
    hazards,
    finishX: routeX(3),
    finishZ: -40,
    totalCollectibles: collectibles.length + crates.reduce((sum, crate) => sum + crate.drops, 0) + enemies.length,
  };
}

export const LEVELS = themes.map((theme, index) => buildLevel(index, theme));
export const getLevel = (id) => LEVELS.find((level) => level.id === id) ?? LEVELS[0];
