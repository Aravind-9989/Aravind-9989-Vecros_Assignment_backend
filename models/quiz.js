const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: String,
  category: String,
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: [String],
      type: { type: String, enum: ['single', 'multiple', 'trueFalse'] },
    },
  ],
});
const quizs=mongoose.model("quizs",quizSchema)
module.exports=quizs
