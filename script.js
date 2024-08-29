document.addEventListener('DOMContentLoaded', () => {
    const questionsFile = 'Chatbot – stock data.json'; // Ensure this matches the file name
    let questions = [];
    let currentQuestionIndex = 0;
    let selectedAnswers = [];

    function loadQuestions() {
        fetch(questionsFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('No valid questions found.');
                }
                questions = data;
                loadQuestion();
            })
            .catch(error => {
                console.error('Error loading questions:', error);
                alert('Failed to load quiz data. Check the console for details.');
            });
    }

    function loadQuestion() {
        if (questions.length === 0) return;

        const quizContainer = document.getElementById('quiz');
        quizContainer.innerHTML = '';

        const question = questions[currentQuestionIndex];
        if (!question) return;

        const questionElem = document.createElement('div');
        questionElem.className = 'question';
        questionElem.innerHTML = `<h2>${question.question}</h2>`;

        question.options.forEach(option => {
            questionElem.innerHTML += `
                <div>
                    <input type="radio" id="q${question.id}a${option.key}" name="question${question.id}" value="${option.key}">
                    <label for="q${question.id}a${option.key}">${option.text}</label>
                </div>
            `;
        });

        quizContainer.appendChild(questionElem);

        // Load previously selected answer if available
        const previouslySelected = selectedAnswers[currentQuestionIndex];
        if (previouslySelected) {
            document.querySelector(`input[name="question${questions[currentQuestionIndex].id}"][value="${previouslySelected}"]`).checked = true;
        }

        updateNavigationButtons();
        checkAllQuestionsAnswered();
    }

    function handleSubmit() {
        if (selectedAnswers.length < questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        const resultElem = document.getElementById('result');
        let score = 0;

        questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.answerKey) {
                score++;
            }
        });

        resultElem.innerHTML = `<h2>Quiz Results</h2><p>You scored ${score} out of ${questions.length}.</p>`;

        questions.forEach((question, index) => {
            const userAnswer = selectedAnswers[index];
            const correctAnswer = question.options.find(option => option.key === question.answerKey)?.text || 'No answer';
            const userAnswerText = question.options.find(option => option.key === userAnswer)?.text || 'No answer';

            resultElem.innerHTML += `
                <p><strong>Q${index + 1}:</strong> ${question.question}</p>
                <p>Your Answer: ${userAnswerText}</p>
                <p>Correct Answer: ${correctAnswer}</p>
                <hr>
            `;
        });

        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'inline';
        resultElem.style.display = 'block';
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        selectedAnswers = [];
        loadQuestion();
        document.getElementById('submit-btn').style.display = 'inline';
        document.getElementById('restart-btn').style.display = 'none';
        document.getElementById('result').style.display = 'none';
    }

    function showPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    }

    function showNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
    }

    function updateNavigationButtons() {
        document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;
        document.getElementById('next-btn').disabled = currentQuestionIndex === questions.length - 1;
    }

    function checkAllQuestionsAnswered() {
        const allAnswered = questions.every((question, index) => {
            return selectedAnswers[index] !== undefined && selectedAnswers[index] !== null;
        });

        document.getElementById('submit-btn').disabled = !allAnswered;
    }

    function handleAnswerChange(event) {
        const questionId = parseInt(event.target.name.replace('question', ''), 10);
        const answerKey = event.target.value;

        selectedAnswers[questions.findIndex(q => q.id === questionId)] = answerKey;
        checkAllQuestionsAnswered();
    }

    document.getElementById('submit-btn').addEventListener('click', handleSubmit);
    document.getElementById('restart-btn').addEventListener('click', restartQuiz);
    document.getElementById('exit-btn').addEventListener('click', () => window.close());
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);

    document.addEventListener('change', handleAnswerChange);

    loadQuestions();
});
