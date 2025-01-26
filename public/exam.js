// Question status constants
const QuestionStatus = {
    NOT_VISITED: 'not-visited',
    NOT_ANSWERED: 'not-answered',
    ANSWERED: 'answered',
    MARKED_FOR_REVIEW: 'marked-review',
    ANSWERED_AND_MARKED: 'answered-marked'
};

// Updated question bank with programming subjects
const questionBank = {
    'cpp': [
        {
            question: "What is the output of 'cout << 5/2;' in C++?",
            options: ["2.5", "2", "2.0", "Error"],
            correct: 1,
            marks: 4,
            negativeMark: -1
        },
        {
            question: "Which of the following is a correct way to declare a pointer in C++?",
            options: ["int ptr;", "pointer int ptr;", "int *ptr;", "int ptr*;"],
            correct: 2,
            marks: 4,
            negativeMark: -1
        },
        {
            question: "What is the size of 'int' data type in C++?",
            options: ["2 bytes", "4 bytes", "8 bytes", "Depends on compiler"],
            correct: 3,
            marks: 4,
            negativeMark: -1
        }
    ],
    'java': [
        {
            question: "Which of these keywords is used to define interfaces in Java?",
            options: ["intf", "Intf", "interface", "Interface"],
            correct: 2,
            marks: 4,
            negativeMark: -1
        },
        {
            question: "What is the output of 'System.out.println(5/2);' in Java?",
            options: ["2.5", "2", "2.0", "Error"],
            correct: 1,
            marks: 4,
            negativeMark: -1
        }
    ],
    'python': [
        {
            question: "What is the output of 'print(5/2)' in Python 3?",
            options: ["2.5", "2", "2.0", "Error"],
            correct: 0,
            marks: 4,
            negativeMark: -1
        },
        {
            question: "Which of these is used to define a block in Python?",
            options: ["Curly braces", "Parentheses", "Indentation", "Square brackets"],
            correct: 2,
            marks: 4,
            negativeMark: -1
        }
    ]
};

let currentSubject = '';
let currentQuestionIndex = 0;
let userAnswers = {};
let questionStatus = {};
let timer;
let timeLeft = 3600; // 60 minutes in seconds

function initializeExam() {
    // Get the selected subject from localStorage
    currentSubject = localStorage.getItem('selectedSubject');
    if (!currentSubject || !questionBank[currentSubject]) {
        alert('Invalid subject selected!');
        window.location.href = '/examportal';
        return;
    }

    // Initialize question status
    questionBank[currentSubject].forEach((_, index) => {
        const qKey = `${currentSubject}_${index}`;
        questionStatus[qKey] = QuestionStatus.NOT_VISITED;
    });
    
    // Update page title
    document.title = `${currentSubject.toUpperCase()} Exam`;
    
    // Create question palette
    createQuestionPalette();
    updateQuestionStatus();
    displayQuestion();
}

function createQuestionPalette() {
    const palette = document.getElementById('questionPalette');
    if (!palette) return;

    const questions = questionBank[currentSubject];
    const paletteHtml = `
        <div class="section">
            <h3>${currentSubject.toUpperCase()} Questions</h3>
            <div class="palette-buttons">
                ${questions.map((_, index) => `
                    <button class="palette-btn" onclick="jumpToQuestion(${index})">
                        ${index + 1}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    palette.innerHTML = paletteHtml;
}

function updateQuestionStatus() {
    const qKey = `${currentSubject}_${currentQuestionIndex}`;
    const buttons = document.querySelectorAll('.palette-btn');
    
    buttons.forEach((btn, index) => {
        const status = questionStatus[`${currentSubject}_${index}`];
        
        btn.className = `palette-btn ${status}`;
    });
}

function startExam() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'block';
    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `Time Left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function displayQuestion() {
    const questions = questionBank[currentSubject];
    const question = questions[currentQuestionIndex];

    document.getElementById('question').innerHTML = `
        <h3>Question ${currentQuestionIndex + 1} of ${questions.length}</h3>
        <p>${question.question}</p>
    `;

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        const qKey = `${currentSubject}_${currentQuestionIndex}`;
        
        if (userAnswers[qKey] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.onclick = () => selectOption(index);
        optionElement.textContent = option;
        optionsContainer.appendChild(optionElement);
    });

    updateQuestionStatus();
}

function selectOption(optionIndex) {
    userAnswers[`${currentSubject}_${currentQuestionIndex}`] = optionIndex;
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelectorAll('.option')[optionIndex].classList.add('selected');
}

function saveAndNext() {
    const qKey = `${currentSubject}_${currentQuestionIndex}`;
    if (userAnswers[qKey] !== undefined) {
        questionStatus[qKey] = QuestionStatus.ANSWERED;
    } else {
        questionStatus[qKey] = QuestionStatus.NOT_ANSWERED;
    }
    
    updateQuestionStatus();
    nextQuestion();
}

function clearResponse() {
    const qKey = `${currentSubject}_${currentQuestionIndex}`;
    delete userAnswers[qKey];
    questionStatus[qKey] = QuestionStatus.NOT_ANSWERED;
    
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    updateQuestionStatus();
}

function markForReview() {
    const qKey = `${currentSubject}_${currentQuestionIndex}`;
    if (userAnswers[qKey] !== undefined) {
        questionStatus[qKey] = QuestionStatus.ANSWERED_AND_MARKED;
    } else {
        questionStatus[qKey] = QuestionStatus.MARKED_FOR_REVIEW;
    }
    
    updateQuestionStatus();
    nextQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < questionBank[currentSubject].length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
}

function calculateScore() {
    let totalScore = 0;
    questionBank[currentSubject].forEach((question, index) => {
        const qKey = `${currentSubject}_${index}`;
        if (userAnswers[qKey] !== undefined) {
            if (userAnswers[qKey] === question.correct) {
                totalScore += question.marks;
            } else {
                totalScore += question.negativeMark;
            }
        }
    });
    return totalScore;
}

function submitExam() {
    clearInterval(timer);
    const score = calculateScore();
    
    // Store the result
    const result = {
        subject: currentSubject,
        score: score,
        date: new Date().toISOString()
    };
    
    let results = JSON.parse(localStorage.getItem('examResults') || '[]');
    results.push(result);
    localStorage.setItem('examResults', JSON.stringify(results));
    
    // Redirect to results page
    window.location.href = '/results';
}

initializeExam();
