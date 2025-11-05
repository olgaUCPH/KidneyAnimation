// mcq_handle.js
const mcqContainer = document.getElementById('MCQ');

// Questions
const questions = [
    // Question 1
    {
        question: "Which of the following are correct?",
        options: [
        { text: "False", correct: false },
        { text: "False", correct: false },
        { text: "True", correct: true },
        { text: "False", correct: false }
        ]
    },

    // Question 2
    {
        question: "Which these ones are correct?",
        options: [
        { text: "True", correct: true },
        { text: "False", correct: false },
        { text: "False", correct: false },
        { text: "False", correct: false }
        ]
    },
  
    // Question 3
    {
        question: "What about these?",
        options: [
        { text: "False", correct: false },
        { text: "False", correct: false },
        { text: "False", correct: false },
        { text: "True", correct: true }
        ]
    },

    // More questions go here
];



let currentQuestionIndex = 0;

function showQuestion(index) {
  mcqContainer.innerHTML = ''; // Clear previous content

  const q = questions[index];

  // Question title
  const h3 = document.createElement('h3');
  h3.textContent = `Question ${index + 1}`;
  mcqContainer.appendChild(h3);

  // Question text
  const p = document.createElement('p');
  p.className = 'mcq-question';
  p.textContent = q.question;
  mcqContainer.appendChild(p);

  // Options
  const ul = document.createElement('ul');
  ul.className = 'mcq-options';
  q.options.forEach((option, i) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'question';
    input.value = i; // index of option
    label.appendChild(input);
    label.appendChild(document.createTextNode(option.text));
    li.appendChild(label);
    ul.appendChild(li);
  });
  mcqContainer.appendChild(ul);

  // Submit button
  const button = document.createElement('button');
  button.textContent = 'Submit';
  button.id = 'submitMCQ'; 
  mcqContainer.appendChild(button);

  // Feedback paragraph
  const feedback = document.createElement('p');
  feedback.id = 'mcqFeedback';
  mcqContainer.appendChild(feedback);

  // Submit click handler
  button.addEventListener('click', () => {
    const selected = document.querySelector('input[name="question"]:checked');
    if (!selected) {
      feedback.textContent = 'Please select an answer!';
      feedback.style.color = 'red';
      return;
    }

    const answer = q.options[selected.value];
    if (answer.correct) {
      feedback.textContent = 'Correct! ✅';
      feedback.style.color = 'green';
      // Move to next question after a short delay
      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          showQuestion(currentQuestionIndex);
        } else {
          mcqContainer.innerHTML = '<h3>All questions completed! 🎉</h3>';
        }
      }, 600);
    } else {
      feedback.textContent = 'Incorrect. ❌ Try again!';
      feedback.style.color = 'red';
    }
  });
}

// Start with the first question
showQuestion(currentQuestionIndex);
