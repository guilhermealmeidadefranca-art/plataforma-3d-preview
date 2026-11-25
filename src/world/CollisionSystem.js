export function horizontalDistance(a, b) {
  return Math.hypot(a.x - b[0], a.z - b[2]);
}

export function overlapsHazard(player, hazard) {
  const dx = Math.abs(player.position.x - hazard.position[0]);
  const dz = Math.abs(player.position.z - hazard.position[2]);
  const hazardBottom = hazard.position[1];
  const hazardTop = hazardBottom + 0.7;
  const verticalOverlap = player.position.y < hazardTop && player.position.y + 1.9 > hazardBottom;
  return dx < hazard.halfWidth + 0.35 && dz < hazard.halfDepth + 0.32 && verticalOverlap;
}

export function canStomp(player, previousY, previousVelocityY, enemyTop) {
  return previousVelocityY < 0 && previousY >= enemyTop && player.position.y <= enemyTop;
}
