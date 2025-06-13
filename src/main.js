// Main entry point for CodeRunner game
import { Game } from './core/Game.js';

// Initialize and start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 main.js DOMContentLoaded event fired');
    const game = new Game();
    
    // Make game instance available globally for leaderboard cleanup
    window.gameInstance = game;
    
    // Connect global audio system to game instance
    if (window.audioSystem) {
        console.log('🎵 Connecting audioSystem to game immediately');
        game.audioSystem = window.audioSystem;
    } else {
        // Wait for audio system to be initialized
        console.log('🎵 AudioSystem not ready, setting up delayed connection');
        const checkAudioSystem = () => {
            if (window.audioSystem) {
                console.log('🎵 Connecting audioSystem to game after delay');
                game.audioSystem = window.audioSystem;
            } else {
                setTimeout(checkAudioSystem, 50);
            }
        };
        checkAudioSystem();
    }    // Connect general settings to game instance
    if (window.generalSettings) {
        console.log('⚙️ Connecting generalSettings to game immediately');
        const fpsEnabled = window.generalSettings.isShowFpsCounterEnabled();
        console.log('⚙️ FPS counter enabled from settings:', fpsEnabled);
        game.showFpsCounter = fpsEnabled;
        game.initializeGraphicsSettings(); // Refresh graphics settings
    } else {
        // Wait for general settings to be initialized
        console.log('⚙️ GeneralSettings not ready, setting up delayed connection');
        const checkGeneralSettings = () => {
            if (window.generalSettings) {
                console.log('⚙️ Connecting generalSettings to game after delay');
                const fpsEnabled = window.generalSettings.isShowFpsCounterEnabled();
                console.log('⚙️ FPS counter enabled from settings (delayed):', fpsEnabled);
                game.showFpsCounter = fpsEnabled;
                game.initializeGraphicsSettings(); // Refresh graphics settings
            } else {
                setTimeout(checkGeneralSettings, 50);
            }
        };
        checkGeneralSettings();
    }
    
    console.log('🎮 Game initialization completed');
});
