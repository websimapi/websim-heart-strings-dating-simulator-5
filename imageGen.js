// Image generation for Heart Strings

/**
 * Generates an image for a character
 * @param {Object} character - Character object
 * @returns {Promise<string>} Promise resolving to image URL
 */
async function generateCharacterImage(character) {
    const cachedImage = getImageFromCache(`character-${character.id}`);
    if (cachedImage) {
        return cachedImage;
    }
    
    try {
        const result = await websim.imageGen({
            prompt: character.imagePrompt,
            seed: character.imageSeed,
            width: CONFIG.characterImageSize.width,
            height: CONFIG.characterImageSize.height
        });
        
        if (result && result.url) {
            saveImageToCache(`character-${character.id}`, result.url);
            return result.url;
        } else {
            throw new Error("Image generation failed");
        }
    } catch (error) {
        debugLog('Error generating character image:', error);
        // Return a fallback or retry
        return await retryImageGeneration('character', character);
    }
}

/**
 * Generates an image for a location
 * @param {Object} location - Location object
 * @returns {Promise<string>} Promise resolving to image URL
 */
async function generateLocationImage(location) {
    const cachedImage = getImageFromCache(`location-${location.id}`);
    if (cachedImage) {
        return cachedImage;
    }
    
    try {
        const result = await websim.imageGen({
            prompt: location.imagePrompt,
            seed: location.imageSeed,
            width: CONFIG.locationImageSize.width,
            height: CONFIG.locationImageSize.height
        });
        
        if (result && result.url) {
            saveImageToCache(`location-${location.id}`, result.url);
            return result.url;
        } else {
            throw new Error("Image generation failed");
        }
    } catch (error) {
        debugLog('Error generating location image:', error);
        // Return a fallback or retry
        return await retryImageGeneration('location', location);
    }
}

/**
 * Retries image generation with slight prompt modifications
 * @param {string} type - 'character' or 'location'
 * @param {Object} item - Character or location object
 * @returns {Promise<string>} Promise resolving to image URL
 */
async function retryImageGeneration(type, item) {
    let prompt = item.imagePrompt;
    let seed = item.imageSeed;
    
    // Try different seeds and slightly modified prompts
    for (let i = 0; i < CONFIG.imageGenRetries; i++) {
        try {
            // Modify seed slightly for each retry
            const newSeed = seed + (i + 1);
            
            // Add a retry indicator to the prompt
            const modifiedPrompt = `${prompt} (retry ${i + 1})`;
            
            const size = type === 'character' 
                ? CONFIG.characterImageSize 
                : CONFIG.locationImageSize;
            
            const result = await websim.imageGen({
                prompt: modifiedPrompt,
                seed: newSeed,
                width: size.width,
                height: size.height
            });
            
            if (result && result.url) {
                saveImageToCache(`${type}-${item.id}`, result.url);
                return result.url;
            }
        } catch (error) {
            debugLog(`Retry ${i + 1} failed for ${type} image:`, error);
        }
        
        // Wait briefly before retry
        await delay(500);
    }
    
    // If all retries fail, return a placeholder
    return getPlaceholderImage(type);
}

/**
 * Gets a placeholder image URL for when generation fails
 * @param {string} type - 'character' or 'location'
 * @returns {string} Placeholder image data URL
 */
function getPlaceholderImage(type) {
    // Return SVG placeholders as data URLs
    if (type === 'character') {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0e6f6"/>
                <circle cx="256" cy="180" r="120" fill="#d3d3d3"/>
                <rect x="136" y="320" width="240" height="300" fill="#d3d3d3"/>
                <text x="256" y="430" font-size="24" text-anchor="middle" fill="#666">Character image unavailable</text>
            </svg>`
        )}`;
    } else {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg width="1024" height="576" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f0e6f6"/>
                <rect x="100" y="100" width="824" height="376" fill="#d3d3d3" stroke="#999" stroke-width="2"/>
                <text x="512" y="288" font-size="32" text-anchor="middle" fill="#666">Location image unavailable</text>
            </svg>`
        )}`;
    }
}

/**
 * Save an image URL to cache
 * @param {string} key - Cache key
 * @param {string} url - Image URL
 */
function saveImageToCache(key, url) {
    try {
        localStorage.setItem(`img_${key}`, url);
    } catch (error) {
        debugLog('Error saving image to cache:', error);
    }
}

/**
 * Get an image URL from cache
 * @param {string} key - Cache key
 * @returns {string|null} Image URL or null if not found
 */
function getImageFromCache(key) {
    try {
        return localStorage.getItem(`img_${key}`);
    } catch (error) {
        debugLog('Error getting image from cache:', error);
        return null;
    }
}

