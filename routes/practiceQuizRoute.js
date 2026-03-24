const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authMiddleware");
const {
  getPracticeQuizzes,
  getPracticeQuizById,
  createPracticeQuiz,
  updatePracticeQuiz,
  togglePublishQuiz,
  deletePracticeQuiz,
  submitQuizAttempt,
  getQuizResult,
  getUserQuizHistory,
  getQuizStatistics,
} = require("../controllers/practiceQuizController");

const router = express.Router();

// Public routes
router.get("/", getPracticeQuizzes);
router.get("/:id", getPracticeQuizById);

// Protected routes (Authenticated users)
router.post("/:quizId/submit", protect, submitQuizAttempt);
router.get("/results/user/history", protect, getUserQuizHistory);
router.get("/results/:id", protect, getQuizResult);

// Admin routes (Create, Update, Delete)
router.post("/", protect, authorizeRoles("faculty", "superadmin"), createPracticeQuiz);
router.put("/:id", protect, authorizeRoles("faculty", "superadmin"), updatePracticeQuiz);
router.patch("/:id/publish", protect, authorizeRoles("faculty", "superadmin"), togglePublishQuiz);
router.delete("/:id", protect, authorizeRoles("faculty", "superadmin"), deletePracticeQuiz);

// Statistics (Admin only)
router.get("/:quizId/stats", protect, authorizeRoles("faculty", "superadmin"), getQuizStatistics);

module.exports = router;
