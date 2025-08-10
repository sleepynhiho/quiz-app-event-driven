import React, { useState } from 'react';
import './QuizCreator.css';
import { quizApi } from '../services/api';
import { User } from '../types';

interface QuizCreatorProps {
  user: User;
  onQuizCreated: (quiz: any) => void;
}

interface QuestionForm {
  content: string;
  options: string[];
  correctAnswer: number; // Đổi từ string sang number
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ user, onQuizCreated }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      content: '',
      options: ['', '', '', ''],
      correctAnswer: -1 // -1 nghĩa là chưa chọn
    }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      content: '',
      options: ['', '', '', ''],
      correctAnswer: -1 // -1 nghĩa là chưa chọn
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    if (field === 'options') {
      updated[index] = { ...updated[index], [field]: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizTitle.trim()) {
      alert('⚠️ Vui lòng nhập tiêu đề quiz!');
      return;
    }

    const invalidQuestions = questions.some(q => 
      !q.content.trim() || 
      q.options.some(opt => !opt.trim()) || 
      q.correctAnswer < 0 || 
      q.correctAnswer >= q.options.length ||
      !q.options[q.correctAnswer].trim()
    );

    if (invalidQuestions) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin cho tất cả câu hỏi!');
      return;
    }

    setLoading(true);
    try {
      const quiz = await quizApi.createQuiz({
        title: quizTitle,
        hostId: user.id,
        questions: questions.map((q, index) => ({
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: index + 1
        }))
      });
      
      onQuizCreated(quiz);
      
      // Reset form
      setQuizTitle('');
      setQuestions([{
        content: '',
        options: ['', '', '', ''],
        correctAnswer: -1
      }]);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('❌ Có lỗi khi tạo quiz. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-creator">
      <div className="creator-header">
        <h2>🎯 Tạo Quiz Mới</h2>
        <p>Tạo quiz của riêng bạn với các câu hỏi tùy chỉnh</p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="quiz-info">
          <label>
            📝 Tiêu đề Quiz:
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Nhập tiêu đề quiz..."
              required
            />
          </label>
        </div>

        <div className="questions-section">
          <h3>❓ Câu hỏi ({questions.length})</h3>
          
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-form">
              <div className="question-header">
                <h4>Câu {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="remove-question-btn"
                  >
                    🗑️ Xóa
                  </button>
                )}
              </div>

              <label>
                Nội dung câu hỏi:
                <textarea
                  value={question.content}
                  onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  required
                />
              </label>

              <div className="options-section">
                <label>Các lựa chọn:</label>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="option-input">
                    <span>{String.fromCharCode(65 + optIndex)})</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + optIndex)}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <label>
                Đáp án đúng:
                <select
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value, 10))}
                  required
                >
                                      <option value="-1">-- Chọn đáp án đúng --</option>
                  {question.options.map((option, optIndex) => (
                    <option key={optIndex} value={optIndex} disabled={!option.trim()}>
                      {String.fromCharCode(65 + optIndex)}) {option || '(Chưa nhập)'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="add-question-btn"
          >
            ➕ Thêm câu hỏi
          </button>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="create-quiz-btn"
          >
            {loading ? '⏳ Đang tạo...' : '🚀 Tạo Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreator; 