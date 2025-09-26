// backend/utils/scoring.js
// Modular scoring utilities for Ludo game

/**
 * Add steps moved to pawn's score
 * @param {Object} pawn - Pawn object (Mongoose doc)
 * @param {number} stepsMoved - Dice value for this move
 */
function addPawnProgressScore(pawn, stepsMoved) {
    pawn.score = (pawn.score || 0) + stepsMoved;
}

/**
 * Handle capture: striker gets victim's score, victim resets
 * @param {Object} strikerPawn - Pawn capturing
 * @param {Object} victimPawn - Pawn being captured
 */
function handleCapture(strikerPawn, victimPawn) {
    strikerPawn.score = (strikerPawn.score || 0) + (victimPawn.score || 0);
    victimPawn.score = 0;
    victimPawn.position = victimPawn.basePos; // send to base
}

/**
 * Calculate total score for a player
 * @param {Array} pawns - Array of pawn objects
 * @returns {number}
 */
function calculatePlayerScore(pawns) {
    return pawns.reduce((sum, pawn) => sum + (pawn.score || 0), 0);
}

module.exports = {
    addPawnProgressScore,
    handleCapture,
    calculatePlayerScore,
};
