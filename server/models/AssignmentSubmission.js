import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
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
    submissionUrl: {
      type: String,
      default: '',
    },
    submissionText: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only have one active submission per assignment
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
export default AssignmentSubmission;
