// Memory and state management for Heart Strings

/**
 * Manages game state persistence and character memories
 */
const Memory = {
    // Current game state
    gameState: {
        settings: {
            ttsEnabled: CONFIG.defaultTtsEnabled,
            voiceSpeed: CONFIG.defaultVoiceSpeed,
            voiceVolume: CONFIG.defaultVoiceVolume,
            textSpeed: CONFIG.defaultTextSpeed
        },
        characters: {} // Will be populated with character relationship data
    },
    
    /**
     * Initialize memory system
     */
    init() {
        this.loadSavedData();
        
        // Initialize characters if not present in saved data
        CHARACTERS.forEach(character => {
            if (!this.gameState.characters[character.id]) {
                this.gameState.characters[character.id] = {
                    relationship: character.initialRelationship,
                    locations: {},
                    lastInteraction: null
                };
            }
        });
        
        debugLog('Memory system initialized', this.gameState);
    },
    
    /**
     * Load saved game data from localStorage
     */
    loadSavedData() {
        try {
            const savedData = localStorage.getItem(CONFIG.saveDataKey);
            if (savedData) {
                this.gameState = JSON.parse(savedData);
                debugLog('Loaded saved data', this.gameState);
            }
        } catch (error) {
            debugLog('Error loading saved data', error);
            // Use default state if loading fails
        }
    },
    
    /**
     * Save game state to localStorage
     */
    saveGameState() {
        try {
            localStorage.setItem(CONFIG.saveDataKey, JSON.stringify(this.gameState));
            debugLog('Game state saved');
        } catch (error) {
            debugLog('Error saving game state', error);
        }
    },
    
    /**
     * Get relationship score for a character
     * @param {string} characterId - Character ID
     * @returns {number} Relationship score (0-100)
     */
    getRelationshipScore(characterId) {
        return this.gameState.characters[characterId]?.relationship || 0;
    },
    
    /**
     * Update relationship score for a character
     * @param {string} characterId - Character ID
     * @param {number} change - Points to add/subtract
     * @returns {number} New relationship score
     */
    updateRelationship(characterId, change) {
        const current = this.getRelationshipScore(characterId);
        let newScore = current + change;
        
        // Constrain between 0 and 100
        newScore = Math.max(0, Math.min(100, newScore));
        
        this.gameState.characters[characterId].relationship = newScore;
        this.saveGameState();
        
        return newScore;
    },
    
    /**
     * Save a memory of an interaction at a specific location
     * @param {string} characterId - Character ID
     * @param {string} locationId - Location ID
     * @param {Object} memory - Memory data to save
     */
    saveInteraction(characterId, locationId, memory) {
        // Initialize location memory if not exists
        if (!this.gameState.characters[characterId].locations[locationId]) {
            this.gameState.characters[characterId].locations[locationId] = {
                visits: 0,
                conversations: []
            };
        }
        
        const locationMemory = this.gameState.characters[characterId].locations[locationId];
        
        // Increment visit count
        locationMemory.visits++;
        
        // Add conversation to memory
        locationMemory.conversations.push({
            timestamp: Date.now(),
            ...memory
        });
        
        // Limit conversation history to prevent excessive storage
        if (locationMemory.conversations.length > 20) {
            locationMemory.conversations = locationMemory.conversations.slice(-20);
        }
        
        // Update last interaction
        this.gameState.characters[characterId].lastInteraction = {
            locationId,
            timestamp: Date.now()
        };
        
        this.saveGameState();
    },
    
    /**
     * Get all memories for a character across all locations
     * @param {string} characterId - Character ID
     * @returns {Array} Array of memory objects
     */
    getAllMemories(characterId) {
        const character = this.gameState.characters[characterId];
        if (!character) return [];
        
        const memories = [];
        
        // Collect all location conversations
        Object.entries(character.locations).forEach(([locationId, locationData]) => {
            const location = LOCATIONS.find(l => l.id === locationId);
            if (location) {
                locationData.conversations.forEach(conv => {
                    memories.push({
                        locationName: location.name,
                        locationId,
                        ...conv
                    });
                });
            }
        });
        
        // Sort by timestamp
        memories.sort((a, b) => a.timestamp - b.timestamp);
        
        return memories;
    },
    
    /**
     * Get memories for a character at a specific location
     * @param {string} characterId - Character ID
     * @param {string} locationId - Location ID
     * @returns {Object} Location memory data
     */
    getLocationMemories(characterId, locationId) {
        return this.gameState.characters[characterId]?.locations[locationId] || { visits: 0, conversations: [] };
    },
    
    /**
     * Format memories for use in AI prompt
     * @param {string} characterId - Character ID
     * @returns {string} Formatted memory string
     */
    getFormattedMemories(characterId) {
        const memories = this.getAllMemories(characterId);
        if (memories.length === 0) return "This is your first meeting with the player.";
        
        let result = "";
        
        // Group by location
        const locationGroups = {};
        memories.forEach(memory => {
            if (!locationGroups[memory.locationId]) {
                locationGroups[memory.locationId] = [];
            }
            locationGroups[memory.locationId].push(memory);
        });
        
        // Format each location's memories
        Object.entries(locationGroups).forEach(([locationId, memories]) => {
            const locationName = memories[0].locationName;
            result += `At ${locationName}:\n`;
            
            memories.forEach(memory => {
                const date = new Date(memory.timestamp);
                result += `- On ${date.toLocaleDateString()}: ${memory.summary}\n`;
            });
            
            result += "\n";
        });
        
        return result;
    },
    
    /**
     * Reset all game progress
     */
    resetProgress() {
        CHARACTERS.forEach(character => {
            this.gameState.characters[character.id] = {
                relationship: character.initialRelationship,
                locations: {},
                lastInteraction: null
            };
        });
        
        this.saveGameState();
        debugLog('All progress reset');
    },
    
    /**
     * Get user settings
     * @returns {Object} User settings
     */
    getSettings() {
        return this.gameState.settings;
    },
    
    /**
     * Update user settings
     * @param {Object} settings - New settings object
     */
    updateSettings(settings) {
        this.gameState.settings = {
            ...this.gameState.settings,
            ...settings
        };
        this.saveGameState();
    }
};

