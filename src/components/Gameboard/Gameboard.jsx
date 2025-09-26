import React, { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import { PlayerDataContext, SocketContext } from '../../App';
import useSocketData from '../../hooks/useSocketData';
import Map from './Map/Map';
import Navbar from '../Navbar/Navbar';
import Overlay from '../Overlay/Overlay';
import Scoreboard from '../Scoreboard/Scoreboard';
import { getPlayerMap } from '../Scoreboard/playerMapUtil';
import styles from './Gameboard.module.css';
import trophyImage from '../../images/trophy.webp';

const Gameboard = () => {
    const socket = useContext(SocketContext);
    const context = useContext(PlayerDataContext);
    const [pawns, setPawns] = useState([]);
    const [players, setPlayers] = useState([]);

    const [rolledNumber, setRolledNumber] = useSocketData('game:roll');
    const [time, setTime] = useState();
    const [isReady, setIsReady] = useState();
    const [nowMoving, setNowMoving] = useState(false);
    const [started, setStarted] = useState(false);

    const [movingPlayer, setMovingPlayer] = useState('red');

    const [winner, setWinner] = useState(null);
    const [scores, setScores] = useState({});

    useEffect(() => {
        socket.emit('room:data', context.roomId);
        socket.on('room:data', data => {
            data = JSON.parse(data);
            if (data.players == null) return;
            // Filling navbar with empty player nick container
            while (data.players.length !== 4) {
                data.players.push({ name: '...' });
            }
            // Checks if client is currently moving player by session ID
            const nowMovingPlayer = data.players.find(player => player.nowMoving === true);
            if (nowMovingPlayer) {
                if (nowMovingPlayer._id === context.playerId) {
                    setNowMoving(true);
                } else {
                    setNowMoving(false);
                }
                setMovingPlayer(nowMovingPlayer.color);
            }
            const currentPlayer = data.players.find(player => player._id === context.playerId);
            setIsReady(currentPlayer.ready);
            setRolledNumber(data.rolledNumber);
            setPlayers(data.players);
            setPawns(data.pawns);
            setTime(data.nextMoveTime);
            setStarted(data.started);
        });

        socket.on('game:scores', setScores);
        socket.on('game:winner', winner => {
            setWinner(winner);
        });
        socket.on('redirect', () => {
            window.location.reload();
        });

        return () => {
            socket.off('game:scores', setScores);
        };
    }, [socket, context.playerId, context.roomId, setRolledNumber]);

    // Map playerId to color for Scoreboard
    const playerMap = getPlayerMap(players);
    // Find winner's score for Game Over
    let winnerScore = null;
    if (winner && playerMap) {
        const winnerPlayer = Object.entries(playerMap).find(([, v]) => v.color === winner);
        if (winnerPlayer && scores[winnerPlayer[0]]) {
            winnerScore = scores[winnerPlayer[0]];
        }
    }

    return (
        <>
            {pawns.length === 16 ? (
                <div className='container'>
                    <Scoreboard socket={socket} playerMap={playerMap} />
                    <div style={{ gridColumn: 2, gridRow: '1 / span 2', width: '100%' }}>
                        <Navbar
                            players={players}
                            started={started}
                            time={time}
                            isReady={isReady}
                            movingPlayer={movingPlayer}
                            rolledNumber={rolledNumber}
                            nowMoving={nowMoving}
                            ended={winner !== null}
                        />
                        <Map pawns={pawns} nowMoving={nowMoving} rolledNumber={rolledNumber} />
                    </div>
                </div>
            ) : (
                <ReactLoading type='spinningBubbles' color='white' height={667} width={375} />
            )}
            {winner ? (
                <Overlay>
                    <div className={styles.winnerContainer}>
                        <img src={trophyImage} alt='winner' />
                        <h1>
                            1st: <span style={{ color: winner }}>{winner}</span>
                        </h1>
                        {winnerScore !== null && (
                            <h2 style={{ color: winner }}>Score: {winnerScore}</h2>
                        )}
                        <button onClick={() => socket.emit('player:exit')}>Play again</button>
                    </div>
                </Overlay>
            ) : null}
        </>
    );
};

export default Gameboard;
