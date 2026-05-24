// mcq_handle.js
const mcqContainer = document.getElementById('MCQ');

// Knowledge Check questions (existing)
const knowledgeQuestions = [
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
];

// Interactive Lab module: one question per slider + scenario combination questions
const interactiveQuestions = [
  // Slider identification questions
  {
    question: "Which manipulation will increase water permeability of the descending limb (DL)?",
    options: [
      { text: "DL permeability (kSlider)", correct: true },
      { text: "AL NaCl reabsorption (maxRNaSlider)", correct: false },
      { text: "Loop flow (F0Slider)", correct: false },
      { text: "CD water permeability (kcdSlider)", correct: false }
    ]
  },
  {
    question: "Which manipulation will increase active NaCl reabsorption in the ascending limb (AL)?",
    options: [
      { text: "AL NaCl reabsorption (maxRNaSlider)", correct: true },
      { text: "Vasa recta flow (FvasaSlider)", correct: false },
      { text: "DL permeability (kSlider)", correct: false },
      { text: "Collecting duct permeability (kcdSlider)", correct: false }
    ]
  },
  {
    question: "Which manipulation will increase tubular flow through the Loop of Henle?",
    options: [
      { text: "Loop of Henle flow (F0Slider)", correct: true },
      { text: "Vasa recta flow (FvasaSlider)", correct: false },
      { text: "DL permeability (kSlider)", correct: false },
      { text: "AL NaCl reabsorption (maxRNaSlider)", correct: false }
    ]
  },
  {
    question: "Which manipulation will increase collecting duct (CD) water permeability (ADH-sensitive)?",
    options: [
      { text: "CD water permeability (kcdSlider)", correct: true },
      { text: "DL permeability (kSlider)", correct: false },
      { text: "AL NaCl reabsorption (maxRNaSlider)", correct: false },
      { text: "Loop flow (F0Slider)", correct: false }
    ]
  },
  {
    question: "Which manipulation will increase blood flow through the vasa recta?",
    options: [
      { text: "Vasa recta blood flow (FvasaSlider)", correct: true },
      { text: "Loop flow (F0Slider)", correct: false },
      { text: "CD permeability (kcdSlider)", correct: false },
      { text: "AL reabsorption (maxRNaSlider)", correct: false }
    ]
  },

  // Combination / scenario questions
  {
    question: "A person drinks water. Which parameter change best matches this situation and how will it affect urine osmolarity and diuresis?",
    options: [
      { text: "Decrease CD water permeability (kcd) — urine osmolarity decreases, diuresis increases", correct: true },
      { text: "Increase AL NaCl reabsorption (maxRNa) — urine osmolarity increases, diuresis decreases", correct: false },
      { text: "Increase vasa recta flow (Fvasa) — urine osmolarity increases, diuresis decreases", correct: false },
      { text: "Increase DL permeability (k) — urine osmolarity increases, diuresis decreases", correct: false }
    ]
  },
  {
    question: "A person takes loop diuretics. Which parameter change best represents the drug effect and what is the expected influence on urine osmolarity and diuresis?",
    options: [
      { text: "Decrease AL NaCl reabsorption (maxRNa) — urine osmolarity decreases, diuresis increases", correct: true },
      { text: "Increase CD water permeability (kcd) — urine osmolarity increases, diuresis decreases", correct: false },
      { text: "Decrease vasa recta flow (Fvasa) — urine osmolarity increases, diuresis decreases", correct: false },
      { text: "Increase DL permeability (k) — urine osmolarity decreases, diuresis decreases", correct: false }
    ]
  },
  {
    question: "A person receives ADH. Which parameter would you change and how will urine osmolarity and diuresis respond?",
    options: [
      { text: "Increase CD water permeability (kcd) — urine osmolarity increases, diuresis decreases", correct: true },
      { text: "Decrease AL NaCl reabsorption (maxRNa) — urine osmolarity decreases, diuresis increases", correct: false },
      { text: "Increase vasa recta flow (Fvasa) — urine osmolarity decreases, diuresis increases", correct: false },
      { text: "Increase Loop flow (F0) — urine osmolarity increases, diuresis decreases", correct: false }
    ]
  },
  {
    question: "A person takes SGT1 inhibitors. Which parameter change best mimics the main effect and how will urine osmolarity and diuresis change?",
    options: [
      { text: "Increase Loop of Henle flow (F0) — urine osmolarity decreases, diuresis increases", correct: true },
      { text: "Increase CD water permeability (kcd) — urine osmolarity increases, diuresis decreases", correct: false },
      { text: "Increase AL NaCl reabsorption (maxRNa) — urine osmolarity increases, diuresis decreases", correct: false },
      { text: "Decrease vasa recta flow (Fvasa) — urine osmolarity increases, diuresis decreases", correct: false }
    ]
  }
];

let currentQuestions = null;
let currentQuestionIndex = 0;

function showQuestion(index) {
  if (!currentQuestions || index < 0 || index >= currentQuestions.length) return;
  mcqContainer.innerHTML = ''; // Clear previous content

  const q = currentQuestions[index];

  const h3 = document.createElement('h3');
  h3.textContent = `Question ${index + 1}`;
  mcqContainer.appendChild(h3);

  const p = document.createElement('p');
  p.className = 'mcq-question';
  p.textContent = q.question;
  mcqContainer.appendChild(p);

  const ul = document.createElement('ul');
  ul.className = 'mcq-options';
  q.options.forEach((option, i) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'question';
    input.value = i;
    label.appendChild(input);
    label.appendChild(document.createTextNode(option.text));
    li.appendChild(label);
    ul.appendChild(li);
  });
  mcqContainer.appendChild(ul);

  const button = document.createElement('button');
  button.textContent = 'Submit';
  button.id = 'submitMCQ';
  mcqContainer.appendChild(button);

  const feedback = document.createElement('p');
  feedback.id = 'mcqFeedback';
  mcqContainer.appendChild(feedback);

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
      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
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

function loadModule(moduleName) {
  // moduleName: 'knowledge' or 'interactive'
  if (moduleName === 'knowledge') {
    currentQuestions = knowledgeQuestions;
  } else if (moduleName === 'interactive') {
    currentQuestions = interactiveQuestions;
  } else {
    currentQuestions = null;
  }
  currentQuestionIndex = 0;
  if (currentQuestions && currentQuestions.length > 0) {
    showQuestion(0);
  } else {
    mcqContainer.innerHTML = '<p>Select a module to begin.</p>';
  }
}

// Initial prompt
mcqContainer.innerHTML = '<p>Select a module to begin.</p>';

// Wire buttons
const knowledgeBtn = document.getElementById('KnowledgeCheckButton');
const interactiveBtn = document.getElementById('interactiveLabButton');
if (knowledgeBtn) {
  knowledgeBtn.addEventListener('click', () => {
    loadModule('knowledge');
  });
}
if (interactiveBtn) {
  interactiveBtn.addEventListener('click', () => {
    loadModule('interactive');
  });
}

// Start with the first question
showQuestion(currentQuestionIndex);
