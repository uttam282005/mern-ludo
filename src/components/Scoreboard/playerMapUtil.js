// Utility to map playerId to color and name from players array
export function getPlayerMap(players) {
  const map = {};
  if (Array.isArray(players)) {
    players.forEach(player => {
      if (player && player._id && player.color) {
        map[player._id] = { color: player.color, name: player.name };
      }
    });
  }
  return map;
}
