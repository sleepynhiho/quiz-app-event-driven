"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePlayerJoinedEvent = handlePlayerJoinedEvent;
const database_1 = require("../../db/database");
async function handlePlayerJoinedEvent(event) {
    try {
        console.log('Processing player.joined event:', event);
        // Validate the event data
        if (!event.playerId || !event.quizId) {
            throw new Error('Invalid event data: playerId and quizId are required');
        }
        // Insert the player into the quiz_players table
        await (0, database_1.insertQuizPlayer)(event.quizId, event.playerId);
        console.log(`Successfully processed player.joined event for player ${event.playerId} in quiz ${event.quizId}`);
    }
    catch (error) {
        console.error('Error handling player.joined event:', error);
        throw error;
    }
}
//# sourceMappingURL=playerJoinedHandler.js.map