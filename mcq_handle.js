// mcq_handle.js
const mcqContainer = document.getElementById('MCQ');

// Questions
const questions = [
    // Question 1
    {
        question: "Why is the descending limb of the loop of Henle important for concentrating urine?",
        options: [
        { text: "It actively pumps sodium and chloride into the medulla", correct: false },
        { text: "It is impermeable to water but permeable to solutes", correct: false },
        { text: "It is permeable to water but not to solutes", correct: true },
        { text: "It secretes sodium and chloride into the tubular fluid", correct: false }
        ]
    },

    // Question 2
    {
        question: "The countercurrent multiplier system depends on which key feature of the loop of Henle?",
        options: [
        { text: "Equal permeability of both limbs to water and solutes", correct: false },
        { text: "Active transport of solutes in the ascending limb and passive water movement in the descending limb", correct: true },
        { text: "Active sodium and chloride reabsorption in both limbs", correct: false },
        { text: "Passive sodium transport in the proximal tubule", correct: false }
        ]
    },
  
    // Question 3
    {
        question: "Which of the following best explains how the thick ascending limb of the loop of Henle contributes to the corticomedullary osmotic gradient?",
        options: [
        { text: "It passively reabsorbs sodium and chloride, allowing equilibration with the interstitium.", correct: false },
        { text: "It actively reabsorbs Na⁺, K⁺, and Cl⁻ via the NKCC2 cotransporter, while being impermeable to water.", correct: true },
        { text: "It reabsorbs water through aquaporin-1 channels.", correct: false },
        { text: "It actively secretes urea into the tubular lumen.", correct: false }
        ]
    },

      
    // Question 4
    {
        question: "Which of the following changes would most likely reduce the kidney’s ability to produce concentrated urine?",
        options: [
        { text: "Increased medullary blood flow through the vasa recta", correct: true },
        { text: "Increased ADH secretion", correct: false },
        { text: "Increased water permeability in descending limb", correct: false },
        { text: "Increased NaCl reabsorption in the thick ascending limb", correct: false }
        ]
    },

      
    // Question 5
    {
        question: "What is the primary role of the vasa recta in the countercurrent exchange system?",
        options: [
        { text: "Actively pump solutes into the interstitium to maintain hypertonicity", correct: false },
        { text: "Maintain medullary osmotic gradient by minimizing solute washout through passive exchange", correct: true },
        { text: "Remove water from the medulla by active transport", correct: false },
        { text: "Concentrate urea in the renal cortex", correct: false }
        ]
    },

    // Question 6
    {
        question: "A 52-year-old man is treated with furosemide for congestive heart failure. Which of the following best describes how this drug affects his kidney’s ability to concentrate urine?",
        options: [
        { text: "It enhances urea recycling in the medulla", correct: false },
        { text: "It increases medullary hypertonicity by promoting Na⁺ reabsorption", correct: false },
        { text: "It blocks Na⁺/K⁺/2Cl⁻ transport in the thick ascending limb, reducing the corticomedullary osmotic gradient", correct: true },
        { text: "It increases ADH release from the posterior pituitary", correct: false }
        ]
    },
    // Explanation: Loop diuretics inhibit the NKCC2 transporter, disrupting the countercurrent multiplier mechanism and impairing urine concentration

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
      }, 900);
    } else {
      feedback.textContent = 'Incorrect. ❌ Try again!';
      feedback.style.color = 'red';
    }
  });
}

// Start with the first question
showQuestion(currentQuestionIndex);
