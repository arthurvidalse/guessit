import { testDictionary, realDictionary } from './dictionary.js';

console.log('test dictionary:', testDictionary);

const dictionary = realDictionary;
const secretWord = dictionary[Math.floor(Math.random() * dictionary.length)];
const wordLength = secretWord.length;

const state = {
  secret: secretWord,
  grid: Array(6)
    .fill()
    .map(() => Array(wordLength).fill('')),
  currentRow: 0,
  currentCol: 0,
};

function drawGrid(container) {
  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.gridTemplateColumns = `repeat(${wordLength}, auto)`;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < wordLength; j++) {
      drawBox(grid, i, j);
    }
  }

  container.appendChild(grid);
}

function updateGrid() {
  for (let i = 0; i < state.grid.length; i++) {
    for (let j = 0; j < state.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = state.grid[i][j];
    }
  }
}

function drawBox(container, row, col, letter = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letter;
  box.id = `box${row}${col}`;

  container.appendChild(box);
  return box;
}

function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    const key = e.key;
    if (key === 'Enter') {
      if (state.currentCol === wordLength) {
        const word = getCurrentWord();
        if (isWordValid(word)) {
          revealWord(word);
          state.currentRow++;
          state.currentCol = 0;
        } else {
          alertInvalidWord();
        }
      }
    }
    if (key === 'Backspace') {
      removeLetter();
    }
    if (isLetter(key)) {
      addLetter(key);
    }

    updateGrid();
  };
}

function getCurrentWord() {
  return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isWordValid(word) {
  return true; 
}

function getNumOfOccurrencesInWord(word, letter) {
  let result = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function getPositionOfOccurrence(word, letter, position) {
  let result = 0;
  for (let i = 0; i <= position; i++) {
    if (word[i] === letter) {
      result++;
    }
  }
  return result;
}

function revealWord(guess) {
  const row = state.currentRow;
  const animation_duration = 500; 

  for (let i = 0; i < wordLength; i++) {
    const box = document.getElementById(`box${row}${i}`);
    const letter = box.textContent;
    const numOfOccurrencesSecret = getNumOfOccurrencesInWord(state.secret, letter);
    const numOfOccurrencesGuess = getNumOfOccurrencesInWord(guess, letter);
    const letterPosition = getPositionOfOccurrence(guess, letter, i);

    setTimeout(() => {
      if (numOfOccurrencesGuess > numOfOccurrencesSecret && letterPosition > numOfOccurrencesSecret) {
        box.classList.add('empty');
      } else {
        if (letter === state.secret[i]) {
          box.classList.add('right');
        } else if (state.secret.includes(letter)) {
          box.classList.add('wrong');
        } else {
          box.classList.add('empty');
        }
      }
    }, ((i + 1) * animation_duration) / 2);

    box.classList.add('animated');
    box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
  }

  const isWinner = state.secret === guess;
  const isGameOver = state.currentRow === 5;

  setTimeout(() => {
    if (isWinner) {
      alertCongratulations();
    } else if (isGameOver) {
      alertGameOver(state.secret);
    }
  }, 3 * animation_duration);
}

function isLetter(key) {
  return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
  if (state.currentCol === wordLength) return;
  state.grid[state.currentRow][state.currentCol] = letter;
  state.currentCol++;
}

function removeLetter() {
  if (state.currentCol === 0) return;
  state.grid[state.currentRow][state.currentCol - 1] = '';
  state.currentCol--;
}

function showAlert(type, message) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const toastContent = document.createElement('div');
  toastContent.className = 'toast-content';

  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-solid fa-check check' : 'fas fa-solid fa-exclamation check';
  toastContent.appendChild(icon);

  const msg = document.createElement('div');
  msg.className = 'message';
  const text1 = document.createElement('span');
  text1.className = 'text text-1';
  text1.textContent = type === 'success' ? 'Sucesso' : 'Errado';
  const text2 = document.createElement('span');
  text2.className = 'text text-2';
  text2.textContent = message;
  msg.appendChild(text1);
  msg.appendChild(text2);
  toastContent.appendChild(msg);

  const closeIcon = document.createElement('i');
  closeIcon.className = 'fa-solid fa-xmark close';
  closeIcon.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  });

  toast.appendChild(toastContent);
  toast.appendChild(closeIcon);

  const progress = document.createElement('div');
  progress.className = 'progress';
  toast.appendChild(progress);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('active');
    progress.classList.add('active');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);
}

function alertInvalidWord() {
  showAlert('error', 'Palavra Inválida.');
}

function alertCongratulations() {
  showAlert('success', 'Você acertou!');
}

function alertGameOver(secretWord) {
  showAlert('error', `Suas tentativas acabaram! A palavra era ${secretWord}.`);
}

function startup() {
  const game = document.getElementById('game');
  drawGrid(game);
  registerKeyboardEvents();
}

startup();
