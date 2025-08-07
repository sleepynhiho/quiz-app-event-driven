import { PoolClient } from 'pg';
import { Quiz } from '../types';
declare class Database {
    private pool;
    constructor();
    getClient(): Promise<PoolClient>;
    createQuiz(quiz: Quiz): Promise<Quiz>;
    initSchema(): Promise<void>;
    close(): Promise<void>;
    insertQuizPlayer(quizId: string, playerId: string): Promise<void>;
}
export declare const database: Database;
export declare const insertQuizPlayer: (quizId: string, playerId: string) => Promise<void>;
export {};
//# sourceMappingURL=database.d.ts.map