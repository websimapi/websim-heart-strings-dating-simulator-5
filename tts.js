// Text-to-Speech functionality for Heart Strings

/**
 * Text-to-Speech manager
 */
const TTS = {
    // State
    enabled: CONFIG.defaultTtsEnabled,
    rate: CONFIG.defaultVoiceSpeed,
    volume: CONFIG.defaultVoiceVolume,
    currentUtterance: null,
    voiceMap: {}, // Maps character IDs to voice objects
    
    /**
     * Initialize TTS system
     */
    init() {
        // Check if browser supports speech synthesis
        if (!('speechSynthesis' in window)) {
            this.enabled = false;
            debugLog('Speech synthesis not supported in this browser');
            return;
        }
        
        // Load settings
        const settings = Memory.getSettings();
        this.enabled = settings.ttsEnabled;
        this.rate = settings.voiceSpeed;
        this.volume = settings.voiceVolume;
        
        // Initialize voice map when voices are loaded
        this.initVoices();
        
        // Handle delayed voice loading in some browsers
        window.speechSynthesis.onvoiceschanged = () => {
            this.initVoices();
        };
        
        debugLog('TTS system initialized');
    },
    
    /**
     * Initialize voice mapping for characters
     */
    initVoices() {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;
        
        const femaleVoices = voices.filter(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('girl')
        );
        
        const maleVoices = voices.filter(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('boy')
        );
        
        const defaultVoice = voices[0];
        const femaleVoice = femaleVoices.length > 0 ? femaleVoices[0] : defaultVoice;
        const maleVoice = maleVoices.length > 0 ? maleVoices[0] : defaultVoice;
        
        // Assign voices based on character gender
        CHARACTERS.forEach(character => {
            if (character.gender === 'female') {
                // Find a consistent voice based on character ID
                const index = character.id.charCodeAt(0) % Math.max(1, femaleVoices.length);
                this.voiceMap[character.id] = femaleVoices[index] || femaleVoice;
            } else {
                // Find a consistent voice based on character ID
                const index = character.id.charCodeAt(0) % Math.max(1, maleVoices.length);
                this.voiceMap[character.id] = maleVoices[index] || maleVoice;
            }
        });
        
        debugLog('Voice mapping initialized', this.voiceMap);
    },
    
    /**
     * Speak text as a character
     * @param {string} characterId - Character ID
     * @param {string} text - Text to speak
     * @returns {Promise} Promise that resolves when speech is complete
     */
    speak(characterId, text) {
        return new Promise((resolve) => {
            if (!this.enabled || !('speechSynthesis' in window)) {
                resolve();
                return;
            }
            
            // Cancel any current speech
            this.stop();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice
            if (this.voiceMap[characterId]) {
                utterance.voice = this.voiceMap[characterId];
            }
            
            // Set parameters
            utterance.rate = this.rate;
            utterance.volume = this.volume;
            
            // Event handlers
            utterance.onend = () => {
                this.currentUtterance = null;
                resolve();
            };
            
            utterance.onerror = (event) => {
                debugLog('TTS error:', event);
                this.currentUtterance = null;
                resolve();
            };
            
            // Save reference and speak
            this.currentUtterance = utterance;
            window.speechSynthesis.speak(utterance);
        });
    },
    
    /**
     * Stop current speech
     */
    stop() {
        if (this.currentUtterance) {
            window.speechSynthesis.cancel();
            this.currentUtterance = null;
        }
    },
    
    /**
     * Enable or disable TTS
     * @param {boolean} enabled - Whether TTS should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        Memory.updateSettings({ ttsEnabled: enabled });
        
        if (!enabled) {
            this.stop();
        }
    },
    
    /**
     * Set speech rate
     * @param {number} rate - Speech rate (0.5-2.0)
     */
    setRate(rate) {
        this.rate = rate;
        Memory.updateSettings({ voiceSpeed: rate });
    },
    
    /**
     * Set speech volume
     * @param {number} volume - Speech volume (0-1)
     */
    setVolume(volume) {
        this.volume = volume;
        Memory.updateSettings({ voiceVolume: volume });
    }
};

