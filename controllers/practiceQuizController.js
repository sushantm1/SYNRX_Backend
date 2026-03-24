const asyncHandler = require("express-async-handler");
const PracticeQuiz = require("../models/practiceQuize");
const PracticeQuizResult = require("../models/practiceQuizResultModel");
const User = require("../models/userModel");

// @desc Get all practice quizzes with pagination
// @access Public/Users
exports.getPracticeQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, subject, difficulty } = req.query;

  const filter = { isPublished: true };
  if (subject) filter.subject = subject;
  if (difficulty) filter.difficulty = difficulty;

  const quizzes = await PracticeQuiz.find(filter)
    .select("-questions") // Don't return full questions in list view
    .populate("createdBy", "fullName email")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const totalQuizzes = await PracticeQuiz.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Practice quizzes retrieved successfully",
    data: quizzes,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalQuizzes / limit),
      totalQuizzes,
    },
  });
});

// @desc Get single practice quiz by ID with all questions
// @access Public/Users
exports.getPracticeQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quiz = await PracticeQuiz.findById(id).populate(
    "createdBy",
    "fullName email"
  );

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Practice quiz not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Practice quiz retrieved successfully",
    data: quiz,
  });
});

// @desc Create practice quiz (Admin only)
// @access Private/Admin
exports.createPracticeQuiz = asyncHandler(async (req, res) => {
  const {
    title,
    subject,
    difficulty,
    questions,
    description,
    estimatedTime,
    tags,
  } = req.body;

  // Validation
  if (!title || !subject || !questions || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, subject, and at least one question",
    });
  }

  const newQuiz = new PracticeQuiz({
    title,
    subject,
    difficulty: difficulty || "medium",
    questions,
    description,
    estimatedTime,
    tags: tags || [],
    createdBy: req.user._id,
    isPublished: false,
    totalQuestions: questions.length,
  });

  await newQuiz.save();

  res.status(201).json({
    success: true,
    message: "Practice quiz created successfully",
    data: newQuiz,
  });
});

// @desc Update practice quiz (Admin only)
// @access Private/Admin
exports.updatePracticeQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, subject, difficulty, questions, description, tags, estimatedTime } = req.body;

  const quiz = await PracticeQuiz.findById(id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Practice quiz not found",
    });
  }

  // Check if user is the creator or admin
  if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.roles !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to update this quiz",
    });
  }

  // Update fields
  if (title) quiz.title = title;
  if (subject) quiz.subject = subject;
  if (difficulty) quiz.difficulty = difficulty;
  if (questions && questions.length > 0) {
    quiz.questions = questions;
    quiz.totalQuestions = questions.length;
  }
  if (description) quiz.description = description;
  if (tags) quiz.tags = tags;
  if (estimatedTime) quiz.estimatedTime = estimatedTime;

  await quiz.save();

  res.status(200).json({
    success: true,
    message: "Practice quiz updated successfully",
    data: quiz,
  });
});

// @desc Publish/Unpublish practice quiz (Admin only)
// @access Private/Admin
exports.togglePublishQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  const quiz = await PracticeQuiz.findById(id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Practice quiz not found",
    });
  }

  if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.roles !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to publish/unpublish this quiz",
    });
  }

  quiz.isPublished = isPublished;
  await quiz.save();

  res.status(200).json({
    success: true,
    message: `Practice quiz ${isPublished ? "published" : "unpublished"} successfully`,
    data: quiz,
  });
});

// @desc Delete practice quiz (Admin only)
// @access Private/Admin
exports.deletePracticeQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quiz = await PracticeQuiz.findById(id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Practice quiz not found",
    });
  }

  if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.roles !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to delete this quiz",
    });
  }

  await PracticeQuiz.findByIdAndDelete(id);

  // Also delete all quiz results/attempts
  await PracticeQuizResult.deleteMany({ quizId: id });

  res.status(200).json({
    success: true,
    message: "Practice quiz deleted successfully",
  });
});

// @desc Submit quiz attempt and calculate score (Student)
// @access Private
exports.submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId, answers, timeSpent } = req.body;
  const userId = req.user._id;

  // Validation
  if (!quizId || !answers || answers.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide quizId and answers",
    });
  }

  const quiz = await PracticeQuiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Practice quiz not found",
    });
  }

  // Calculate score
  let correctCount = 0;
  const detailedAnswers = answers.map((answer, index) => {
    const question = quiz.questions[index];
    const isCorrect = answer.userAnswer === question.correctAnswer;

    if (isCorrect) correctCount++;

    return {
      questionId: question.questionId,
      question: question.question,
      userAnswer: answer.userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    };
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  // Create quiz result record
  const quizResult = new PracticeQuizResult({
    userId,
    quizId,
    quizTitle: quiz.title,
    subject: quiz.subject,
    difficulty: quiz.difficulty,
    totalQuestions: quiz.questions.length,
    questionsAnswered: answers.length,
    correctAnswers: correctCount,
    score,
    timeSpent,
    answers: detailedAnswers,
    completedAt: new Date(),
    status: "completed",
  });

  await quizResult.save();

  // Update quiz statistics
  const allResults = await PracticeQuizResult.find({ quizId });
  const totalAttempts = allResults.length;
  const avgScore = Math.round(
    allResults.reduce((sum, result) => sum + result.score, 0) / totalAttempts
  );

  quiz.totalAttempts = totalAttempts;
  quiz.averageScore = avgScore;
  await quiz.save();

  res.status(201).json({
    success: true,
    message: "Quiz attempt submitted successfully",
    data: {
      result: quizResult,
      stats: {
        score,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        percentage: score,
      },
    },
  });
});

// @desc Get quiz result by ID
// @access Private
exports.getQuizResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await PracticeQuizResult.findById(id)
    .populate("userId", "fullName email")
    .populate("quizId", "title subject difficulty");

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Quiz result not found",
    });
  }

  // Check authorization
  if (result.userId._id.toString() !== userId.toString() && req.user.roles !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view this result",
    });
  }

  res.status(200).json({
    success: true,
    message: "Quiz result retrieved successfully",
    data: result,
  });
});

// @desc Get user's quiz attempt history
// @access Private
exports.getUserQuizHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const results = await PracticeQuizResult.find({ userId })
    .populate("quizId", "title subject difficulty")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const totalAttempts = await PracticeQuizResult.countDocuments({ userId });

  res.status(200).json({
    success: true,
    message: "User quiz history retrieved successfully",
    data: results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalAttempts / limit),
      totalAttempts,
    },
  });
});

// @desc Get quiz statistics
// @access Private/Admin
exports.getQuizStatistics = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await PracticeQuiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Practice quiz not found",
    });
  }

  const results = await PracticeQuizResult.find({ quizId });

  const statistics = {
    totalAttempts: results.length,
    averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
    highestScore: results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0,
    lowestScore: results.length > 0 ? Math.min(...results.map((r) => r.score)) : 0,
    passRate: results.length > 0 ? Math.round(((results.filter((r) => r.score >= 50).length / results.length) * 100)) : 0,
  };

  res.status(200).json({
    success: true,
    message: "Quiz statistics retrieved successfully",
    data: {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
      },
      statistics,
    },
  });
});
