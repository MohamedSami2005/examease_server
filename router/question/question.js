const express = require('express');
const Question = require('../../models/questions'); // Path to your Question model
const router = express.Router();

router.post('/save-question', async (req, res) => {
    const { courseCode, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'No questions provided' });
    }

    try {
        // Validate and save each question
        for (const question of questions) {
            const { courseCode, questionNumber, questionText, correctAnswer, options, questionImage } = question;

            if (!courseCode || !questionNumber || !questionText || !correctAnswer) {
                return res.status(400).json({ message: 'Missing required fields in one or more questions' });
            }

            // Check if the question with the same courseCode and questionNumber already exists
            const existingQuestion = await Question.findOne({ courseCode, questionNumber });

            if (existingQuestion) {
                console.log('Question already exists:', existingQuestion);
                continue;  // Skip saving this question since it already exists
            }

            // If no existing question, save the new question
            const newQuestion = new Question({
                courseCode,
                questionNumber,
                questionText,
                questionImage: questionImage || null,
                options,
                correctAnswer,
            });

            const savedQuestion = await newQuestion.save();
            console.log('Question saved:', savedQuestion);  // Log the saved question
        }

        res.status(201).json({ message: 'Questions saved successfully!' });
    } catch (err) {
        console.error('Error saving questions:', err);
        res.status(500).json({ message: 'Error saving questions', error: err.message });
    }
});

module.exports = router;
