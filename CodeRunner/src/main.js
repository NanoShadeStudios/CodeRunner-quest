// Main entry point for CodeRunner game
import { Game } from './core/Game.js';

// Initialize and start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Make game instance available globally for leaderboard cleanup
    window.gameInstance = game;
});
