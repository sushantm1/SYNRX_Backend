const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getVoiceExercises,
  getExerciseById,
  submitVoiceFeedback,
  getUserVoiceStats,
  getProgressHistory,
} = require("../controllers/voiceController");

const router = express.Router();

// Public routes
router.get("/exercises", getVoiceExercises);
router.get("/exercises/:id", getExerciseById);

// Protected routes
router.post("/submit-feedback", protect, submitVoiceFeedback);
router.get("/stats", protect, getUserVoiceStats);
router.get("/history/:exerciseId", protect, getProgressHistory);

module.exports = router;
