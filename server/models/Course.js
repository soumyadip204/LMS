import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['single', 'multiple'], required: true },
  score: { type: Number, required: true },
  options: [optionSchema],
  explanation: { type: String, default: '' }
});

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'documentation', 'assignment', 'quiz'],
    required: true
  },
  title: { type: String, required: true },
  
  // Shared fields
  duration: { type: String, default: '' },
  
  // Video and Documentation fields
  url: { type: String, default: '' },
  
  // Assignment fields
  maxScore: { type: Number, default: 0 },
  passingScore: { type: Number, default: 0 },
  time: { type: String, default: '' }, // For tracking assignment / quiz time
  description: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' }, // External guidance URL
  
  // Quiz fields
  shuffleQuestions: { type: Boolean, default: false },
  questions: [questionSchema]
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  items: [itemSchema]
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    whatYouWillLearn: [
      {
        type: String,
        trim: true,
      }
    ],
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Machine Learning',
        'UI/UX Design',
        'DevOps',
        'Cybersecurity',
        'Other',
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modules: [moduleSchema],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Course = mongoose.model('Course', courseSchema);
export default Course;
