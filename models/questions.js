const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: { type: String, default: null },
});

const questionSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  questionNumber: { type: String, required: true },
  questionText: { type: String, required: true },
  questionImage: { type: String, default: null },
  options: [optionSchema],
  correctAnswer: { type: String, required: true },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
