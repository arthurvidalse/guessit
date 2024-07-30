import { testDictionary, realDictionary } from './dictionary.js';

// Para fins de teste, use o dicionário de teste
console.log('test dictionary:', testDictionary);

const dictionary = realDictionary;
let secretWord = '';
const wordLength = 5;
const state = {
  secret: '',
  grid: Array(6).fill().map(() => Array(wordLength).fill('')),
  currentRow: 0,
  currentCol: 0,
  isGameOver: false
};

function initializeGame() {
  secretWord = dictionary[Math.floor(Math.random() * dictionary.length)];
  state.secret = secretWord;
  state.grid = Array(6).fill().map(() => Array(wordLength).fill(''));
  state.currentRow = 0;
  state.currentCol = 0;
  state.isGameOver = false;

  const gameContainer = document.getElementById('game');
  gameContainer.innerHTML = ''; // Limpa o conteúdo do container do jogo
  drawGrid(gameContainer);
  registerKeyboardEvents();
}

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

function drawBox(container, row, col, letter = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letter;
  box.id = `box${row}${col}`;
  container.appendChild(box);
  return box;
}

function updateGrid() {
  for (let i = 0; i < state.grid.length; i++) {
    for (let j = 0; j < state.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = state.grid[i][j];
    }
  }
}

function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    if (state.isGameOver) return;

    const key = e.key;
    if (key === 'Enter') {
      if (state.currentCol === wordLength) {
        const word = getCurrentWord();
        if (isWordValid(word)) {
          revealWord(word);
          state.currentRow++;
          state.currentCol = 0;
          if (word === state.secret || state.currentRow >= 6) {
            state.isGameOver = true;
            setTimeout(() => {
              if (word === state.secret) {
                alertCongratulations();
              } else {
                alertGameOver(state.secret);
              }
              returnToMenu();
            }, 100);
          }
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
  return dictionary.includes(word.toLowerCase());
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
  const animation_duration = 500; // ms

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
}

function isLetter(key) {
  return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
  if (state.currentCol === wordLength) return;
  state.grid[state.currentRow][state.currentCol] = letter.toUpperCase();
  state.currentCol++;
}

function removeLetter() {
  if (state.currentCol === 0) return;
  state.currentCol--;
  state.grid[state.currentRow][state.currentCol] = '';
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

function returnToMenu() {
  document.querySelector('.title').style.display = 'block';
  document.querySelector('.menu').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
}

function startGame(mode) {
  document.querySelector('.title').style.display = 'none';
  document.querySelector('.menu').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  initializeGame();
}

document.getElementById('mode1x1').addEventListener('click', () => {
  startGame('1x1');
});

document.getElementById('modeCasual').addEventListener('click', () => {
  startGame('Casual');
});

document.getElementById('modeCreate').addEventListener('click', () => {
  alert('Criar Sala ainda não implementado.');
});

function startup() {
  const menu = document.querySelector('.menu');
  menu.style.display = 'flex';
  document.getElementById('game').style.display = 'none';
}

startup();
