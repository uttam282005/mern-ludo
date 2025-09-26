import React, { useEffect, useState } from 'react';
import styles from './Scoreboard.module.css';

// Utility to map color to display name
const COLOR_LABELS = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
};

const Scoreboard = ({ socket, playerMap }) => {
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (!socket) return;
    const handleScores = (playerScores) => {
      setScores(playerScores);
    };
    socket.on('game:scores', handleScores);
    return () => socket.off('game:scores', handleScores);
  }, [socket]);

  // playerMap: { playerId: { color, name } }
  const colorScores = {};
  if (playerMap) {
    Object.entries(playerMap).forEach(([playerId, { color }]) => {
      colorScores[color] = scores[playerId] || 0;
    });
  }

  return (
    <div className={styles.scoreboardPanel}>
      <h3>Scoreboard</h3>
      <div className={styles.scoresList}>
        {Object.keys(COLOR_LABELS).map((color) => (
          <div key={color} className={styles.scoreRow}>
            <span className={styles[color]}>{COLOR_LABELS[color]}:</span>
            <span className={styles.points}>{colorScores[color] || 0} points</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;
