const mongoose = require("mongoose");

const practiceQuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: [
        "Data Structures",
        "Algorithms",
        "Database Management",
        "Operating Systems",
        "Computer Networks",
        "System Design",
        "Web Development",
        "Mobile Development",
      ],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    description: {
      type: String,
      trim: true,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    questions: [
      {
        questionId: String,
        question: String,
        questionType: {
          type: String,
          enum: ["multiple-choice", "true-false", "short-answer"],
          default: "multiple-choice",
        },
        options: [String],
        correctAnswer: Number, // Index of correct answer
        explanation: String,
        topic: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    estimatedTime: {
      type: Number, // in minutes
      default: 30,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeQuiz", practiceQuizSchema);
