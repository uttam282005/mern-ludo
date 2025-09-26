const { getRoom, updateRoom } = require('../services/roomService');
const { sendToPlayersRolledNumber, sendWinner, sendToPlayersData, sendScoresToPlayers } = require('../socket/emits');
const { rollDice, isMoveValid } = require('./handlersFunctions');
const { addPawnProgressScore, handleCapture, calculatePlayerScore } = require('../utils/scoring');

module.exports = socket => {
    const req = socket.request;

    const handleMovePawn = async pawnId => {
        const room = await getRoom(req.session.roomId);
        if (room.winner) return;
        const pawn = room.getPawn(pawnId);
        if (isMoveValid(req.session, pawn, room)) {
            const stepsMoved = room.rolledNumber;
            const oldPosition = pawn.position;
            const newPositionOfMovedPawn = pawn.getPositionAfterMove(stepsMoved);
            // Add progress score
            addPawnProgressScore(pawn, stepsMoved);
            room.changePositionOfPawn(pawn, newPositionOfMovedPawn);

            // Handle captures and scoring
            const pawnsOnPosition = room.pawns.filter(p => p.position === newPositionOfMovedPawn && p.color !== pawn.color);
            let captures = 0;
            pawnsOnPosition.forEach(victimPawn => {
                handleCapture(pawn, victimPawn);
                captures++;
            });

            // Update playerScores in room state
            room.playerScores = {};
            room.players.forEach(player => {
                const playerPawns = room.getPlayerPawns(player.color);
                room.playerScores[player._id] = calculatePlayerScore(playerPawns);
            });

            room.changeMovingPlayer();
            const winner = room.getWinner();
            if (winner) {
                room.endGame(winner);
                sendWinner(room._id.toString(), winner);
            }
            await updateRoom(room);
            // Emit updated scores and state
            sendToPlayersData(room);
            sendScoresToPlayers(room._id.toString(), room.playerScores);
        }
    };

    const handleRollDice = async () => {
        const rolledNumber = rollDice();
        sendToPlayersRolledNumber(req.session.roomId, rolledNumber);
        const room = await updateRoom({ _id: req.session.roomId, rolledNumber: rolledNumber });
        const player = room.getPlayer(req.session.playerId);
        if (!player.canMove(room, rolledNumber)) {
            room.changeMovingPlayer();
            await updateRoom(room);
        }
    };

    socket.on('game:roll', handleRollDice);
    socket.on('game:move', handleMovePawn);
};
