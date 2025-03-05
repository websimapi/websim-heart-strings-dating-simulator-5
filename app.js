// Main application file for Heart Strings

/**
 * Initialize application
 */
function initApp() {
    // Check browser support
    const supportStatus = checkBrowserSupport();
    if (!supportStatus.localStorage) {
        alert('Your browser does not support localStorage, which is required for saving game progress.');
        return;
    }
    
    // Initialize memory system
    Memory.init();
    
    // Initialize TTS
    TTS.init();
    
    // Initialize UI
    initUI();
    
    // Apply settings
    const settings = Memory.getSettings();
    UI.settings.ttsToggle.checked = settings.ttsEnabled;
    UI.settings.voiceSpeed.value = settings.voiceSpeed;
    UI.settings.voiceSpeedValue.textContent = settings.voiceSpeed.toFixed(1);
    UI.settings.voiceVolume.value = settings.voiceVolume;
    UI.settings.voiceVolumeValue.textContent = settings.voiceVolume.toFixed(1);
    UI.settings.textSpeed.value = settings.textSpeed;
    UI.settings.textSpeedValue.textContent = settings.textSpeed;
    
    // Hide loading screen and show main menu after a slight delay
    setTimeout(() => {
        UI.screens.loading.classList.add('hidden');
        UI.screens.mainMenu.classList.remove('hidden');
    }, 1500);
    
    // Log initialization
    debugLog('Application initialized');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

