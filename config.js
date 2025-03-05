const CONFIG = {
    // General settings
    appName: "Heart Strings",
    saveDataKey: "heartStringsData",
    
    // Relationship settings
    relationshipLevels: [
        { name: "Strangers", min: 0, max: 19 },
        { name: "Acquaintances", min: 20, max: 39 },
        { name: "Friends", min: 40, max: 59 },
        { name: "Close Friends", min: 60, max: 79 },
        { name: "Dating", min: 80, max: 100 }
    ],
    
    // Response effect values
    responseEffects: {
        veryPositive: 5,
        positive: 3,
        neutral: 1,
        negative: -2
    },
    
    // Date settings
    minDateDuration: 1, // minutes
    maxDateDuration: 15, // minutes
    
    // Image generation settings
    imageGenRetries: 3,
    characterImageSize: { width: 512, height: 512 }, // 1:1 aspect ratio
    locationImageSize: { width: 1024, height: 576 }, // 16:9 aspect ratio
    
    // Text settings
    defaultTextSpeed: 50, // words per minute
    
    // TTS settings
    defaultTtsEnabled: true,
    defaultVoiceSpeed: 1.0,
    defaultVoiceVolume: 1.0,
    
    // System prompts
    characterPrompts: {
        baseSystemPrompt: `You are an AI playing the role of {characterName} in a dating simulator. 
        Respond as this character would, maintaining their personality, interests, and background consistently.
        Remember all previous interactions with the player across all locations.
        Current relationship level: {relationshipLevel}
        Current location: {locationName}
        Current date duration: {dateDuration} minutes
        
        Character profile:
        {characterProfile}
        
        Location description:
        {locationDescription}
        
        Conversation memory:
        {conversationMemory}
        
        Respond in first person as {characterName}, keeping responses relatively brief (1-3 sentences).`,
        
        endDatePrompt: `The player has chosen to end the date. 
        As {characterName}, provide a brief farewell response that reflects:
        1. How the date went (based on relationship change)
        2. Your feelings about the player
        3. A hint about looking forward to seeing them again (or not, if it went poorly)
        Keep it in character and appropriate to your current relationship level.`
    },
    
    // Debug settings
    debugMode: false
};

