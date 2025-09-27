/**
 * Calculate total score for a player
 * @param {Array} pawns - Array of pawn objects
 * @returns {number}
 */
function calculatePlayerScore(pawns) {
    return pawns.reduce((sum, pawn) => sum + (pawn.score || 0), 0);
}

module.exports = {
    calculatePlayerScore,
};
