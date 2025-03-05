// UI handling for Heart Strings

// UI Elements
const UI = {
    screens: {
        loading: document.getElementById('loading-screen'),
        mainMenu: document.getElementById('main-menu'),
        characterSelect: document.getElementById('character-select'),
        locationSelect: document.getElementById('location-select'),
        dateScreen: document.getElementById('date-screen'),
        summaryScreen: document.getElementById('summary-screen')
    },
    modals: {
        settings: document.getElementById('settings-modal'),
        confirmation: document.getElementById('confirmation-modal')
    },
    elements: {
        charactersContainer: document.getElementById('characters-container'),
        locationsContainer: document.getElementById('locations-container'),
        selectedCharacterImage: document.getElementById('selected-character-image'),
        selectedCharacterName: document.getElementById('selected-character-name'),
        relationshipStatus: document.getElementById('relationship-status'),
        locationImage: document.getElementById('location-image'),
        characterPortrait: document.getElementById('character-portrait'),
        characterName: document.getElementById('character-name'),
        dialogueText: document.getElementById('dialogue-text'),
        responseOptions: document.getElementById('response-options'),
        timerContainer: document.getElementById('timer-container'),
        timer: document.getElementById('timer'),
        moveLocationBtn: document.getElementById('move-location'),
        endDateBtn: document.getElementById('end-date'),
        typingContainer: document.getElementById('typing-container'),
        userInput: document.getElementById('user-input'),
        sendResponseBtn: document.getElementById('send-response'),
        characterSummaryImage: document.getElementById('character-summary-image'),
        characterSummaryName: document.getElementById('character-summary-name'),
        relationshipChange: document.getElementById('relationship-change'),
        dateFeedback: document.getElementById('date-feedback'),
        confirmationMessage: document.getElementById('confirmation-message')
    },
    settings: {
        ttsToggle: document.getElementById('tts-toggle'),
        voiceSpeed: document.getElementById('voice-speed'),
        voiceSpeedValue: document.getElementById('voice-speed-value'),
        voiceVolume: document.getElementById('voice-volume'),
        voiceVolumeValue: document.getElementById('voice-volume-value'),
        textSpeed: document.getElementById('text-speed'),
        textSpeedValue: document.getElementById('text-speed-value')
    },
    buttons: {
        startGame: document.getElementById('start-game'),
        settingsButton: document.getElementById('settings-button'),
        backToMenu: document.getElementById('back-to-menu'),
        backToCharacters: document.getElementById('back-to-characters'),
        returnToCharacterSelect: document.getElementById('return-to-character-select'),
        closeSettings: document.getElementById('close-settings'),
        resetProgress: document.getElementById('reset-progress'),
        confirmYes: document.getElementById('confirm-yes'),
        confirmNo: document.getElementById('confirm-no')
    }
};

/**
 * Shows a specific screen and hides all others
 * @param {string} screenId - ID of the screen to show
 */
function showScreen(screenId) {
    Object.keys(UI.screens).forEach(key => {
        UI.screens[key].classList.add('hidden');
    });
    UI.screens[screenId].classList.remove('hidden');
}

/**
 * Shows a modal dialog
 * @param {string} modalId - ID of the modal to show
 */
function showModal(modalId) {
    UI.modals[modalId].classList.remove('hidden');
}

/**
 * Hides a modal dialog
 * @param {string} modalId - ID of the modal to hide
 */
function hideModal(modalId) {
    UI.modals[modalId].classList.add('hidden');
}

/**
 * Creates character cards for the character selection screen
 * @param {Array} characters - Array of character objects
 * @param {Object} saveData - Player's save data with relationship scores
 */
async function createCharacterCards(characters, saveData) {
    UI.elements.charactersContainer.innerHTML = '';
    
    for (const character of characters) {
        // Create character card container
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = character.id;
        
        // Create image placeholder
        const imageContainer = document.createElement('div');
        imageContainer.className = 'character-image';
        
        // Generate character image
        try {
            const imageUrl = await generateCharacterImage(character);
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = character.name;
            img.className = 'character-image';
            imageContainer.appendChild(img);
        } catch (error) {
            imageContainer.textContent = 'Image unavailable';
            debugLog('Failed to load character image:', error);
        }
        
        // Create character info
        const info = document.createElement('div');
        info.className = 'character-info';
        
        // Add relationship data
        const relationshipScore = saveData.characters[character.id]?.relationship || character.initialRelationship;
        const relationshipLevel = getRelationshipLevel(relationshipScore);
        
        // Create character name element
        const name = document.createElement('div');
        name.className = 'character-name';
        name.textContent = character.name;
        
        // Create relationship level element
        const relationship = document.createElement('div');
        relationship.className = 'character-relationship';
        relationship.textContent = relationshipLevel;
        
        // Create relationship progress bar
        const bar = document.createElement('div');
        bar.className = 'relationship-bar';
        
        const progress = document.createElement('div');
        progress.className = 'relationship-progress';
        progress.style.width = `${relationshipScore}%`;
        
        bar.appendChild(progress);
        
        // Assemble card
        info.appendChild(name);
        info.appendChild(relationship);
        info.appendChild(bar);
        
        card.appendChild(imageContainer);
        card.appendChild(info);
        
        // Add click event listener
        card.addEventListener('click', () => {
            Game.selectCharacter(character.id);
        });
        
        UI.elements.charactersContainer.appendChild(card);
    }
}

/**
 * Creates location cards for the location selection screen
 * @param {Array} locations - Array of location objects
 */
async function createLocationCards(locations) {
    UI.elements.locationsContainer.innerHTML = '';
    
    for (const location of locations) {
        // Create location card container
        const card = document.createElement('div');
        card.className = 'location-card';
        card.dataset.locationId = location.id;
        
        // Create image placeholder
        const imageContainer = document.createElement('div');
        imageContainer.className = 'location-image';
        
        // Generate location image
        try {
            const imageUrl = await generateLocationImage(location);
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = location.name;
            img.className = 'location-image';
            imageContainer.appendChild(img);
        } catch (error) {
            imageContainer.textContent = 'Image unavailable';
            debugLog('Failed to load location image:', error);
        }
        
        // Create location info
        const info = document.createElement('div');
        info.className = 'location-info';
        
        // Create location name element
        const name = document.createElement('div');
        name.className = 'location-name';
        name.textContent = location.name;
        
        // Create location description element
        const description = document.createElement('div');
        description.className = 'location-description';
        description.textContent = location.description;
        
        // Assemble card
        info.appendChild(name);
        info.appendChild(description);
        
        card.appendChild(imageContainer);
        card.appendChild(info);
        
        // Add click event listener
        card.addEventListener('click', () => {
            Game.selectLocation(location.id);
        });
        
        UI.elements.locationsContainer.appendChild(card);
    }
}

/**
 * Updates the selected character preview on the location selection screen
 * @param {Object} character - Selected character object
 * @param {number} relationshipScore - Current relationship score
 */
async function updateCharacterPreview(character, relationshipScore) {
    try {
        const imageUrl = await generateCharacterImage(character);
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = character.name;
        
        UI.elements.selectedCharacterImage.innerHTML = '';
        UI.elements.selectedCharacterImage.appendChild(img);
        
        UI.elements.selectedCharacterName.textContent = character.name;
        UI.elements.relationshipStatus.textContent = getRelationshipLevel(relationshipScore);
    } catch (error) {
        UI.elements.selectedCharacterImage.textContent = 'Image unavailable';
        debugLog('Failed to update character preview:', error);
    }
}

/**
 * Displays character and location in the date screen
 * @param {Object} character - Character object
 * @param {Object} location - Location object
 */
async function setupDateScreen(character, location) {
    try {
        // Set location background
        const locationImageUrl = await generateLocationImage(location);
        UI.elements.locationImage.style.backgroundImage = `url('${locationImageUrl}')`;
        
        // Set character portrait
        const characterImageUrl = await generateCharacterImage(character);
        UI.elements.characterPortrait.style.backgroundImage = `url('${characterImageUrl}')`;
        
        // Set character name
        UI.elements.characterName.textContent = character.name;
        
        // Clear dialogue and responses
        UI.elements.dialogueText.textContent = '';
        UI.elements.responseOptions.innerHTML = '';
        
        // Show the move location button
        UI.elements.moveLocationBtn.classList.remove('hidden');
    } catch (error) {
        debugLog('Failed to setup date screen:', error);
    }
}

/**
 * Displays dialogue text with typing animation
 * @param {string} text - Dialogue text to display
 * @param {number} speed - Text typing speed
 * @returns {Promise} Promise that resolves when animation completes
 */
async function displayDialogue(text, speed = CONFIG.defaultTextSpeed) {
    return typeText(UI.elements.dialogueText, text, speed);
}

/**
 * Creates and displays response options
 * @param {Array} options - Array of response option objects
 */
function displayResponseOptions(options) {
    UI.elements.responseOptions.innerHTML = '';
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'response-option';
        button.textContent = option.text;
        button.dataset.index = index;
        
        button.addEventListener('click', () => {
            Game.selectResponse(index);
        });
        
        UI.elements.responseOptions.appendChild(button);
    });
    
    // Add open-ended response option
    const openEndedOption = document.createElement('button');
    openEndedOption.className = 'response-option';
    openEndedOption.textContent = "Say something else...";
    
    openEndedOption.addEventListener('click', () => {
        toggleTypingInput(true);
    });
    
    UI.elements.responseOptions.appendChild(openEndedOption);
}

/**
 * Toggles the display of the typing input
 * @param {boolean} show - Whether to show or hide the input
 */
function toggleTypingInput(show) {
    if (show) {
        UI.elements.responseOptions.classList.add('hidden');
        UI.elements.typingContainer.classList.remove('hidden');
        UI.elements.userInput.focus();
    } else {
        UI.elements.responseOptions.classList.remove('hidden');
        UI.elements.typingContainer.classList.add('hidden');
        UI.elements.userInput.value = '';
    }
}

/**
 * Updates the timer display
 * @param {number} secondsRemaining - Seconds remaining in the date
 */
function updateTimer(secondsRemaining) {
    UI.elements.timer.textContent = formatTime(secondsRemaining);
    
    // Change color when time is running low
    if (secondsRemaining <= 60) {
        UI.elements.timer.style.color = '#e74c3c';
    } else {
        UI.elements.timer.style.color = '#333';
    }
}

/**
 * Updates the summary screen with date results
 * @param {Object} character - Character object
 * @param {number} relationshipChange - Change in relationship score
 * @param {string} feedback - Feedback text about the date
 */
async function updateSummaryScreen(character, relationshipChange, feedback) {
    try {
        // Set character image
        const imageUrl = await generateCharacterImage(character);
        UI.elements.characterSummaryImage.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = character.name;
        UI.elements.characterSummaryImage.appendChild(img);
        
        // Set character name
        UI.elements.characterSummaryName.textContent = character.name;
        
        // Set relationship change text
        const changeText = formatRelationshipChange(relationshipChange);
        UI.elements.relationshipChange.textContent = `Relationship: ${changeText} points`;
        
        // Set color based on positive/negative change
        if (relationshipChange > 0) {
            UI.elements.relationshipChange.style.color = '#27ae60';
        } else if (relationshipChange < 0) {
            UI.elements.relationshipChange.style.color = '#e74c3c';
        } else {
            UI.elements.relationshipChange.style.color = '#333';
        }
        
        // Set feedback text
        UI.elements.dateFeedback.textContent = feedback;
    } catch (error) {
        debugLog('Failed to update summary screen:', error);
    }
}

/**
 * Shows a confirmation dialog
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Function to call if user confirms
 */
function showConfirmation(message, onConfirm) {
    UI.elements.confirmationMessage.textContent = message;
    
    // Set up confirm button
    const originalConfirmHandler = UI.buttons.confirmYes.onclick;
    UI.buttons.confirmYes.onclick = () => {
        onConfirm();
        hideModal('confirmation');
        UI.buttons.confirmYes.onclick = originalConfirmHandler;
    };
    
    showModal('confirmation');
}

/**
 * Initializes UI event listeners
 */
function initUI() {
    // Main menu buttons
    UI.buttons.startGame.addEventListener('click', () => {
        Game.start();
    });
    
    UI.buttons.settingsButton.addEventListener('click', () => {
        showModal('settings');
    });
    
    // Navigation buttons
    UI.buttons.backToMenu.addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    UI.buttons.backToCharacters.addEventListener('click', () => {
        showScreen('characterSelect');
    });
    
    UI.buttons.returnToCharacterSelect.addEventListener('click', () => {
        showScreen('characterSelect');
    });
    
    // Date screen buttons
    UI.elements.moveLocationBtn.addEventListener('click', () => {
        Game.moveLocation();
    });
    
    UI.elements.endDateBtn.addEventListener('click', () => {
        Game.endDate();
    });
    
    // Settings buttons
    UI.buttons.closeSettings.addEventListener('click', () => {
        hideModal('settings');
    });
    
    UI.buttons.resetProgress.addEventListener('click', () => {
        showConfirmation('Are you sure you want to reset all progress? This cannot be undone.', () => {
            Game.resetProgress();
        });
    });
    
    UI.buttons.confirmNo.addEventListener('click', () => {
        hideModal('confirmation');
    });
    
    // Settings controls
    UI.settings.ttsToggle.addEventListener('change', () => {
        TTS.setEnabled(UI.settings.ttsToggle.checked);
    });
    
    UI.settings.voiceSpeed.addEventListener('input', () => {
        const speed = parseFloat(UI.settings.voiceSpeed.value);
        UI.settings.voiceSpeedValue.textContent = speed.toFixed(1);
        TTS.setRate(speed);
    });
    
    UI.settings.voiceVolume.addEventListener('input', () => {
        const volume = parseFloat(UI.settings.voiceVolume.value);
        UI.settings.voiceVolumeValue.textContent = volume.toFixed(1);
        TTS.setVolume(volume);
    });
    
    UI.settings.textSpeed.addEventListener('input', () => {
        const speed = parseInt(UI.settings.textSpeed.value);
        UI.settings.textSpeedValue.textContent = speed;
    });
    
    // Custom response input
    UI.elements.sendResponseBtn.addEventListener('click', () => {
        const text = UI.elements.userInput.value.trim();
        if (text) {
            Game.submitCustomResponse(text);
            toggleTypingInput(false);
        }
    });
    
    UI.elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = UI.elements.userInput.value.trim();
            if (text) {
                Game.submitCustomResponse(text);
                toggleTypingInput(false);
            }
        }
    });
}

