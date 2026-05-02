import AssignmentSubmission from '../models/AssignmentSubmission.js';
import QuizSubmission from '../models/QuizSubmission.js';
import Course from '../models/Course.js';

// @desc    Submit an assignment
// @route   POST /api/submissions/assignment/:courseId/:assignmentId
// @access  Private (Learner)
export const submitAssignment = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const { submissionUrl, submissionText } = req.body;
    const studentId = req.user._id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if enrolled
    const isEnrolled = course.enrolledStudents.includes(studentId);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Update if exists or create new
    let submission = await AssignmentSubmission.findOne({ assignmentId, studentId });
    if (submission) {
      submission.submissionUrl = submissionUrl;
      submission.submissionText = submissionText;
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        courseId,
        studentId,
        submissionUrl,
        submissionText,
      });
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit a quiz
// @route   POST /api/submissions/quiz/:courseId/:quizId
// @access  Private (Learner)
export const submitQuiz = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOptionIds: [] }
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const isEnrolled = course.enrolledStudents.includes(studentId);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Find the quiz within the course modules
    let quizItem = null;
    for (const module of course.modules) {
      const item = module.items.id(quizId);
      if (item && item.type === 'quiz') {
        quizItem = item;
        break;
      }
    }

    if (!quizItem) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    
    // Convert answers payload to map for easy lookup
    const studentAnsMap = {};
    answers.forEach(ans => {
      studentAnsMap[ans.questionId.toString()] = ans.selectedOptionIds.map(id => id.toString());
    });

    for (const question of quizItem.questions) {
      const correctOptionIds = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt._id.toString());
      
      const studentSelectedIds = studentAnsMap[question._id.toString()] || [];

      // Check if arrays match exactly
      const isCorrect = correctOptionIds.length === studentSelectedIds.length && 
        correctOptionIds.every(id => studentSelectedIds.includes(id));
      
      if (isCorrect) {
        score += question.score;
      }
    }

    const passed = score >= quizItem.passingScore;

    // Upsert submission
    let submission = await QuizSubmission.findOne({ quizId, studentId });
    if (submission) {
      // Re-takes
      submission.answers = answers;
      submission.score = score;
      submission.passed = passed;
      await submission.save();
    } else {
      submission = await QuizSubmission.create({
        quizId,
        courseId,
        studentId,
        answers,
        score,
        passed
      });
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's submissions for a course
// @route   GET /api/submissions/course/:courseId
// @access  Private
export const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courseId = req.params.courseId;

    const [assignments, quizzes] = await Promise.all([
      AssignmentSubmission.find({ courseId, studentId }),
      QuizSubmission.find({ courseId, studentId })
    ]);

    res.status(200).json({ 
      success: true, 
      assignments, 
      quizzes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
