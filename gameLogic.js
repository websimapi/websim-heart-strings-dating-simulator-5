// Game logic for Heart Strings

/**
 * Main game controller
 */
const Game = {
    // Current state
    state: {
        selectedCharacter: null,
        selectedLocation: null,
        dateStartTime: null,
        dateEndTime: null,
        dateDuration: 15, // minutes
        timerInterval: null,
        secondsRemaining: 0,
        relationshipChange: 0,
        isDateActive: false,
        currentResponse: null
    },
    
    /**
     * Start the game
     */
    start() {
        showScreen('characterSelect');
        this.loadCharacters();
    },
    
    /**
     * Load character data and display character selection
     */
    async loadCharacters() {
        await createCharacterCards(CHARACTERS, Memory.gameState);
    },
    
    /**
     * Select a character
     * @param {string} characterId - ID of selected character
     */
    selectCharacter(characterId) {
        this.state.selectedCharacter = CHARACTERS.find(c => c.id === characterId);
        if (!this.state.selectedCharacter) return;
        
        const relationshipScore = Memory.getRelationshipScore(characterId);
        updateCharacterPreview(this.state.selectedCharacter, relationshipScore);
        
        showScreen('locationSelect');
        this.loadLocations();
    },
    
    /**
     * Load location data and display location selection
     */
    async loadLocations() {
        await createLocationCards(LOCATIONS);
    },
    
    /**
     * Select a location
     * @param {string} locationId - ID of selected location
     */
    selectLocation(locationId) {
        this.state.selectedLocation = LOCATIONS.find(l => l.id === locationId);
        if (!this.state.selectedLocation) return;
        
        this.startDate();
    },
    
    /**
     * Start a date with selected character at selected location
     */
    async startDate() {
        if (!this.state.selectedCharacter || !this.state.selectedLocation) return;
        
        showScreen('dateScreen');
        
        // Setup date screen with character and location
        await setupDateScreen(this.state.selectedCharacter, this.state.selectedLocation);
        
        // Initialize date state
        this.state.dateStartTime = new Date();
        this.state.relationshipChange = 0;
        this.state.isDateActive = true;
        
        // Determine date duration based on relationship
        const relationshipScore = Memory.getRelationshipScore(this.state.selectedCharacter.id);
        const relationshipLevel = getRelationshipLevel(relationshipScore);
        
        // Higher relationship = longer date
        if (relationshipScore < 20) {
            this.state.dateDuration = getRandomInt(1, 5); // 1-5 minutes
        } else if (relationshipScore < 50) {
            this.state.dateDuration = getRandomInt(5, 10); // 5-10 minutes
        } else {
            this.state.dateDuration = getRandomInt(10, 15); // 10-15 minutes
        }
        
        // Set timer
        this.state.secondsRemaining = this.state.dateDuration * 60;
        this.startTimer();
        
        // Generate and display initial dialogue
        await this.generateDialogue(true);
    },
    
    /**
     * Start the date timer
     */
    startTimer() {
        // Clear any existing timer
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }
        
        // Update timer display
        updateTimer(this.state.secondsRemaining);
        
        // Start countdown
        this.state.timerInterval = setInterval(() => {
            this.state.secondsRemaining--;
            updateTimer(this.state.secondsRemaining);
            
            if (this.state.secondsRemaining <= 0) {
                this.endDate(true);
            }
        }, 1000);
    },
    
    /**
     * Generate character dialogue
     * @param {boolean} isInitial - Whether this is the initial dialogue
     */
    async generateDialogue(isInitial = false) {
        if (!this.state.isDateActive) return;
        
        const character = this.state.selectedCharacter;
        const location = this.state.selectedLocation;
        const relationshipScore = Memory.getRelationshipScore(character.id);
        const relationshipLevel = getRelationshipLevel(relationshipScore);
        
        // Prepare the system prompt
        const memories = Memory.getFormattedMemories(character.id);
        const minutes = Math.ceil((this.state.dateDuration * 60 - this.state.secondsRemaining) / 60);
        
        let systemPrompt = CONFIG.characterPrompts.baseSystemPrompt
            .replace('{characterName}', character.name)
            .replace('{relationshipLevel}', relationshipLevel)
            .replace('{locationName}', location.name)
            .replace('{dateDuration}', minutes)
            .replace('{characterProfile}', JSON.stringify(character.profile))
            .replace('{locationDescription}', location.description)
            .replace('{conversationMemory}', memories);
        
        // Add context about whether this is the initial dialogue
        if (isInitial) {
            const locationMemory = Memory.getLocationMemories(character.id, location.id);
            const visitCount = locationMemory.visits;
            
            if (visitCount === 0) {
                systemPrompt += "\nThis is the first time you've been to this location with the player.";
            } else {
                systemPrompt += `\nYou've been to this location with the player ${visitCount} times before.`;
            }
        }
        
        // Add context about the current response if applicable
        if (this.state.currentResponse) {
            systemPrompt += `\nThe player just said: "${this.state.currentResponse}"`;
        }
        
        try {
            // Generate dialogue
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    }
                ]
            });
            
            const dialogue = completion.content;
            
            // Display dialogue with typing animation
            await displayDialogue(dialogue);
            
            // Speak dialogue
            await TTS.speak(character.id, dialogue);
            
            // Generate response options
            this.generateResponseOptions(dialogue);
            
            // Save this interaction to memory
            if (isInitial) {
                Memory.saveInteraction(character.id, location.id, {
                    summary: `We met at ${location.name}. ${dialogue.substring(0, 100)}...`,
                    playerResponse: null
                });
            }
        } catch (error) {
            debugLog('Error generating dialogue:', error);
            
            // Fallback dialogue
            const fallbackDialogue = isInitial
                ? `Hi there! It's nice to be here at ${location.name} with you.`
                : "Sorry, I got distracted for a moment. What were you saying?";
                
            await displayDialogue(fallbackDialogue);
            await TTS.speak(character.id, fallbackDialogue);
            
            // Generate generic response options
            this.generateFallbackResponses();
        }
    },
    
    /**
     * Generate response options for player
     * @param {string} dialogue - Character's dialogue
     */
    async generateResponseOptions(dialogue) {
        const character = this.state.selectedCharacter;
        const location = this.state.selectedLocation;
        const relationshipScore = Memory.getRelationshipScore(character.id);
        
        try {
            // Get response options from AI
            const prompt = `Based on ${character.name}'s dialogue: "${dialogue}", 
            generate 4 response options for the player to choose from.
            The relationship is currently at level ${getRelationshipLevel(relationshipScore)}.
            
            Provide the response options in JSON format. Each option should include:
            1. text: The text of the response option
            2. effect: The effect on the relationship (veryPositive, positive, neutral, or negative)
            
            Return ONLY a JSON array with no explanation.`;
            
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                json: true
            });
            
            let options;
            try {
                options = JSON.parse(completion.content);
                
                // Validate JSON structure
                if (!Array.isArray(options) || options.length === 0) {
                    throw new Error("Invalid options format");
                }
                
                // Ensure each option has the required properties
                options = options.map(option => ({
                    text: option.text || "I'm not sure what to say.",
                    effect: option.effect || "neutral"
                }));
                
                // Limit to 4 options
                options = options.slice(0, 4);
            } catch (error) {
                debugLog('Error parsing response options:', error);
                this.generateFallbackResponses();
                return;
            }
            
            // Display response options
            displayResponseOptions(options);
        } catch (error) {
            debugLog('Error generating response options:', error);
            this.generateFallbackResponses();
        }
    },
    
    /**
     * Generate fallback response options if AI generation fails
     */
    generateFallbackResponses() {
        const options = [
            { text: "That's interesting! Tell me more.", effect: "positive" },
            { text: "I'm enjoying our conversation.", effect: "positive" },
            { text: "What do you think about this place?", effect: "neutral" },
            { text: "Sorry, I need to think about that.", effect: "neutral" }
        ];
        
        displayResponseOptions(options);
    },
    
    /**
     * Handle player selecting a response option
     * @param {number} index - Index of selected response
     */
    async selectResponse(index) {
        const options = Array.from(UI.elements.responseOptions.querySelectorAll('.response-option'));
        if (index < 0 || index >= options.length - 1) return; // Last option is "Say something else"
        
        const selectedOption = options[index];
        const responseText = selectedOption.textContent;
        
        await this.processResponse(responseText, selectedOption.dataset.effect);
    },
    
    /**
     * Handle player submitting a custom response
     * @param {string} text - Custom response text
     */
    async submitCustomResponse(text) {
        await this.processResponse(text);
    },
    
    /**
     * Process player response and update game state
     * @param {string} text - Response text
     * @param {string} effect - Optional effect type if from predefined options
     */
    async processResponse(text, effect = null) {
        if (!this.state.isDateActive) return;
        
        const character = this.state.selectedCharacter;
        const location = this.state.selectedLocation;
        
        // Save the response for context in next dialogue generation
        this.state.currentResponse = text;
        
        // Save interaction to memory
        Memory.saveInteraction(character.id, location.id, {
            summary: `Player said: "${text}"`,
            playerResponse: text
        });
        
        // Update relationship score based on response
        let relationshipChange = 0;
        
        if (effect) {
            // Use predefined effect
            switch (effect) {
                case 'veryPositive':
                    relationshipChange = CONFIG.responseEffects.veryPositive;
                    break;
                case 'positive':
                    relationshipChange = CONFIG.responseEffects.positive;
                    break;
                case 'neutral':
                    relationshipChange = CONFIG.responseEffects.neutral;
                    break;
                case 'negative':
                    relationshipChange = CONFIG.responseEffects.negative;
                    break;
                default:
                    relationshipChange = CONFIG.responseEffects.neutral;
            }
        } else {
            // For custom responses, analyze sentiment
            try {
                const sentiment = await this.analyzeResponseSentiment(text, character);
                relationshipChange = sentiment;
            } catch (error) {
                debugLog('Error analyzing sentiment:', error);
                relationshipChange = CONFIG.responseEffects.neutral;
            }
        }
        
        // Update relationship score
        Memory.updateRelationship(character.id, relationshipChange);
        this.state.relationshipChange += relationshipChange;
        
        // Generate next dialogue
        await this.generateDialogue();
    },
    
    /**
     * Analyze sentiment of custom response
     * @param {string} text - Response text
     * @param {Object} character - Character object
     * @returns {number} Relationship change value
     */
    async analyzeResponseSentiment(text, character) {
        try {
            const prompt = `As ${character.name}, with your personality and interests, analyze this message from someone you're on a date with:
            "${text}"
            
            How would this make you feel? Rate the effect on your relationship:
            - Very Positive: 5 (compliments, shared interests, thoughtful questions)
            - Positive: 3 (friendly, engaging, shows interest)
            - Neutral: 1 (basic response, small talk)
            - Negative: -2 (rude, dismissive, inappropriate)
            
            Return ONLY a single number (5, 3, 1, or -2) with no explanation.`;
            
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });
            
            // Extract number from response
            const sentiment = parseInt(completion.content.trim());
            if (isNaN(sentiment)) {
                return CONFIG.responseEffects.neutral;
            }
            
            // Map to one of our predefined effect values
            if (sentiment >= 5) return CONFIG.responseEffects.veryPositive;
            if (sentiment >= 3) return CONFIG.responseEffects.positive;
            if (sentiment >= 0) return CONFIG.responseEffects.neutral;
            return CONFIG.responseEffects.negative;
            
        } catch (error) {
            debugLog('Error analyzing sentiment:', error);
            return CONFIG.responseEffects.neutral;
        }
    },
    
    /**
     * End the current date
     * @param {boolean} timedOut - Whether the date ended due to time running out
     */
    async endDate(timedOut = false) {
        if (!this.state.isDateActive) return;
        
        // Stop the timer
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        this.state.isDateActive = false;
        this.state.dateEndTime = new Date();
        
        const character = this.state.selectedCharacter;
        
        // Generate farewell message if date didn't end due to timeout
        if (!timedOut) {
            try {
                // Prepare the system prompt for ending dialogue
                const relationshipScore = Memory.getRelationshipScore(character.id);
                const relationshipLevel = getRelationshipLevel(relationshipScore);
                const change = this.state.relationshipChange;
                
                const endPrompt = CONFIG.characterPrompts.endDatePrompt
                    .replace('{characterName}', character.name);
                
                const completion = await websim.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are ${character.name}. 
                            The date is ending. Relationship level: ${relationshipLevel}.
                            Relationship change during this date: ${change > 0 ? '+' + change : change}`
                        },
                        {
                            role: "user",
                            content: endPrompt
                        }
                    ]
                });
                
                const farewell = completion.content;
                
                // Display farewell message
                await displayDialogue(farewell);
                await TTS.speak(character.id, farewell);
                
                // Save final interaction
                Memory.saveInteraction(character.id, this.state.selectedLocation.id, {
                    summary: `Date ended. Relationship change: ${change}. Final words: "${farewell.substring(0, 100)}..."`,
                    farewell: true
                });
                
            } catch (error) {
                debugLog('Error generating farewell:', error);
                
                // Fallback farewell
                const fallbackFarewell = "It was nice spending time with you. I hope we can do this again sometime!";
                await displayDialogue(fallbackFarewell);
                await TTS.speak(character.id, fallbackFarewell);
            }
        } else {
            // Time ran out
            const timeoutMessage = "Oh, look at the time! I really need to get going. Let's catch up again soon!";
            await displayDialogue(timeoutMessage);
            await TTS.speak(character.id, timeoutMessage);
            
            // Save timeout interaction
            Memory.saveInteraction(character.id, this.state.selectedLocation.id, {
                summary: `Date ran out of time. Relationship change: ${this.state.relationshipChange}.`,
                timedOut: true
            });
        }
        
        // Show date summary
        await this.showDateSummary();
    },
    
    /**
     * Show date summary screen
     */
    async showDateSummary() {
        const character = this.state.selectedCharacter;
        const location = this.state.selectedLocation;
        const relationshipChange = this.state.relationshipChange;
        
        // Calculate date duration in minutes
        const startTime = this.state.dateStartTime;
        const endTime = this.state.dateEndTime;
        const durationMs = endTime - startTime;
        const durationMinutes = Math.round(durationMs / 60000);
        
        // Generate date feedback
        try {
            const prompt = `Generate a brief summary (2-3 sentences) of how the date went between the player and ${character.name} at ${location.name}.
            The date lasted ${formatDateDuration(durationMinutes)}.
            The relationship changed by ${relationshipChange} points during the date.
            Current relationship level: ${getRelationshipLevel(Memory.getRelationshipScore(character.id))}
            
            Make the summary sound like it's coming from a dating sim narrator, focusing on:
            1. The character's impression of the player
            2. How the location affected the mood
            3. A hint about what might happen next in their relationship`;
            
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });
            
            const feedback = completion.content;
            
            // Update summary screen
            await updateSummaryScreen(character, relationshipChange, feedback);
            
        } catch (error) {
            debugLog('Error generating date summary:', error);
            
            // Fallback feedback
            let fallbackFeedback = `Your date with ${character.name} at ${location.name} lasted ${formatDateDuration(durationMinutes)}. `;
            
            if (relationshipChange > 3) {
                fallbackFeedback += "It seems like they really enjoyed spending time with you!";
            } else if (relationshipChange > 0) {
                fallbackFeedback += "They seemed to have a pleasant time with you.";
            } else if (relationshipChange === 0) {
                fallbackFeedback += "The date was relatively uneventful.";
            } else {
                fallbackFeedback += "Things didn't go particularly well this time.";
            }
            
            await updateSummaryScreen(character, relationshipChange, fallbackFeedback);
        }
        
        showScreen('summaryScreen');
    },
    
    /**
     * Move to a different location during the date
     */
    moveLocation() {
        // Save state so we can return
        this.state.previousLocation = this.state.selectedLocation;
        
        // Stop current dialogue and timer
        TTS.stop();
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        
        // Show location selection screen
        showScreen('locationSelect');
        
        // Update UI to indicate we're changing locations
        UI.elements.backToCharacters.classList.add('hidden');
        
        // Add a special button to go back to the date screen
        const backToDateBtn = document.createElement('button');
        backToDateBtn.textContent = 'Return to Current Date';
        backToDateBtn.className = 'back-button';
        backToDateBtn.style.right = '20px';
        backToDateBtn.style.left = 'auto';
        
        backToDateBtn.addEventListener('click', () => {
            // Restore previous location
            this.state.selectedLocation = this.state.previousLocation;
            
            // Restore date screen
            showScreen('dateScreen');
            setupDateScreen(this.state.selectedCharacter, this.state.selectedLocation);
            
            // Restart timer
            this.startTimer();
            
            // Generate dialogue about returning
            this.state.currentResponse = "I wanted to come back here.";
            this.generateDialogue();
            
            // Clean up
            backToDateBtn.remove();
            UI.elements.backToCharacters.classList.remove('hidden');
        });
        
        document.getElementById('location-select').appendChild(backToDateBtn);
    },
    
    /**
     * Reset all game progress
     */
    resetProgress() {
        Memory.resetProgress();
        
        // Reload character selection
        this.loadCharacters();
        
        // Return to main menu
        showScreen('mainMenu');
    }
};

