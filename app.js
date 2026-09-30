/* ============================================================
   ΚΡΥΠΤΟΛΕΞΟ — ΜΟΛΥΒΔΙΝΟΣ ΚΑΤΑΔΕΣΜΟΣ
   Κάστρο Καλλιθέας
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ------------------------------------------------------------
    // ΣΤΑΘΕΡΕΣ
    // ------------------------------------------------------------
    const ALPHABET_GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';
    const MAX_INCORRECT_GUESSES = 3;
    const INITIAL_RANDOM_REVEALS = 3;   // ← ΔΙΟΡΘΩΣΗ: από 10 → 3

    const PUZZLES = [
        {
            id: 1,
            title: "1. Ο Κατάδεσμος",
            phrase: "Ο κατάδεσμος είναι ένα αρχαίο μαγικό αντικείμενο, μια κατάρα που γράφτηκε με σκοπό να δεσμεύσει, να βλάψει ή να επηρεάσει αρνητικά ένα συγκεκριμένο πρόσωπο ή αντίπαλο.",
            image: "https://raw.githubusercontent.com/conchr/Virtual-Tour/main/17MolivdinoKapaki-Katadesmos.jpg",
            displayTitle: "Ο Κατάδεσμος"
        },
        {
            id: 2,
            title: "2. Μαγική Επίκληση",
            phrase: "Η πλάκα έφερε χαραγμένη μια μαγική επίκληση που απευθυνόταν σε θεότητες ή πνεύματα του Κάτω Κόσμου, ζητώντας τους να εκτελέσουν την κατάρα.",
            image: "https://raw.githubusercontent.com/conchr/Virtual-Tour/main/17MolivdinoKapaki-Katadesmos.jpg",
            displayTitle: "Μαγική Επίκληση"
        },
        {
            id: 3,
            title: "3. Τόπος Ταφής",
            phrase: "Μετά τη χάραξη, ο κατάδεσμος θάβονταν σε μέρη που πιστεύονταν ότι διευκόλυναν την επαφή με τις δυνάμεις του Κάτω Κόσμου, όπως τάφοι, πηγάδια ή ιερά.",
            image: "https://raw.githubusercontent.com/conchr/Virtual-Tour/main/17MolivdinoKapaki-Katadesmos.jpg",
            displayTitle: "Τόπος Ταφής"
        }
    ];

    // ------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------
    let gameState = {};
    let solvedPhrases = [];
    let introTimeouts = [];

    // ------------------------------------------------------------
    // DOM ELEMENTS
    // ------------------------------------------------------------
    const introPage = document.getElementById('intro-page');
    const gameContainer = document.getElementById('game-container');
    const phraseContainer = document.getElementById('hidden-phrase-container');
    const letterButtonsContainer = document.getElementById('letter-buttons');
    const incorrectGuessesSpan = document.getElementById('incorrect-guesses');
    const gameStatusElement = document.getElementById('game-status');
    const phaseIndicator = document.getElementById('phase-indicator');
    const currentPhaseText = document.getElementById('current-phase-text');
    const selectionDisplay = document.getElementById('selection-display');
    const selectedLetterText = document.getElementById('selected-letter-text');
    const gameModal = document.getElementById('game-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalButton = document.getElementById('modal-button');
    const revealPhraseBtn = document.getElementById('reveal-phrase-btn');
    const revealedPhrase = document.getElementById('revealed-phrase');
    const revealedPhraseText = revealedPhrase.querySelector('p');
    const continueButtons = document.getElementById('continue-buttons');
    const continueYes = document.getElementById('continue-yes');
    const continueNo = document.getElementById('continue-no');
    const finalButtons = document.getElementById('final-buttons');
    const finalYes = document.getElementById('final-yes');
    const finalNo = document.getElementById('final-no');
    const puzzleTitle = document.getElementById('puzzle-title');
    const solvedPhrasesContainer = document.getElementById('solved-phrases-container');
    const emptyPuzzleSpace = document.getElementById('empty-puzzle-space');
    const skipIntroButton = document.getElementById('skip-intro');

    // End page
    const endPage = document.getElementById('end-page');
    const endPhrasesContainer = document.getElementById('end-phrases-container');
    const endTitle1 = document.getElementById('end-title-1');
    const endSubtitleSmall1 = document.getElementById('end-subtitle-small-1');
    const endThankYou = document.getElementById('end-thank-you');
    const endPlayAgain = document.getElementById('end-play-again');
    const homePageEnd = document.getElementById('home-page-end');

    // Lose buttons
    const loseButtons = document.getElementById('lose-buttons');
    const playSameAgain = document.getElementById('play-same-again');
    const continueNext = document.getElementById('continue-next');
    const showEnd = document.getElementById('show-end');
    const homePageLose = document.getElementById('home-page-lose');

    // ------------------------------------------------------------
    // INTRO
    // ------------------------------------------------------------
    function startIntro() {
        const titles = [
            'intro-title-1',
            'intro-subtitle-small-1',
            'intro-title-2',
            'intro-title-3',
            'intro-title-4',
            'intro-title-5'
        ];

        let delay = 0;

        titles.forEach((titleId, index) => {
            introTimeouts.push(setTimeout(() => {
                const el = document.getElementById(titleId);
                if (el) el.classList.add('fade-in');
            }, delay));

            delay += 2500;

            if (index === titles.length - 1) {
                introTimeouts.push(setTimeout(() => {
                    introPage.classList.add('fade-out');
                    setTimeout(() => {
                        introPage.style.display = 'none';
                        gameContainer.classList.remove('hidden');
                        resetGame(0);
                    }, 1000);
                }, delay + 2000));
            }
        });
    }

    function skipIntro() {
        introTimeouts.forEach(t => clearTimeout(t));
        introPage.classList.add('fade-out');
        setTimeout(() => {
            introPage.style.display = 'none';
            gameContainer.classList.remove('hidden');
            resetGame(0);
        }, 500);
    }

    // ------------------------------------------------------------
    // UTILITIES
    // ------------------------------------------------------------
    function normalizeText(text) {
        const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalized.toUpperCase();
    }

    function getUniqueLetters(normalizedText) {
        const unique = new Set();
        for (const char of normalizedText) {
            if (ALPHABET_GREEK.includes(char)) {
                unique.add(char);
            }
        }
        return Array.from(unique).sort();
    }

    function addSolvedPhrase(phrase, title) {
        const div = document.createElement('div');
        div.className = 'solved-phrase';
        div.innerHTML = `
            <div class="solved-title">${title}</div>
            <div>${phrase}</div>
        `;
        solvedPhrasesContainer.appendChild(div);
        solvedPhrases.push({ title, phrase });
        return div;
    }

    function scrollToElement(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.pageYOffset;
        const middle = top - (window.innerHeight / 2) + (rect.height / 2);
        window.scrollTo({ top: middle, behavior: 'smooth' });
    }

    function collectPhraseAnimation() {
        return new Promise((resolve) => {
            const textContainer = document.getElementById('text-container');
            textContainer.classList.add('collecting');

            setTimeout(() => {
                textContainer.classList.remove('collecting');
                textContainer.classList.add('hidden');
                emptyPuzzleSpace.classList.remove('hidden');

                const currentPuzzle = PUZZLES[gameState.currentPuzzleIndex];
                const solvedElement = addSolvedPhrase(currentPuzzle.phrase, currentPuzzle.displayTitle);
                resolve(solvedElement);
            }, 1500);
        });
    }

    function countLetterOccurrences(letter) {
        let count = 0;
        for (let i = 0; i < gameState.normalizedMessage.length; i++) {
            if (gameState.normalizedMessage[i] === letter) count++;
        }
        return count;
    }

    function countRevealedOccurrences(letter) {
        let count = 0;
        for (let i = 0; i < gameState.hiddenPhrase.length; i++) {
            if (gameState.normalizedMessage[i] === letter && gameState.hiddenPhrase[i] !== '_') {
                count++;
            }
        }
        return count;
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // ------------------------------------------------------------
    // RANDOM LETTER REVEAL
    // ------------------------------------------------------------
    function revealRandomLetters(count = INITIAL_RANDOM_REVEALS) {
        const emptyPositions = [];
        for (let i = 0; i < gameState.hiddenPhrase.length; i++) {
            if (gameState.hiddenPhrase[i] === '_' && ALPHABET_GREEK.includes(gameState.normalizedMessage[i])) {
                emptyPositions.push(i);
            }
        }

        const positionsToReveal = emptyPositions.length <= count
            ? emptyPositions
            : shuffleArray(emptyPositions).slice(0, count);

        const newHiddenPhrase = gameState.hiddenPhrase.split('');
        positionsToReveal.forEach(position => {
            newHiddenPhrase[position] = gameState.normalizedMessage[position];
        });
        gameState.hiddenPhrase = newHiddenPhrase.join('');

        const revealedLetters = new Set();
        positionsToReveal.forEach(position => {
            revealedLetters.add(gameState.normalizedMessage[position]);
        });

        revealedLetters.forEach(letter => {
            const total = countLetterOccurrences(letter);
            const revealed = countRevealedOccurrences(letter);
            if (total === revealed) {
                const idx = gameState.wordsToGuess.indexOf(letter);
                if (idx > -1) gameState.wordsToGuess.splice(idx, 1);
                gameState.correctGuesses.add(letter);
            }
        });
    }

    // ------------------------------------------------------------
    // END PAGE
    // ------------------------------------------------------------
    function showEndPage() {
        gameContainer.classList.add('hidden');
        gameModal.classList.add('hidden');
        endPage.classList.remove('hidden');
        endPage.style.display = 'flex';
        endPage.style.opacity = '1';

        endPhrasesContainer.innerHTML = '';

        endTitle1.classList.remove('fade-in');
        endSubtitleSmall1.classList.remove('fade-in');
        setTimeout(() => {
            endTitle1.classList.add('fade-in');
            endSubtitleSmall1.classList.add('fade-in');
        }, 100);

        let delay = 800;
        solvedPhrases.forEach((solved) => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'end-page-phrase';
                div.style.opacity = '0';
                div.innerHTML = `
                    <div class="end-page-title">${solved.title}</div>
                    <div class="end-page-content">${solved.phrase}</div>
                `;
                endPhrasesContainer.appendChild(div);

                setTimeout(() => {
                    div.style.transition = 'opacity 1s ease-in-out';
                    div.style.opacity = '1';
                }, 50);
            }, delay);
            delay += 800;
        });

        setTimeout(() => {
            endThankYou.style.opacity = '0';
            endThankYou.classList.remove('fade-in');
            setTimeout(() => {
                endThankYou.classList.add('fade-in');
            }, 100);
        }, delay + 300);
    }

    // ------------------------------------------------------------
    // RENDER PHRASE
    // ------------------------------------------------------------
    function renderPhrase() {
        phraseContainer.innerHTML = '';
        const hiddenChars = gameState.hiddenPhrase.split('');

        let currentWord = [];
        const words = [];

        for (let i = 0; i < gameState.normalizedMessage.length; i++) {
            const char = gameState.rawMessage[i];
            const normalizedChar = gameState.normalizedMessage[i];
            const hiddenChar = hiddenChars[i];

            if (char === ' ') {
                if (currentWord.length > 0) {
                    words.push(currentWord);
                    currentWord = [];
                }
                words.push([{ type: 'space', char: char, index: i }]);
            } else {
                currentWord.push({
                    type: ALPHABET_GREEK.includes(normalizedChar) ? 'letter' : 'punctuation',
                    char: char,
                    normalizedChar: normalizedChar,
                    hiddenChar: hiddenChar,
                    index: i
                });
            }
        }
        if (currentWord.length > 0) words.push(currentWord);

        words.forEach((word, wordIdx) => {
            if (word[0].type === 'space') {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'space-char';
                spaceSpan.textContent = ' ';
                phraseContainer.appendChild(spaceSpan);
            } else {
                const wordGroup = document.createElement('span');
                wordGroup.className = 'no-word-break';

                word.forEach(item => {
                    const span = document.createElement('span');
                    span.classList.add('phrase-char');
                    span.dataset.index = item.index;

                    if (item.type === 'letter') {
                        if (item.hiddenChar === '_') {
                            span.textContent = '_';
                            span.classList.add('phrase-dash');
                            if (gameState.phase === 'main_game' && gameState.selectedLetter) {
                                span.onclick = () => handlePositionSelection(item.index);
                            } else {
                                span.onclick = null;
                            }
                        } else {
                            span.textContent = item.char;
                            span.style.color = 'var(--gold-light)';
                            span.style.fontWeight = '700';
                            span.classList.remove('phrase-dash');
                            span.onclick = null;
                        }
                    } else {
                        span.textContent = item.char;
                        span.style.color = 'var(--text-muted)';
                        span.onclick = null;
                    }

                    wordGroup.appendChild(span);
                });

                phraseContainer.appendChild(wordGroup);

                const nextWord = words[wordIdx + 1];
                if (nextWord && nextWord[0].type !== 'space') {
                    const smallSpace = document.createElement('span');
                    smallSpace.className = 'space-char';
                    smallSpace.style.minWidth = '0.5em';
                    phraseContainer.appendChild(smallSpace);
                }
            }
        });
    }

    // ------------------------------------------------------------
    // RENDER LETTERS
    // ------------------------------------------------------------
    function renderLetters() {
        letterButtonsContainer.innerHTML = '';

        gameState.allUniqueLetters.forEach(letter => {
            const button = document.createElement('button');
            button.classList.add('letter-button');
            button.textContent = letter;

            if (!gameState.gameActive) {
                button.disabled = true;
                if (gameState.correctGuesses.has(letter)) {
                    button.classList.add('btn-used-correct');
                } else {
                    button.classList.add('btn-used-wrong');
                }
            } else if (gameState.correctGuesses.has(letter)) {
                button.disabled = true;
                button.classList.add('btn-used-correct');
            } else if (gameState.wronglyPlacedLetters.has(letter)) {
                button.disabled = false;
                button.classList.add('btn-used-wrong-active');
                button.onclick = () => handleGuess(letter);
            } else if (gameState.phase === 'main_game' && gameState.selectedLetter === letter) {
                button.disabled = true;
                button.classList.add('btn-selected');
            } else {
                button.disabled = false;
                button.classList.add('btn-available');
                button.onclick = () => handleGuess(letter);
            }

            letterButtonsContainer.appendChild(button);
        });
    }

    // ------------------------------------------------------------
    // RENDER PHASE / SELECTION
    // ------------------------------------------------------------
    function renderPhaseAndSelection() {
        phaseIndicator.classList.remove('hidden');

        if (gameState.phase === 'initial_reveal') {
            currentPhaseText.textContent = `Αρχική Αποκάλυψη. Επιλέξτε ${gameState.initialRevealsLeft} γράμματα. (Δεν μετρούν ως λάθη)`;
            phaseIndicator.style.borderLeftColor = 'var(--blue)';
            phaseIndicator.style.background = 'linear-gradient(135deg, var(--blue-soft), rgba(22, 27, 46, 0.55))';

            selectionDisplay.classList.remove('visible');
            selectionDisplay.classList.add('invisible');
        } else {
            currentPhaseText.textContent = 'Κύρια Φάση Παιχνιδιού. Επιλέξτε γράμμα και θέση.';
            phaseIndicator.style.borderLeftColor = 'var(--amber)';
            phaseIndicator.style.background = 'linear-gradient(135deg, var(--amber-soft), rgba(22, 27, 46, 0.55))';

            if (gameState.selectedLetter) {
                selectionDisplay.classList.remove('invisible');
                selectionDisplay.classList.add('visible');
                selectedLetterText.textContent = gameState.selectedLetter;
            } else {
                selectionDisplay.classList.remove('visible');
                selectionDisplay.classList.add('invisible');
                selectedLetterText.textContent = 'Κανένα';
            }
        }
    }

    // ------------------------------------------------------------
    // RENDER STATUS
    // ------------------------------------------------------------
    function renderStatus() {
        incorrectGuessesSpan.textContent = gameState.incorrectGuesses;

        gameStatusElement.classList.remove('text-blue-600', 'text-red-600', 'text-green-600');

        if (!gameState.gameActive) {
            gameStatusElement.textContent = gameState.wordsToGuess.length === 0 ? 'Νίκη!' : 'Ήττα!';
            gameStatusElement.classList.add(gameState.wordsToGuess.length === 0 ? 'text-green-600' : 'text-red-600');
        } else if (gameState.incorrectGuesses > 0) {
            gameStatusElement.textContent = 'Προσοχή...';
            gameStatusElement.classList.add('text-red-600');
        } else {
            gameStatusElement.textContent = 'Παίζεις...';
            gameStatusElement.classList.add('text-blue-600');
        }
    }

    // ------------------------------------------------------------
    // SHOW MODAL
    // ------------------------------------------------------------
    function showModal(isWin) {
        revealPhraseBtn.classList.add('hidden');
        revealedPhrase.classList.add('hidden');
        continueButtons.classList.add('hidden');
        finalButtons.classList.add('hidden');
        loseButtons.classList.add('hidden');
        modalButton.classList.add('hidden');

        if (isWin) {
            modalTitle.textContent = 'Συγχαρητήρια! Νίκη!';
            modalMessage.textContent = 'Αποκρυπτογράφησες επιτυχώς τη φράση!';

            if (gameState.currentPuzzleIndex < 2) {
                setTimeout(() => {
                    gameModal.classList.remove('hidden');
                    gameModal.classList.add('flex');
                    continueButtons.classList.remove('hidden');
                }, 2000);   // ← ΔΙΟΡΘΩΣΗ: από 3000 → 2000
            } else if (gameState.currentPuzzleIndex === 2) {
                setTimeout(() => {
                    gameModal.classList.remove('hidden');
                    gameModal.classList.add('flex');
                    setTimeout(() => {
                        gameModal.classList.add('hidden');
                        showEndPage();
                    }, 3000);
                }, 1000);
            } else {
                modalMessage.textContent += ' Ολοκλήρωσες όλα τα κρυπτόλεξα!';
                modalButton.classList.remove('hidden');
                modalButton.textContent = 'Παίξε Ξανά';
                modalButton.onclick = () => resetGame(0);
                gameModal.classList.remove('hidden');
                gameModal.classList.add('flex');
            }
        } else {
            modalTitle.textContent = 'Τέλος Παιχνιδιού! Ήττα!';
            modalMessage.textContent = `Ξεπέρασες τα ${MAX_INCORRECT_GUESSES} λάθη.`;
            revealPhraseBtn.classList.remove('hidden');
            loseButtons.classList.remove('hidden');
            gameModal.classList.remove('hidden');
            gameModal.classList.add('flex');
        }
    }

    // ------------------------------------------------------------
    // GAME LOGIC
    // ------------------------------------------------------------
    function revealLetter(letter) {
        let newHiddenPhrase = '';
        let wordsToGuessUpdated = false;
        const newWordsToGuess = [...gameState.wordsToGuess];

        for (let i = 0; i < gameState.normalizedMessage.length; i++) {
            const char = gameState.normalizedMessage[i];
            const hiddenChar = gameState.hiddenPhrase[i];

            if (char === letter) {
                newHiddenPhrase += char;
            } else {
                newHiddenPhrase += hiddenChar;
            }
        }

        const idx = newWordsToGuess.indexOf(letter);
        if (idx > -1) {
            newWordsToGuess.splice(idx, 1);
            wordsToGuessUpdated = true;
        }

        gameState.hiddenPhrase = newHiddenPhrase;
        gameState.wordsToGuess = newWordsToGuess;
        gameState.guessedLetters.add(letter);
        gameState.correctGuesses.add(letter);
        gameState.wronglyPlacedLetters.delete(letter);

        return wordsToGuessUpdated;
    }

    function handleGuess(letter) {
        if (!gameState.gameActive || gameState.guessedLetters.has(letter)) return;

        if (gameState.phase === 'initial_reveal') {
            handleInitialRevealGuess(letter);
        } else if (gameState.phase === 'main_game') {
            handleMainGameLetterSelection(letter);
        }
        renderPhrase();
    }

    function handleInitialRevealGuess(letter) {
        if (gameState.initialRevealsLeft <= 0) return;

        revealLetter(letter);
        gameState.initialRevealsLeft--;

        renderLetters();
        renderPhaseAndSelection();

        if (gameState.initialRevealsLeft === 0) {
            gameState.phase = 'main_game';
            checkGameStatus();
            renderPhaseAndSelection();
        }
    }

    function handleMainGameLetterSelection(letter) {
        if (gameState.selectedLetter === letter) {
            gameState.selectedLetter = null;
        } else {
            gameState.selectedLetter = letter;
        }
        renderLetters();
        renderPhaseAndSelection();
        renderPhrase();
    }

    function handlePositionSelection(index) {
        if (!gameState.gameActive || gameState.phase !== 'main_game' || !gameState.selectedLetter) return;

        const guessedLetter = gameState.selectedLetter;
        const actualLetter = gameState.normalizedMessage[index];

        if (guessedLetter === actualLetter) {
            revealLetter(guessedLetter);
        } else {
            gameState.incorrectGuesses++;
            gameState.wronglyPlacedLetters.add(guessedLetter);
        }

        gameState.selectedLetter = null;

        checkGameStatus();
        renderPhrase();
        renderLetters();
        renderStatus();
        renderPhaseAndSelection();
    }

    async function checkGameStatus() {
        // Lose
        if (gameState.incorrectGuesses >= MAX_INCORRECT_GUESSES) {
            gameState.gameActive = false;
            renderPhrase();
            setTimeout(() => showModal(false), 500);
            return;
        }

        // Win
        if (gameState.wordsToGuess.length === 0) {
            gameState.gameActive = false;

            const solvedElement = await collectPhraseAnimation();

            setTimeout(() => {
                scrollToElement(solvedElement);

                setTimeout(() => {
                    showModal(true);
                }, 500);
            }, 300);
        }
    }

    function resetGame(puzzleIndex = 0) {
        const currentPuzzle = PUZZLES[puzzleIndex];

        const normalizedMessage = normalizeText(currentPuzzle.phrase);
        const allUniqueLetters = getUniqueLetters(normalizedMessage);

        let initialHidden = '';
        for (let i = 0; i < normalizedMessage.length; i++) {
            const char = normalizedMessage[i];
            if (ALPHABET_GREEK.includes(char)) {
                initialHidden += '_';
            } else {
                initialHidden += currentPuzzle.phrase[i];
            }
        }

        const lettersToGuess = allUniqueLetters;

        gameState = {
            rawMessage: currentPuzzle.phrase,
            normalizedMessage: normalizedMessage,
            hiddenPhrase: initialHidden,
            allUniqueLetters: allUniqueLetters,
            wordsToGuess: lettersToGuess,
            guessedLetters: new Set(),
            correctGuesses: new Set(),
            wronglyPlacedLetters: new Set(),
            incorrectGuesses: 0,
            gameActive: true,
            currentPuzzleIndex: puzzleIndex,
            phase: 'initial_reveal',
            initialRevealsLeft: 5,
            selectedLetter: null,
        };

        revealRandomLetters(INITIAL_RANDOM_REVEALS);

        // ← ΔΙΟΡΘΩΣΗ: displayTitle αντί title
        puzzleTitle.textContent = currentPuzzle.displayTitle;

        const textContainer = document.getElementById('text-container');
        textContainer.classList.remove('hidden');
        emptyPuzzleSpace.classList.add('hidden');

        gameModal.classList.add('hidden');
        revealPhraseBtn.classList.add('hidden');
        revealedPhrase.classList.add('hidden');
        continueButtons.classList.add('hidden');
        finalButtons.classList.add('hidden');
        loseButtons.classList.add('hidden');
        modalButton.classList.add('hidden');

        endPage.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        renderPhrase();
        renderLetters();
        renderStatus();
        renderPhaseAndSelection();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ------------------------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------------------------
    skipIntroButton.onclick = skipIntro;

    modalButton.onclick = () => resetGame(0);

    revealPhraseBtn.onclick = () => {
        revealedPhraseText.textContent = gameState.rawMessage;
        revealedPhrase.classList.remove('hidden');
        revealPhraseBtn.classList.add('hidden');
    };

    continueYes.onclick = () => {
        const nextPuzzleIndex = gameState.currentPuzzleIndex + 1;
        if (nextPuzzleIndex < PUZZLES.length) {
            resetGame(nextPuzzleIndex);
        }
    };

    continueNo.onclick = () => {
        window.location.href = "https://conchr.github.io/Games/";
    };

    finalYes.onclick = () => {
        alert('Σύντομα νέα κρυπτόλεξα με διαφορετικό θέμα!');
        resetGame(0);
    };

    finalNo.onclick = () => {
        window.location.href = "https://conchr.github.io/Games/";
    };

    playSameAgain.onclick = () => {
        resetGame(gameState.currentPuzzleIndex);
    };

    continueNext.onclick = () => {
        const nextPuzzleIndex = gameState.currentPuzzleIndex + 1;
        if (nextPuzzleIndex < PUZZLES.length) {
            resetGame(nextPuzzleIndex);
        } else {
            showEndPage();
        }
    };

    showEnd.onclick = () => {
        showEndPage();
    };

    homePageLose.onclick = () => {
        window.location.href = "https://conchr.github.io/Games/";
    };

    endPlayAgain.onclick = () => {
        solvedPhrases = [];
        solvedPhrasesContainer.innerHTML = '';
        resetGame(0);
    };

    homePageEnd.onclick = () => {
        window.location.href = "https://conchr.github.io/Games/";
    };

    // ------------------------------------------------------------
    // ESCAPE KEY
    // ------------------------------------------------------------
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;

        // Αν το modal είναι ανοιχτό, μην κάνεις τίποτα
        if (!gameModal.classList.contains('hidden')) {
            return;
        }

        // Αν είναι στο intro, μην κάνεις τίποτα
        if (!introPage.classList.contains('fade-out') && introPage.style.display !== 'none') {
            return;
        }
    });

    // ------------------------------------------------------------
    // INIT
    // ------------------------------------------------------------
    startIntro();
});