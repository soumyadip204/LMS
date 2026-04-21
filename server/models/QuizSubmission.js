import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOptionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
    }
  ]
});

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicated quiz submissions overriding each other without versioning? 
// Actually for quizzes, letting a student retake may overwrite or we can keep highest score. We will implement overwriting via unique index.
quizSubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);
export default QuizSubmission;
