const express=require("express");
const quizs = require('../models/quiz');
const User = require('../models/user');
const router=express.Router();
const verifyToken = require("../middlewares/authmiddelware"); 
const mongoose=require("mongoose")
router.post ("/createQuiz",verifyToken,async (req, res) => {
  try {
    const { title, category, questions } = req.body;

    if (!title || !category || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ result: ' At least one question is required.' });
    }
    const quiz = new quizs({ title, category, questions });
    await quiz.save();
   return res.status(200).json({ result: 'Quiz created successfully', quiz });
  } catch (error) {
    return res.status(500).json({result:"internal server error"});
  }
});

router.get("/getquiz",verifyToken,async (req, res) => {
  try {
    const quizzes = await quizs.find();
    return res.status(200).json({result:"quiz details fetches sucessfully",quizzes});
  } catch (error) {
    return res.status(500).json({ result: "internal server error" });
  }
})

router.get("/quizbyid/:id",verifyToken,async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ result: 'Quiz ID is required.' });

    const quiz = await quizs.findById(id);
    if (!quiz) return res.status(404).json({ result: 'Quiz not found' });

    return res.status(200).json({result:"quiz details fetched successfully",quiz});
  } catch (error) {
    return res.status(500).json({ result:"internal server error" });
  }
});

router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { userId, quizId, answers } = req.body;

    if (!userId || !quizId || !Array.isArray(answers)) {
      return res.status(400).json({ result: "User ID, Quiz ID, and answers are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ result: "Invalid quiz ID format." });
    }

    const quiz = await quizs.findById(quizId);
    if (!quiz) return res.status(404).json({ result: "Quiz not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ result: "User not found" });

    const alreadySubmitted = user.quiz_scores.some(score => score.quizId.toString() === quizId);
    if (alreadySubmitted) {
      return res.status(400).json({ result: "You have already submitted this quiz." });
    }

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (Array.isArray(answers[index]) && Array.isArray(question.correctAnswer)) {
        if (JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(answers[index].sort())) {
          score++;
        }
      }
    });

    user.quiz_scores.push({ quizId, score, attemptedAt: new Date() });
    await user.save();

    return res.status(200).json({ result: "Quiz submitted successfully", score });
  } catch (error) {
    return res.status(500).json({ result: error.message });
  }
});


router.get("/leaderboard",verifyToken,async (req, res) => {
  try {
    const users = await User.find().populate('quiz_scores.quizId', 'title');
    const leaderboard = users.map(user => ({
      username: user.username,
      totalScore: user.quiz_scores.reduce((sum, entry) => sum + entry.score, 0),
      quizzes: user.quiz_scores.map(score => ({
        quizTitle: score.quizId?.title || 'Unknown Quiz',
        score: score.score,
        attemptedAt: score.attemptedAt,
      })),
    }));

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  return  res.status(200).json(leaderboard);
  } catch (error) {
    console.log(error)
    return  res.status(500).json({ result:"internal server error" });
  }
});
module.exports=router;
