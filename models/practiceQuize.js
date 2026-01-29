import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true }, // os, cn, dbms...
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
