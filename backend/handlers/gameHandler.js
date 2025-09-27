const { getRoom, updateRoom } = require('../services/roomService');
const { sendToPlayersRolledNumber, sendWinner, sendToPlayersData, sendScoresToPlayers } = require('../socket/emits');
const { rollDice, isMoveValid } = require('./handlersFunctions');

module.exports = socket => {
    const req = socket.request;

    const handleMovePawn = async pawnId => {
        const room = await getRoom(req.session.roomId);
        if (room.winner) return;
        const pawn = room.getPawn(pawnId);
        if (isMoveValid(req.session, pawn, room)) {
            pawn.addPawnProgressScore(stepsMoved);

            room.movePawn(pawn);

            room.handlePlayerScores();

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
