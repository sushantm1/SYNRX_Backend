const asyncHandler = require("express-async-handler");

// Voice Feedback Service - Analyzes recorded speech
// This integrates with Web Speech API feedback on the frontend

exports.getVoiceExercises = asyncHandler(async (req, res) => {
  const { difficulty = "beginner", page = 1, limit = 10 } = req.query;

  // Sample voice exercises data
  const exercises = [
    {
      id: 1,
      title: "Basic Greetings",
      difficulty: "beginner",
      sentence: "Hello, my name is John and I am a software engineer.",
      pronunciation: "HEL-oh, my NAME is JON and I am a SOF-tware EN-jin-eer.",
      focusAreas: ["Pronunciation", "Clarity", "Pace"],
      estimatedTime: 2,
      category: "Social Communication",
    },
    {
      id: 2,
      title: "Professional Introduction",
      difficulty: "beginner",
      sentence: "Good morning. I would like to introduce myself and discuss our project timelines.",
      pronunciation: "Good MOR-ning. I WOULD like to in-TROD-uce MY-self and dis-CUSS our PRO-ject TIME-lines.",
      focusAreas: ["Intonation", "Stress", "Clarity"],
      estimatedTime: 3,
      category: "Professional Communication",
    },
    {
      id: 3,
      title: "Technical Explanation",
      difficulty: "intermediate",
      sentence: "The algorithm efficiently processes data through multiple iterations and optimizations.",
      pronunciation: "The AL-go-rith-um ef-FISH-ent-ly PROS-es-es DA-ta through MUL-ti-pul i-ter-A-shuns and op-ti-mi-ZA-shuns.",
      focusAreas: ["Technical Pronunciation", "Emphasis", "Rhythm"],
      estimatedTime: 4,
      category: "Technical Speaking",
    },
    {
      id: 4,
      title: "Confidence Building",
      difficulty: "intermediate",
      sentence: "I am confident in my abilities and ready to take on new challenges with enthusiasm.",
      pronunciation: "I am KON-fi-dent in my a-BIL-i-teez and RED-ee to take ON new CHAL-en-jez with en-THOO-zee-az-m.",
      focusAreas: ["Confidence", "Pacing", "Natural Flow"],
      estimatedTime: 3,
      category: "Personal Development",
    },
    {
      id: 5,
      title: "Complex Presentation",
      difficulty: "advanced",
      sentence: "Our comprehensive analysis demonstrates significant improvements in performance metrics across all critical parameters.",
      pronunciation: "Our com-PREE-hen-siv a-NAL-i-sis dem-ON-straytes sig-NIF-i-cant im-PROVE-ments in per-FOR-mance MET-riks a-CROSS all CRIT-i-cal pa-RAM-e-ters.",
      focusAreas: ["Professional Delivery", "Advanced Pronunciation", "Fluency"],
      estimatedTime: 5,
      category: "Advanced Communication",
    },
    {
      id: 6,
      title: "Storytelling",
      difficulty: "advanced",
      sentence: "Throughout my career, I have encountered numerous challenges that have shaped my perspective and strengthened my resolve.",
      pronunciation: "Through-OUT my ka-REER, I have en-COUN-tered NU-mer-us CHAL-en-jez that have SHAPED my per-SPEK-tiv and STRENGTH-end my re-ZOLV.",
      focusAreas: ["Narrative Flow", "Emotional Tone", "Pacing"],
      estimatedTime: 4,
      category: "Storytelling",
    },
  ];

  const filtered = exercises.filter(
    (exe) => exe.difficulty === difficulty || difficulty === "all"
  );
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    success: true,
    message: "Voice exercises retrieved successfully",
    data: paginated,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
      total: filtered.length,
    },
  });
});

exports.getExerciseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exercises = [
    {
      id: 1,
      title: "Basic Greetings",
      difficulty: "beginner",
      sentence: "Hello, my name is John and I am a software engineer.",
      pronunciation: "HEL-oh, my NAME is JON and I am a SOF-tware EN-jin-eer.",
      focusAreas: ["Pronunciation", "Clarity", "Pace"],
      estimatedTime: 2,
      category: "Social Communication",
      tips: [
        "Speak clearly with proper mouth movement",
        "Maintain a steady pace - not too fast",
        "Use natural intonation while introducing yourself",
      ],
    },
  ];

  const exercise = exercises.find((exe) => exe.id === parseInt(id));

  if (!exercise) {
    return res.status(404).json({
      success: false,
      message: "Exercise not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Exercise retrieved successfully",
    data: exercise,
  });
});

exports.submitVoiceFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { exerciseId, duration } = req.body;
  
  // For demo purposes, generate feedback without actual audio analysis
  // In production, you would:
  // 1. Store the uploaded file in cloud storage (AWS S3, Azure Blob, etc.)
  // 2. Send to speech analysis API (Google Cloud Speech-to-Text, Azure Speech, etc.)
  // 3. Generate detailed feedback based on analysis
  
  if (!exerciseId || !duration) {
    throw new Error("ExerciseId and duration are required");
  }

  const feedbackAnalysis = {
    exerciseId,
    Recording: {
      duration: `${parseFloat(duration).toFixed(1)} seconds`,
      quality: duration > 0 ? "Good" : "Failed to record",
      filename: req.file?.filename || "recording.webm",
    },
    Analysis: {
      "Clarity Score": Math.round(75 + Math.random() * 25),
      "Pronunciation Score": Math.round(70 + Math.random() * 30),
      "Pace Score": Math.round(72 + Math.random() * 28),
      "Intonation Score": Math.round(68 + Math.random() * 32),
      "Confidence Score": Math.round(70 + Math.random() * 30),
    },
    Strengths: [
      "Good vocal clarity and articulation",
      "Natural pacing maintained throughout",
      "Confident delivery style",
    ],
    AreasToImprove: [
      "Work on emphasizing key words for better intonation",
      "Slight improvement needed in pronunciation of technical terms",
      "Add more pauses between sentences for emphasis",
    ],
    Tips: [
      "Practice the sentence multiple times daily",
      "Record yourself and compare with the sample audio",
      "Focus on slowing down during complex word sequences",
    ],
    OverallScore: Math.round(71 + Math.random() * 29),
    Grade: "B+",
  };

  res.status(201).json({
    success: true,
    message: "Voice feedback generated successfully",
    data: feedbackAnalysis,
  });
});

exports.getUserVoiceStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = {
    totalAttempts: 12,
    averageScore: 78,
    practiceStreak: 4,
    lastPractice: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    improvementRate: 15, // percentage
    topScore: 92,
    timePracticed: 156, // minutes
    excellentAttempts: 5,
    goodAttempts: 4,
    averageAttempts: 3,
  };

  res.status(200).json({
    success: true,
    message: "User voice statistics retrieved successfully",
    data: stats,
  });
});

exports.getProgressHistory = asyncHandler(async (req, res) => {
  const { exerciseId } = req.params;

  const history = [
    {
      id: 1,
      exerciseId,
      attemptDate: new Date(),
      score: 85,
      duration: 12.5,
      feedback: "Great improvement! Your pronunciation is much clearer now.",
    },
    {
      id: 2,
      exerciseId,
      attemptDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      score: 78,
      duration: 10.8,
      feedback: "Good effort. Work on pacing and emphasizing key words.",
    },
    {
      id: 3,
      exerciseId,
      attemptDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      score: 72,
      duration: 9.5,
      feedback: "Keep practicing. Your confidence is improving steadily.",
    },
  ];

  res.status(200).json({
    success: true,
    message: "Progress history retrieved successfully",
    data: history,
  });
});
