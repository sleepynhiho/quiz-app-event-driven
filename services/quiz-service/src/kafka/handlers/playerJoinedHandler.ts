import { KafkaPlayerJoinedEvent } from '../../types';
import { insertQuizPlayer } from '../../db/database';

export async function handlePlayerJoinedEvent(event: KafkaPlayerJoinedEvent): Promise<void> {
  try {
    console.log('Processing player.joined event:', event);
    
    // Validate the event data
    if (!event.playerId || !event.quizId) {
      throw new Error('Invalid event data: playerId and quizId are required');
    }

    // Insert the player into the quiz_players table
    await insertQuizPlayer(event.quizId, event.playerId);
    
    console.log(`Successfully processed player.joined event for player ${event.playerId} in quiz ${event.quizId}`);
  } catch (error) {
    console.error('Error handling player.joined event:', error);
    throw error;
  }
}
