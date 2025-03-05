// Utility functions for Heart Strings

/**
 * Gets a relationship level name based on score
 * @param {number} score - Relationship score (0-100)
 * @returns {string} Relationship level name
 */
function getRelationshipLevel(score) {
    const levels = CONFIG.relationshipLevels;
    for (const level of levels) {
        if (score >= level.min && score <= level.max) {
            return level.name;
        }
    }
    return levels[0].name; // Default to first level if out of range
}

/**
 * Formats time in minutes:seconds
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string (MM:SS)
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a relationship change value for display
 * @param {number} change - Relationship change value
 * @returns {string} Formatted string with + or - prefix
 */
function formatRelationshipChange(change) {
    if (change > 0) {
        return `+${change}`;
    }
    return `${change}`;
}

/**
 * Formats a date duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
function formatDateDuration(minutes) {
    if (minutes < 1) {
        return "less than a minute";
    } else if (minutes === 1) {
        return "1 minute";
    } else {
        return `${minutes} minutes`;
    }
}

/**
 * Creates a delay using Promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Animates text typing effect
 * @param {Element} element - DOM element to add text to
 * @param {string} text - Text to animate
 * @param {number} speed - Speed of typing (words per minute)
 * @returns {Promise} Promise that resolves when animation is complete
 */
async function typeText(element, text, speed = CONFIG.defaultTextSpeed) {
    return new Promise(resolve => {
        element.textContent = '';
        
        // Calculate delay between characters based on speed (words per minute)
        // Assuming average word length of 5 characters + 1 space
        const charsPerMinute = speed * 6;
        const msPerChar = 60000 / charsPerMinute;
        
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                resolve();
            }
        }, msPerChar);
    });
}

/**
 * Checks if the required browser features are supported
 * @returns {Object} Object with support status for each feature
 */
function checkBrowserSupport() {
    return {
        speechSynthesis: 'speechSynthesis' in window,
        localStorage: !!window.localStorage,
        fetch: !!window.fetch
    };
}

/**
 * Logs debug messages if debug mode is enabled
 * @param {...any} args - Arguments to log
 */
function debugLog(...args) {
    if (CONFIG.debugMode) {
        console.log('[Debug]', ...args);
    }
}

