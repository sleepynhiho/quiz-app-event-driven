import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoringService } from './scoring.service';
import { PlayerScore } from '../entities/player-score.entity';
import { AnswerSubmittedDto } from '../dto/answer-submitted.dto';

describe('ScoringService', () => {
  let service: ScoringService;
  let repository: Repository<PlayerScore>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        {
          provide: getRepositoryToken(PlayerScore),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    repository = module.get<Repository<PlayerScore>>(getRepositoryToken(PlayerScore));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processAnswerSubmitted', () => {
    const answerData: AnswerSubmittedDto = {
      playerId: 'player-123',
      quizId: 'quiz-456',
      questionId: 'question-789',
      isCorrect: true,
      submittedAt: new Date().toISOString(),
    };

    it('should create new score record with 10 points for correct answer', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      const newPlayerScore = { 
        playerId: 'player-123', 
        quizId: 'quiz-456', 
        score: 10 
      };
      mockRepository.create.mockReturnValue(newPlayerScore);
      mockRepository.save.mockResolvedValue(newPlayerScore);

      // Act
      await service.processAnswerSubmitted(answerData);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { playerId: 'player-123', quizId: 'quiz-456' }
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        playerId: 'player-123',
        quizId: 'quiz-456',
        score: 10,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newPlayerScore);
    });

    it('should create new score record with 0 points for incorrect answer', async () => {
      // Arrange
      const incorrectAnswer = { ...answerData, isCorrect: false };
      mockRepository.findOne.mockResolvedValue(null);
      const newPlayerScore = { 
        playerId: 'player-123', 
        quizId: 'quiz-456', 
        score: 0 
      };
      mockRepository.create.mockReturnValue(newPlayerScore);
      mockRepository.save.mockResolvedValue(newPlayerScore);

      // Act
      await service.processAnswerSubmitted(incorrectAnswer);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        playerId: 'player-123',
        quizId: 'quiz-456',
        score: 0,
      });
    });

    it('should increment existing score by 10 for correct answer', async () => {
      // Arrange
      const existingScore = { 
        id: 'existing-id',
        playerId: 'player-123', 
        quizId: 'quiz-456', 
        score: 20,
        updatedAt: new Date()
      };
      mockRepository.findOne.mockResolvedValue(existingScore);
      mockRepository.save.mockResolvedValue({ ...existingScore, score: 30 });

      // Act
      await service.processAnswerSubmitted(answerData);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingScore,
        score: 30,
      });
    });

    it('should not increment score for incorrect answer', async () => {
      // Arrange
      const incorrectAnswer = { ...answerData, isCorrect: false };
      const existingScore = { 
        id: 'existing-id',
        playerId: 'player-123', 
        quizId: 'quiz-456', 
        score: 20,
        updatedAt: new Date()
      };
      mockRepository.findOne.mockResolvedValue(existingScore);
      mockRepository.save.mockResolvedValue(existingScore);

      // Act
      await service.processAnswerSubmitted(incorrectAnswer);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingScore,
        score: 20, // Score remains unchanged
      });
    });
  });

  describe('getPlayerScore', () => {
    it('should return player score', async () => {
      const playerScore = { 
        playerId: 'player-123', 
        quizId: 'quiz-456', 
        score: 30 
      };
      mockRepository.findOne.mockResolvedValue(playerScore);

      const result = await service.getPlayerScore('player-123', 'quiz-456');

      expect(result).toEqual(playerScore);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { playerId: 'player-123', quizId: 'quiz-456' }
      });
    });
  });

  describe('getQuizLeaderboard', () => {
    it('should return leaderboard ordered by score desc', async () => {
      const leaderboard = [
        { playerId: 'player-1', score: 50 },
        { playerId: 'player-2', score: 40 },
        { playerId: 'player-3', score: 30 },
      ];
      mockRepository.find.mockResolvedValue(leaderboard);

      const result = await service.getQuizLeaderboard('quiz-456', 10);

      expect(result).toEqual(leaderboard);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { quizId: 'quiz-456' },
        order: { score: 'DESC', updatedAt: 'ASC' },
        take: 10,
      });
    });
  });
});
