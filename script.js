const letterBoxes = document.querySelectorAll('.box');
const loadingIcon = document.querySelector('.loading');
const heading = document.querySelector('.navbar');
const ANSWER_LENGTH = 5;
const TOTAL_ROUNDS = 6;

async function init() {
    let currentGuess = "";
    let currentRow = 0;
    setLoading(true);
    let isLoading = true;
    let gameOver = false;

    //fetching word of the day 

    const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const resObj = await response.json();
    const wordOfTheDay = resObj.word.toUpperCase();
    const answerLetters = wordOfTheDay.split("");

    setLoading(false);
    isLoading = false;

    function addLetterToGuess(letter) {
        //update the buffer
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            //replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        //modify the div for the letter
        letterBoxes[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letterBoxes[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    async function submitGuess() {
        if (currentGuess.length != ANSWER_LENGTH) {
            alert("Enter full word to submit!")
            return;
        }

        setLoading(true);
        isLoading = true;
        const response = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await response.json();
        const isValidWord = resObj.validWord;

        isLoading = false;
        setLoading(false);

        if (!isValidWord) {
            flashInvalid();
            return;
        }

        //mark as correct, close or wrong

        const guessLetters = currentGuess.split("");
        const freqMap = makeFrequencyMap(answerLetters);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct if right letter at right spot
            if (guessLetters[i] === answerLetters[i]) {
                letterBoxes[currentRow * ANSWER_LENGTH + i].classList.add('correct');
                freqMap[guessLetters[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessLetters[i] === answerLetters[i]) {
                //already marked
            } else if (freqMap[guessLetters[i]] > 0) {
                letterBoxes[currentRow * ANSWER_LENGTH + i].classList.add('close');
                freqMap[guessLetters[i]]--;

            } else {
                letterBoxes[currentRow * ANSWER_LENGTH + i].classList.add('wrong');

            }
        }

        currentRow++;

        //win or lose conditions
        //lose when total rounds used up
        if (currentGuess === wordOfTheDay) {
            gameOver = true;
            alert(`You won! Congratulations.`)
            heading.classList.add('gameWon');
        } else if (currentRow == TOTAL_ROUNDS) {
            gameOver = true;
            alert(`You lose! The word was ${wordOfTheDay}`);
        }

        currentGuess = "";

    }


    function flashInvalid() {

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //convert the div back to original
            letterBoxes[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');
            //add the invalid class after div is clean
            setTimeout(() => {
                letterBoxes[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
            }, 10);
        }

    }

    document.addEventListener('keydown', function handleKeyPress(event) {
        if (gameOver) {
            alert("Game is over! Reload page to play again.")
            return;
        } else if (isLoading) {
            alert("Loading...kindly wait a few moments before typing!");
            return;
        }

        const action = event.key;
        if (action === 'Enter') {
            submitGuess();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetterToGuess(action.toUpperCase())
        } else {
            //do nothing 
        }

    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingIcon.classList.toggle('show', isLoading);
    //here if the loading icon has show, show will be removed
    //otherwise it will be added
}

function makeFrequencyMap(array) {
    const freq = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (freq[letter]) {
            freq[letter]++;
        } else {
            freq[letter] = 1;
        }
    }
    return freq;
}

init();