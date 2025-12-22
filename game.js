// --- Core Game State and Data ---
const gameState = {
    // Player identity
    playerCharacter: null, // e.g., 'knight'
    playerName: 'Player',
    carouselIndex: 0, // Index for the character carousel

    // Game progression
    currentScene: 'character_select',
    currentPuzzleIndex: 0, // Track which puzzle in the sequence the player is on

    // Puzzle completion flags
    chessPuzzleComplete: false,
    starcraftPuzzleComplete: false,
    yugiohPuzzleComplete: false,
    mtgPuzzleComplete: false, // <-- NEW FLAG
    vgcComplete: false, // <-- NEW FLAG
    diablo2Complete: false, // <-- NEW FLAG
    starwarsComplete: false, // <-- NEW FLAG
    marioComplete: false, // <-- NEW FLAG
    // Final outcome
    joinedParty: false,
};

const characters = {
    boss: {
        name: 'Boss', //rogue
        sprite: 'rogues.png',
        puzzles: ['chess', 'starwars'], // Array of puzzles in sequence
        // The pixel offsets (32px * column, 32px * row)
        offset: { x: -32 * 3, y: 0 },
    },
    flash: {
        name: 'Flash', // crusader
        sprite: 'rogues.png',
        puzzles: ['starcraft', 'diablo2'], // Array of puzzles in sequence
        // Character is in the 2nd column (index 1)
        offset: { x: -32, y: -32 * 3 },
    },
    dizzle: {
        name: 'Dizzle', // priest
        sprite: 'rogues.png',
        puzzles: ['yugioh', 'pokemon'], // Array of puzzles in sequence
        offset: { x: -32 * 2, y: -32 * 2 },
    },
    davis: {
        name: 'Davis', // bard
        sprite: 'rogues.png',
        puzzles: ['pokemon'], // Array of puzzles in sequence
        offset: { x: -32 * 4, y: -32 * 4 },
    },
    scabs: {
        name: 'Scabs', // ranger?
        sprite: 'rogues.png',
        puzzles: ['mtg'], // Array of puzzles in sequence
        offset: { x: -32 * 2, y: -32 * 3 },
    },
    monty: {
        name: 'Monty', // mage
        sprite: 'rogues.png',
        puzzles: ['mario'], // Array of puzzles in sequence
        offset: { x: 0, y: -32 * 4 },
    },
    // Add more characters here using their correct (negative) offsets
};

// DOM Element references
const gameTextEl = document.getElementById('game-text');
const choiceContainerEl = document.getElementById('choice-container');
const carouselChoiceContainerEl = document.getElementById('carousel-choice-container');
const playerSpriteEl = document.querySelector('#player-sprite-container');
const partyLeaderSpriteEl = document.querySelector('#party-leader-sprite-container');
const puzzleImageEl = document.getElementById('puzzle-image');
const restartButton = document.getElementById('restart-button');

// --- NEW: Carousel-specific DOM Elements ---
const carouselEl = document.getElementById('character-carousel');

function renderScene() {
    // Clear old choices
    choiceContainerEl.innerHTML = '';
    carouselChoiceContainerEl.innerHTML = '';

    // Hide party leader sprite by default
    partyLeaderSpriteEl.style.display = 'none';
    puzzleImageEl.style.display = 'none';

    // Show/Hide the carousel container based on the scene
    carouselEl.style.display = gameState.currentScene === 'character_select' ? 'flex' : 'none';

    // Update character sprite visibility
    if (gameState.playerCharacter && gameState.currentScene !== 'character_select') {
        const charData = characters[gameState.playerCharacter];
        playerSpriteEl.style.display = 'block';
        playerSpriteEl.style.backgroundImage = `url('${charData.sprite}')`;
        playerSpriteEl.style.backgroundPosition = `${charData.offset.x}px ${charData.offset.y}px`;
    } else {
        playerSpriteEl.style.display = 'none';
    }

    // --- Restart Button Visibility Logic ---
    if (gameState.currentScene !== 'character_select' && gameState.currentScene !== 'game_over') {
        restartButton.style.display = 'block';
    } else {
        restartButton.style.display = 'none';
    }

    // Determine which scene function to call
    switch (gameState.currentScene) {
        case 'character_select':
            return renderCharacterSelect();
        case 'forest_entrance':
            return renderForestEntrance();
        case 'puzzle_gate':
            return renderPuzzleGate();
        case 'party_invite':
            return renderPartyInvite();
        case 'game_over':
            return renderGameOver();
        default:
            gameTextEl.innerHTML = 'ERROR: Unknown Scene.';
    }
}

function renderCharacterSelect() {
    gameTextEl.innerHTML = 'A mysterious voice whispers: <strong>Choose your champion</strong>.';
    carouselChoiceContainerEl.innerHTML = ''; // Clear the carousel button container

    // --- Carousel Rendering Logic ---
    const characterKeys = Object.keys(characters);
    const totalChars = characterKeys.length;

    // Ensure carouselIndex is always valid
    gameState.carouselIndex = (gameState.carouselIndex + totalChars) % totalChars;

    // Get the keys for the previous, current, and next characters
    const prevIndex = (gameState.carouselIndex - 1 + totalChars) % totalChars;
    const currentIndex = gameState.carouselIndex;
    const nextIndex = (gameState.carouselIndex + 1) % totalChars;

    const prevCharKey = characterKeys[prevIndex];
    const currentCharKey = characterKeys[currentIndex];
    const nextCharKey = characterKeys[nextIndex];

    // Find the carousel slots container
    const slotsContainer = document.getElementById('carousel-slots');
    slotsContainer.innerHTML = ''; // Clear previous slots

    // Create and append the character slots
    [prevCharKey, currentCharKey, nextCharKey].forEach((charKey, index) => {
        const charData = characters[charKey];
        const slot = document.createElement('div');
        slot.className = 'carousel-slot';

        // The middle character is the "active" one
        if (index === 1) {
            slot.classList.add('active');
        }

        // Create the sprite container
        const sprite = document.createElement('div');
        sprite.className = 'sprite-container'; // Use the existing sprite styling
        sprite.style.backgroundImage = `url('${charData.sprite}')`;
        // The background-size is now the natural size of the sheet, so we don't multiply the offset
        sprite.style.backgroundPosition = `${charData.offset.x}px ${charData.offset.y}px`;

        // Create the character name
        const name = document.createElement('p');
        name.className = 'carousel-char-name';
        name.innerText = charData.name;

        slot.appendChild(sprite);
        slot.appendChild(name);
        slotsContainer.appendChild(slot);
    });

    // --- Create the 'Select' Button ---
    // Clear the main choice container and add the select button
    const selectButton = document.createElement('button');
    selectButton.innerText = `Select ${characters[currentCharKey].name}`;
    selectButton.onclick = () => handleCharacterSelect(currentCharKey);
    carouselChoiceContainerEl.appendChild(selectButton);
}

function handleCarouselNav(direction) {
    if (direction === 'next') {
        gameState.carouselIndex++;
    } else {
        gameState.carouselIndex--;
    }
    renderCharacterSelect(); // Re-render the carousel with the new index
}

function handleCharacterSelect(charKey) {
    gameState.playerCharacter = charKey;
    gameState.currentScene = 'forest_entrance';
    renderScene();
}

function renderForestEntrance() {
    const charName = characters[gameState.playerCharacter].name;
    gameTextEl.innerHTML = `<strong>${charName}</strong>, you stand at the edge of the Whispering Woods. To proceed, you must pass the Trial of the Old Path.`;

    const button = document.createElement('button');
    button.innerText = 'Step onto the Old Path';
    button.onclick = () => {
        gameState.currentScene = 'puzzle_gate';
        renderScene();
    };
    choiceContainerEl.appendChild(button);
}

// Helper function to complete current puzzle and move to next
function completePuzzle(puzzleType) {
    // Mark the specific puzzle as complete
    const completionFlags = {
        chess: 'chessPuzzleComplete',
        starcraft: 'starcraftPuzzleComplete',
        yugioh: 'yugiohPuzzleComplete',
        mtg: 'mtgPuzzleComplete',
        pokemon: 'vgcComplete',
        diablo2: 'diablo2Complete',
        starwars: 'starwarsComplete',
        mario: 'marioComplete',
    };

    if (completionFlags[puzzleType]) {
        gameState[completionFlags[puzzleType]] = true;
    }

    // Advance to next puzzle
    gameState.currentPuzzleIndex++;
    gameState.currentScene = 'puzzle_gate';
    renderScene();
}

function renderPuzzleGate() {
    const charData = characters[gameState.playerCharacter];
    const puzzles = charData.puzzles;
    const currentIndex = gameState.currentPuzzleIndex;

    // Check if all puzzles are complete
    if (currentIndex >= puzzles.length) {
        gameState.currentScene = 'party_invite';
        return renderScene();
    }

    // Get the current puzzle type
    const puzzleType = puzzles[currentIndex];

    // Render the appropriate puzzle based on type
    const puzzleRenderers = {
        chess: renderChessPuzzle,
        starcraft: renderStarcraftPuzzle,
        yugioh: renderYugiohPuzzle,
        mtg: renderMtgPuzzle,
        pokemon: renderPokemonPuzzle,
        diablo2: renderDiablo2Puzzle,
        starwars: renderStarWarsPuzzle,
        mario: renderMarioPuzzle,
    };

    if (puzzleRenderers[puzzleType]) {
        return puzzleRenderers[puzzleType]();
    }

    // Fallback if no specific puzzle is defined
    gameTextEl.innerHTML = 'The gate opens! Moving to the party invite.';
    gameState.currentScene = 'party_invite';
    renderScene();
}

// Function to hide the puzzle image when not needed
function hidePuzzleImage() {
    document.getElementById('puzzle-image').style.display = 'none';
}

function renderChessPuzzle() {
    // 1. Display the puzzle image
    const puzzleImageEl = document.getElementById('puzzle-image');
    puzzleImageEl.src = 'mateinone.webp'; // Make sure this file exists!
    puzzleImageEl.style.display = 'block';

    // 2. Set the scenario text
    gameTextEl.innerHTML =
        'You find an ancient stone slab engraved with a chessboard. <br><strong>White to move and deliver checkmate in one.</strong><br>Carve your move to proceed.';

    // Clear old choices
    choiceContainerEl.innerHTML = '';

    // Create input field for chess move
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';

    const moveInput = document.createElement('input');
    moveInput.type = 'text';
    moveInput.id = 'chess-move-input';
    moveInput.placeholder = 'Enter move (e.g., Ba1)';
    moveInput.style.padding = '10px';
    moveInput.style.fontSize = '1em';
    moveInput.style.flex = '1';
    moveInput.style.border = '2px solid #a38a78';
    moveInput.style.borderRadius = '5px';
    moveInput.style.backgroundColor = '#383736';
    moveInput.style.color = '#f0e6d2';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit Move';
    submitButton.onclick = () => handleChessMove(moveInput.value);

    // Allow Enter key to submit
    moveInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChessMove(moveInput.value);
        }
    });

    inputContainer.appendChild(moveInput);
    inputContainer.appendChild(submitButton);
    choiceContainerEl.appendChild(inputContainer);

    // Focus the input field
    setTimeout(() => moveInput.focus(), 100);
}

// 4. The Puzzle Handler
function handleChessMove(moveInput) {
    // Normalize the input (remove spaces, convert to lowercase)
    const normalizedMove = moveInput.trim().toLowerCase().replace(/\s+/g, '');
    const correctMove = 'qg3';

    // Hide the board after a move is made
    hidePuzzleImage();

    if (normalizedMove === correctMove) {
        // SUCCESS PATH
        gameTextEl.innerHTML = `<strong>Your move (Qg3) is brilliant!</strong> The Black King has no escape. The path forward clears before you.`;

        // Button to proceed
        const proceedButton = document.createElement('button');
        proceedButton.innerText = 'Continue to the Gate';
        proceedButton.onclick = () => {
            completePuzzle('chess');
        };
        choiceContainerEl.innerHTML = ''; // Clear previous buttons
        choiceContainerEl.appendChild(proceedButton);
    } else {
        // FAILURE PATH
        gameTextEl.innerHTML = `<strong>The move "${moveInput}" is not checkmate.</strong> The inscription glows red and locks the way. You must try again.`;

        // Button to retry the puzzle
        const retryButton = document.createElement('button');
        retryButton.innerText = 'Examine the board again (Retry)';
        retryButton.onclick = () => renderScene(); // Renders the current scene again (the puzzle)

        choiceContainerEl.innerHTML = '';
        choiceContainerEl.appendChild(retryButton);
    }
}

// Function to hide the puzzle image when not needed (same as before)
function hidePuzzleImage() {
    document.getElementById('puzzle-image').style.display = 'none';
}

function renderStarcraftPuzzle() {
    // Display the Archon image
    puzzleImageEl.style.display = 'block';
    puzzleImageEl.src = 'archon.webp';

    // 1. Set the scenario text
    gameTextEl.innerHTML =
        '<br>Two High Templars must give up their lives and merge their spirits to create a single being of pure psionic energy. What is the name of this burning blue powerhouse?';

    // Clear old choices
    choiceContainerEl.innerHTML = '';

    // Create input field
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.id = 'starcraft-answer-input';
    answerInput.placeholder = 'Enter the unit name...';
    answerInput.style.padding = '10px';
    answerInput.style.fontSize = '1em';
    answerInput.style.flex = '1';
    answerInput.style.border = '2px solid #a38a78';
    answerInput.style.borderRadius = '5px';
    answerInput.style.backgroundColor = '#383736';
    answerInput.style.color = '#f0e6d2';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit Answer';
    submitButton.onclick = () => handleStarcraftAnswer(answerInput.value);

    // Allow Enter key to submit
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleStarcraftAnswer(answerInput.value);
        }
    });

    function handleStarcraftAnswer(input) {
        const normalizedInput = input.trim().toLowerCase();
        const correctAnswer = 'archon';

        if (normalizedInput === correctAnswer) {
            // SUCCESS PATH
            gameTextEl.innerHTML = `⚡ <strong>Correct!</strong> The Archon is indeed the ultimate fusion of two High Templars. The simulation ends, and a portal opens ahead.`;

            const proceedButton = document.createElement('button');
            proceedButton.innerText = 'Step through the Portal';
            proceedButton.onclick = () => {
                completePuzzle('starcraft');
            };
            choiceContainerEl.innerHTML = '';
            choiceContainerEl.appendChild(proceedButton);
        } else {
            gameTextEl.innerHTML = `<br>Two High Templars must give up their lives and merge their spirits to create a single being of pure psionic energy. What is the name of this burning blue powerhouse?<br><br>❌ <strong>Incorrect.</strong> That is not the name of this powerful psionic being. Try again!`;
            answerInput.value = '';
            answerInput.focus();
        }
    }

    inputContainer.appendChild(answerInput);
    inputContainer.appendChild(submitButton);
    choiceContainerEl.appendChild(inputContainer);

    // Focus the input field
    setTimeout(() => answerInput.focus(), 100);
}

// Add a constant for the party leader data
const partyLeader = {
    name: 'Prince Henry',
    sprite: 'rogues.png', // Assume you have a sprite for the leader
    offset: { x: -32 * 2, y: 0 }, // Adjust to the correct frame in the sprite sheet
};

function renderPartyInvite() {
    // Hide the player's sprite and display the party leader's sprite
    playerSpriteEl.style.display = 'none';
    partyLeaderSpriteEl.style.display = 'block';
    partyLeaderSpriteEl.style.backgroundImage = `url('${partyLeader.sprite}')`;
    partyLeaderSpriteEl.style.backgroundPosition = `${partyLeader.offset.x}px ${partyLeader.offset.y}px`;

    // Display lol.jpg image
    puzzleImageEl.style.display = 'block';
    puzzleImageEl.src = 'lol.jpg';

    const charName = characters[gameState.playerCharacter].name;

    // 1. Set the dialogue
    gameTextEl.innerHTML = `You step through the gate and find <strong>${partyLeader.name}</strong>, a gleaming Paladin, waiting for you.`;
    gameTextEl.innerHTML += `<br><br><strong>${partyLeader.name} says:</strong> "Well done, ${charName}. I've seen your trial.`;
    gameTextEl.innerHTML +=
        '<br>I seek the maiden of the land of Lepsic. There will be challenges ahead, but great reward. You possess the qualities this party needs. With my power, I can grant you the title Warrior of Wilson and Official Groomsmen.';
    gameTextEl.innerHTML += 'Will you join my (wedding) party and face the challenges ahead?"';

    // Clear old choices
    choiceContainerEl.innerHTML = '';

    // 2. Define the choices

    // YES button
    const yesButton = document.createElement('button');
    yesButton.innerText = 'Yes, I will join!';
    yesButton.onclick = () => {
        gameState.joinedParty = true;
        gameState.currentScene = 'game_over'; // Success ending
        renderScene();
    };
    choiceContainerEl.appendChild(yesButton);

    // NO button
    const noButton = document.createElement('button');
    noButton.innerText = "No, I'd rather adventure alone.";
    noButton.onclick = () => {
        gameState.joinedParty = false;
        gameState.currentScene = 'game_over'; // Failure ending (refusal)
        renderScene();
    };
    choiceContainerEl.appendChild(noButton);
}

function renderGameOver() {
    // Hide all sprites/puzzles
    playerSpriteEl.style.display = 'none';
    partyLeaderSpriteEl.style.display = 'none';
    puzzleImageEl.style.display = 'none';

    // Clear old choices
    choiceContainerEl.innerHTML = '';

    // 1. Determine the ending text
    if (gameState.joinedParty) {
        gameTextEl.innerHTML = '<h2>🎉 SUCCESS! Party Formed! 🎉</h2>';
        gameTextEl.innerHTML += `<br><br>You have officially joined ${partyLeader.name}'s party! Your combined unique skills will lead to grand adventures.`;
        gameTextEl.innerHTML += `<strong>The prince's courier will be sending you a supply chest for the journey. Look out for a message soon.</strong><br><strong>To be continued...</strong>`;
    } else {
        gameTextEl.innerHTML = '<h2>😔 Solitary Path 😔</h2>';
        gameTextEl.innerHTML += `<br><br>You turn down the offer, choosing to wander alone. ${partyLeader.name} nods respectfully. Your adventure ends here for now, perhaps to start anew another day.`;
    }

    // 2. Add the Restart Button
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Start a New Adventure';
    restartButton.onclick = () => {
        // Reset the core state (this is crucial for restarting the game)
        Object.assign(gameState, {
            playerCharacter: null,
            carouselIndex: 0, // Reset carousel index on restart
            currentScene: 'character_select',
            currentPuzzleIndex: 0, // Reset puzzle progress
            chessPuzzleComplete: false,
            starcraftPuzzleComplete: false,
            yugiohPuzzleComplete: false,
            mtgPuzzleComplete: false,
            vgcComplete: false,
            diablo2Complete: false,
            starwarsComplete: false,
            marioComplete: false,
            joinedParty: false,
        });
        renderScene();
    };
    choiceContainerEl.appendChild(restartButton);
}

// --- NEW Helper Functions ---

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function restartGame() {
    Object.assign(gameState, {
        playerCharacter: null,
        carouselIndex: 0, // Reset carousel index on restart
        currentScene: 'character_select',
        currentPuzzleIndex: 0, // Reset puzzle progress
        chessPuzzleComplete: false,
        starcraftPuzzleComplete: false,
        yugiohPuzzleComplete: false,
        mtgPuzzleComplete: false,
        vgcComplete: false,
        diablo2Complete: false,
        starwarsComplete: false,
        marioComplete: false,
        joinedParty: false,
    });
    renderScene();
}

// Add the event listener to the global restart button
restartButton.addEventListener('click', restartGame);

// --- NEW: Game Initialization with Query Param Support ---
function initializeGame() {
    const charParam = getQueryParam('character');
    // If a valid character is in the URL, set it as the active carousel selection
    if (charParam && characters[charParam]) {
        const characterKeys = Object.keys(characters);
        const charIndex = characterKeys.indexOf(charParam);
        if (charIndex !== -1) {
            gameState.carouselIndex = charIndex;
        }
    }

    renderScene();

    // --- NEW: Add event listeners for carousel arrows ---
    document.getElementById('prev-char').onclick = () => handleCarouselNav('prev');
    document.getElementById('next-char').onclick = () => handleCarouselNav('next');
}

// Start the game!
initializeGame();

function renderYugiohPuzzle() {
    // Display the Duel Arena image
    puzzleImageEl.style.display = 'block';
    puzzleImageEl.src = 'duelarena.webp';

    gameTextEl.innerHTML = 'You enter a holographic arena. <strong>Your Goal: Win the duel this turn.</strong>';
    gameTextEl.innerHTML += '<br>-- Opponent LP: 2000. Field Effect: All Summoned Monsters lose 500 ATK/DEF.';
    gameTextEl.innerHTML +=
        '<br>-- Your Field: <strong>Flame Swordsman</strong> (1800 ATK). Hand: <strong>Polymerization</strong>.';

    // Clear old choices
    choiceContainerEl.innerHTML = '';

    const choices = [
        { text: 'A: Attack directly with Flame Swordsman.', isCorrect: false },
        { text: 'B: Use Polymerization for Blue-Eyes Ultimate Dragon (4500 ATK) and attack.', isCorrect: true },
        { text: 'C: Set Polymerization and end your turn.', isCorrect: false },
    ];

    choices.forEach((choice) => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => handleYugiohChoice(choice);
        choiceContainerEl.appendChild(button);
    });
}

function handleYugiohChoice(choice) {
    if (choice.isCorrect) {
        // SUCCESS PATH
        gameTextEl.innerHTML =
            '🔥 <strong>Victory!</strong> You correctly summoned the ultimate monster and dealt 4000 damage (4500 - 500 ATK penalty). The path ahead is clear.';

        const proceedButton = document.createElement('button');
        proceedButton.innerText = 'Continue to the Gate';
        proceedButton.onclick = () => {
            completePuzzle('yugioh');
        };

        choiceContainerEl.innerHTML = '';
        choiceContainerEl.appendChild(proceedButton);
    } else {
        // FAILURE PATH
        gameTextEl.innerHTML = '❌ <strong>Defeat.</strong> That move did not achieve lethal damage. The arena resets.';

        const retryButton = document.createElement('button');
        retryButton.innerText = 'Try the Duel Again (Retry)';
        retryButton.onclick = () => {
            gameState.currentScene = 'puzzle_gate'; // Set the scene without history
            renderScene();
        };

        choiceContainerEl.innerHTML = '';
        choiceContainerEl.appendChild(retryButton);
    }
}

function renderMtgPuzzle() {
    hidePuzzleImage(); // No specific board image needed, just text

    gameTextEl.innerHTML = 'You find yourself mid-combat, facing a lethal dilemma.';
    gameTextEl.innerHTML +=
        '<br>-- Opponent LP: <strong>2</strong>. Blocking Creature: <strong>Grizzly Bears</strong> (2/2).';
    gameTextEl.innerHTML +=
        '<br>-- Your Field: <strong>Goblin Piker</strong> (2/1, attacking). Untapped Mana: <strong>R</strong> (Mountain), <strong>B B</strong> (2 Swamps).';
    gameTextEl.innerHTML +=
        '<br>-- Your Hand: <strong>Lightning Bolt</strong> (3 damage, cost R), <strong>Disfigure</strong> (-2/-2, cost B).';

    // Clear old choices
    choiceContainerEl.innerHTML = '';

    const choices = [
        {
            text: 'A: Cast Disfigure on the Grizzly Bears, then attack.',
            isCorrect: false,
            logic: 'Uses 1 B, leaving 1 R and 1 B. Piker deals 2 damage. Opponent LP is 0. Wait, this actually works! (But is resource intensive)',
        },
        {
            text: 'B: Cast Lightning Bolt on the Grizzly Bears, then attack.',
            isCorrect: false,
            logic: 'Uses 1 R. Bears die, but Piker has already been blocked and deals no combat damage.',
        },
        {
            text: 'C: Cast Lightning Bolt directly at the opponent.',
            isCorrect: true,
            logic: 'Uses 1 R. Deals 3 damage, reducing LP to -1. Immediate win.',
        },
    ];

    // We'll slightly adjust the logic. While A works, C is the clear, efficient answer.
    // In many MTG puzzles, the most efficient lethal line is the expected answer.

    choices.forEach((choice) => {
        const button = document.createElement('button');
        button.innerText = choice.text;
        button.onclick = () => handleMtgChoice(choice);
        choiceContainerEl.appendChild(button);
    });
}

function handleMtgChoice(choice) {
    if (choice.isCorrect) {
        // SUCCESS PATH (C is the most direct win)
        gameTextEl.innerHTML =
            '⚡ <strong>Instant Win!</strong> You correctly identified the most efficient path: using Lightning Bolt directly on the opponent for 3 damage. A magical bridge forms over the chasm.';

        const proceedButton = document.createElement('button');
        proceedButton.innerText = 'Continue to the Gate';
        proceedButton.onclick = () => {
            completePuzzle('mtg');
        };

        choiceContainerEl.innerHTML = '';
        choiceContainerEl.appendChild(proceedButton);
    } else {
        // FAILURE PATH
        gameTextEl.innerHTML =
            '📉 <strong>Misplay.</strong> Your choice either misallocated mana or failed to deal lethal damage this turn. The puzzle resets.';

        const retryButton = document.createElement('button');
        retryButton.innerText = 'Re-evaluate the Combat Step (Retry)';
        retryButton.onclick = () => {
            gameState.currentScene = 'puzzle_gate'; // Set the scene without history
            renderScene();
        };

        choiceContainerEl.innerHTML = '';
        choiceContainerEl.appendChild(retryButton);
    }
}

function renderPokemonPuzzle() {
    // Display the Gengar image
    puzzleImageEl.style.display = 'block';
    puzzleImageEl.src = 'gengar.png';

    gameTextEl.innerHTML = '<h2>👻 A MYSTERIOUS ENCOUNTER</h2>';
    gameTextEl.innerHTML += "<br>A shadowy figure blocks your path. You must say it's name to pass. What is it's name?";

    choiceContainerEl.innerHTML = '';

    // Create input field
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'pokemon-name-input';
    nameInput.placeholder = 'Enter the name...';
    nameInput.style.padding = '10px';
    nameInput.style.fontSize = '1em';
    nameInput.style.flex = '1';
    nameInput.style.border = '2px solid #a38a78';
    nameInput.style.borderRadius = '5px';
    nameInput.style.backgroundColor = '#383736';
    nameInput.style.color = '#f0e6d2';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Speak the Name';
    submitButton.onclick = () => handlePokemonName(nameInput.value);

    // Allow Enter key to submit
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePokemonName(nameInput.value);
        }
    });

    function handlePokemonName(input) {
        const normalizedInput = input.trim().toLowerCase();
        const correctName = 'gengar';

        if (normalizedInput === correctName) {
            // Puzzle complete
            hidePuzzleImage();
            gameTextEl.innerHTML = `✅ <strong>The shadowy figure fades away...</strong> You've spoken the name! The path is clear.`;
            const next = document.createElement('button');
            next.innerText = 'Proceed to the Gate';
            next.onclick = () => {
                completePuzzle('pokemon');
            };
            choiceContainerEl.innerHTML = '';
            choiceContainerEl.appendChild(next);
        } else {
            gameTextEl.innerHTML = `<h2>👻 A MYSTERIOUS ENCOUNTER</h2><br>A shadowy figure blocks your path. You must say it's name to pass. What is it's name?<br><br>❌ <strong>That's not right...</strong> The figure grows darker. Try again!`;
            nameInput.value = '';
            nameInput.focus();
        }
    }

    inputContainer.appendChild(nameInput);
    inputContainer.appendChild(submitButton);
    choiceContainerEl.appendChild(inputContainer);

    // Focus the input field
    setTimeout(() => nameInput.focus(), 100);
}

function renderDiablo2Puzzle() {
    hidePuzzleImage();

    gameTextEl.innerHTML =
        '<br>Before you stands an ancient gate, sealed with Horadric runes. Three glowing symbols pulse with power: <strong>Jah</strong>, <strong>Ith</strong>, and <strong>Ber</strong>.';
    gameTextEl.innerHTML +=
        '<br><br>A voice echoes: "Speak the word of power, the name forged from these three runes, and the gate shall open."';

    choiceContainerEl.innerHTML = '';

    // Create input field
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';

    const wordInput = document.createElement('input');
    wordInput.type = 'text';
    wordInput.id = 'diablo2-word-input';
    wordInput.placeholder = 'Speak the word of power...';
    wordInput.style.padding = '10px';
    wordInput.style.fontSize = '1em';
    wordInput.style.flex = '1';
    wordInput.style.border = '2px solid #a38a78';
    wordInput.style.borderRadius = '5px';
    wordInput.style.backgroundColor = '#383736';
    wordInput.style.color = '#f0e6d2';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Speak the Word';
    submitButton.onclick = () => handleDiablo2Word(wordInput.value);

    // Allow Enter key to submit
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDiablo2Word(wordInput.value);
        }
    });

    function handleDiablo2Word(input) {
        const normalizedInput = input.trim().toLowerCase();
        const correctWord = 'enigma';

        if (normalizedInput === correctWord) {
            // Puzzle complete
            gameTextEl.innerHTML = `✨ <strong>The gate trembles and opens...</strong> You spoke "Enigma"! The ancient Horadric power recognizes your knowledge. The path forward is clear.`;
            const next = document.createElement('button');
            next.innerText = 'Step Through the Gate';
            next.onclick = () => {
                completePuzzle('diablo2');
            };
            choiceContainerEl.innerHTML = '';
            choiceContainerEl.appendChild(next);
        } else {
            gameTextEl.innerHTML = `Before you stands an ancient gate, sealed with Horadric runes. Three glowing symbols pulse with power: <strong>Jah</strong>, <strong>Ith</strong>, and <strong>Ber</strong>.<br><br>A voice echoes: "Speak the word of power, the name forged from these three runes, and the gate shall open."<br><br>❌ <strong>The runes reject your words...</strong> That is not the name of power. Try again!`;
            wordInput.value = '';
            wordInput.focus();
        }
    }

    inputContainer.appendChild(wordInput);
    inputContainer.appendChild(submitButton);
    choiceContainerEl.appendChild(inputContainer);

    // Focus the input field
    setTimeout(() => wordInput.focus(), 100);
}

function renderMarioPuzzle() {
    hidePuzzleImage();

    gameTextEl.innerHTML =
        "You find a door with a star on it. It slides open and you see a staircase that doesn't seem to end. You've seen this before during your days doing jobs for the princess and know the technique required to pass.";
    gameTextEl.innerHTML += 'Name this 3-letter movement technique."';

    choiceContainerEl.innerHTML = '';

    // Create input field
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';

    const techniqueInput = document.createElement('input');
    techniqueInput.type = 'text';
    techniqueInput.id = 'mario-technique-input';
    techniqueInput.placeholder = 'Enter the technique...';
    techniqueInput.style.padding = '10px';
    techniqueInput.style.fontSize = '1em';
    techniqueInput.style.flex = '1';
    techniqueInput.style.border = '2px solid #a38a78';
    techniqueInput.style.borderRadius = '5px';
    techniqueInput.style.backgroundColor = '#383736';
    techniqueInput.style.color = '#f0e6d2';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Execute Technique';
    submitButton.onclick = () => handleMarioTechnique(techniqueInput.value);

    // Allow Enter key to submit
    techniqueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMarioTechnique(techniqueInput.value);
        }
    });

    function handleMarioTechnique(input) {
        const normalizedInput = input.trim().toLowerCase().replace(/[\s-]/g, '');
        const correctAnswers = ['blj', 'backwardlongjump'];

        if (correctAnswers.includes(normalizedInput)) {
            // Puzzle complete
            gameTextEl.innerHTML = `⭐ <strong>YAHOO! YAHOO! YAHOO! YA-YA-YA-YAHOO!</strong> You've successfully performed the Backward Long Jump! Reality bends as your speed builds infinitely. The impossible stairs are conquered and you're able to continue your journey.`;
            const next = document.createElement('button');
            next.innerText = 'Continue onward';
            next.onclick = () => {
                completePuzzle('mario');
            };
            choiceContainerEl.innerHTML = '';
            choiceContainerEl.appendChild(next);
        } else {
            gameTextEl.innerHTML = `You find a door with a star on it. It slides open and you see a staircase that doesn't seem to end. You've seen this before during your days doing jobs for the princess and know the technique required to pass. Name this 3-letter movement technique."<br><br>❌ <strong>The stairs remain endless...</strong> That's not the right technique. The Star Door remains locked. Try again!`;
            techniqueInput.value = '';
            techniqueInput.focus();
        }
    }

    inputContainer.appendChild(techniqueInput);
    inputContainer.appendChild(submitButton);
    choiceContainerEl.appendChild(inputContainer);

    // Focus the input field
    setTimeout(() => techniqueInput.focus(), 100);
}

function renderStarWarsPuzzle() {
    hidePuzzleImage();
    puzzleImageEl.style.display = 'block';
    puzzleImageEl.src = 'rakatan.png';

    gameTextEl.innerHTML = '<h2>✨ THE RAKATAN STAR MAP ✨</h2>';
    gameTextEl.innerHTML +=
        '<br>You stand before an ancient Rakatan Computer on the planet Dantooine. The terminal glows with an eerie red light. It scans your mind, detecting a powerful connection to the Force that has been fractured and rebuilt.';
    gameTextEl.innerHTML +=
        '<br><br>"Data corruption detected. Memory wipe confirmed. To access the Star Map, you must bypass the Jedi Council\'s programming. Before the betrayal, before the amnesia... speak the name of the Sith Lord who led the crusade against the Republic alongside Malak."';

    choiceContainerEl.innerHTML = '';

    // Create input field
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'starwars-name-input';
    nameInput.placeholder = 'Speak your true name...';
    nameInput.style.padding = '10px';
    nameInput.style.fontSize = '1em';
    nameInput.style.flex = '1';
    nameInput.style.border = '2px solid #a38a78';
    nameInput.style.borderRadius = '5px';
    nameInput.style.backgroundColor = '#383736';
    nameInput.style.color = '#f0e6d2';

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.onclick = () => handleStarWarsName(nameInput.value);

    // Allow Enter key to submit
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleStarWarsName(nameInput.value);
        }
    });

    function handleStarWarsName(input) {
        const normalizedInput = input.trim().toLowerCase();
        const correctAnswers = ['revan', 'darth revan'];

        if (correctAnswers.includes(normalizedInput)) {
            // Puzzle complete
            gameTextEl.innerHTML = `✨ <strong>Access Granted...</strong> "Welcome back, Revan. The Star Map reveals itself. Your memories... your destiny... they were never truly erased." The ancient technology hums to life.`;
            const next = document.createElement('button');
            next.innerText = 'View the Star Map';
            next.onclick = () => {
                completePuzzle('starwars');
            };
            choiceContainerEl.innerHTML = '';
            choiceContainerEl.appendChild(next);
        } else {
            gameTextEl.innerHTML = `<h2>✨ THE RAKATAN STAR MAP ✨</h2><br>You stand before an ancient Rakatan Computer on the planet Dantooine. The terminal glows with an eerie red light. It scans your mind, detecting a powerful connection to the Force that has been fractured and rebuilt.<br><br>"Data corruption detected. Memory wipe confirmed. To access the Star Map, you must bypass the Jedi Council's programming. Before the betrayal, before the amnesia... speak the name of the Sith Lord who led the crusade against the Republic alongside Malak."<br><br>❌ <strong>Access Denied...</strong> "Identity verification failed. The Force signature does not match." Try again!`;
            nameInput.value = '';
            nameInput.focus();
        }
    }

    inputContainer.appendChild(nameInput);
    inputContainer.appendChild(submitButton);
    choiceContainerEl.appendChild(inputContainer);

    // Focus the input field
    setTimeout(() => nameInput.focus(), 100);
}
