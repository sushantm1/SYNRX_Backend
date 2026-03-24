const mongoose = require("mongoose");

const practiceQuizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticeQuiz",
      required: true,
    },
    quizTitle: String,
    subject: String,
    difficulty: String,
    totalQuestions: Number,
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0, // Percentage (0-100)
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    answers: [
      {
        questionId: String,
        question: String,
        userAnswer: Number,
        correctAnswer: Number,
        isCorrect: Boolean,
        explanation: String,
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    isRetake: {
      type: Boolean,
      default: false,
    },
    remarks: String, // Performance notes for the user
  },
  { timestamps: true }
);

// Index for quick lookups
practiceQuizResultSchema.index({ userId: 1, quizId: 1 });
practiceQuizResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PracticeQuizResult", practiceQuizResultSchema);
