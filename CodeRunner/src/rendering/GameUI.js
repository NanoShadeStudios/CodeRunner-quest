/**
 * GameUI - Handles all UI rendering functionality separate from core game logic
 */

import { GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';

export class GameUI {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        
        // Store references to DOM UI elements if needed
        this.uiScore = document.getElementById('score');
        this.uiBest = document.getElementById('best-distance');
        this.uiHealth = document.getElementById('health');
        
        // UI state
        this.purchaseEffects = [];
        this.resetDialogHitAreas = [];
        this.tabHitAreas = [];
    }
    
    /**
     * Draw all UI elements for the current game state
     */
    drawUI() {
        // Score display (moved lower to avoid overlapping with health hearts)
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = '16px Courier New';
        this.ctx.fillText(`Distance: ${this.game.score}m`, 15, 50);
        
        // Best distance
        if (this.game.bestDistance > 0) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText(`Best: ${this.game.bestDistance}m`, 15, 70);
        }
          
        // Health display
        if (this.game.player) {
            this.drawHealthHearts();
            
            // Show health regeneration timer based on difficulty
            if (this.game.player.health < this.game.player.maxHealth && this.game.lastHealthRegenTime) {
                const difficulty = DIFFICULTY_LEVELS[this.game.selectedDifficulty];
                
                // Skip display if no regeneration (Extreme mode)
                if (difficulty.healthRegenInterval > 0) {
                    const timeSinceLastRegen = Date.now() - this.game.lastHealthRegenTime;
                    const timeRemaining = Math.max(0, difficulty.healthRegenInterval - timeSinceLastRegen);
                    const secondsRemaining = Math.ceil(timeRemaining / 1000);
                    
                    this.ctx.fillStyle = '#8b949e';
                    this.ctx.font = '12px Courier New';
                    this.ctx.fillText(`Next ❤️: ${secondsRemaining}s`, 15, 90);
                }
            }
        }
          
        // Show difficulty level during gameplay
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            const difficulty = DIFFICULTY_LEVELS[this.game.selectedDifficulty];
            this.ctx.fillStyle = difficulty.color;
            this.ctx.font = '14px Courier New';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${difficulty.emoji} ${difficulty.name}`, 15, 110);
        }
          
        // Performance monitoring display (top right)
        if (this.game.showPerformanceDisplay) {
            this.drawPerformanceDisplay();
        }
        
        // Data packets display (right side, only during gameplay)
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            this.drawDataPacketsDisplay();
        }
          
        // F3 hint in bottom right corner (only during gameplay)
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            this.ctx.fillStyle = 'rgba(125, 133, 144, 0.6)';
            this.ctx.font = '10px "SF Mono", "Monaco", monospace';
            this.ctx.textAlign = 'right';
            this.ctx.fillText('F3: Performance', this.canvas.width - 10, this.canvas.height - 10);
            this.ctx.fillText('C: Changelog', this.canvas.width - 10, this.canvas.height - 25);
            this.ctx.textAlign = 'left';
        }
    }
    
    /**
     * Draw pixelated health hearts
     */
    drawHealthHearts() {
        const player = this.game.player;
        if (!player) return;
        
        const maxHearts = player.maxHealth;
        const currentHealth = player.health;
        const heartSize = 16;
        const spacing = 20;
        const startX = 15;
        const startY = 25;
        
        for (let i = 0; i < maxHearts; i++) {
            const isFilled = i < currentHealth;
            this.drawPixelHeart(startX + i * spacing, startY, heartSize, isFilled);
        }
    }
    
    /**
     * Draw a single pixelated heart
     */
    drawPixelHeart(x, y, size, filled) {
        const ctx = this.ctx;
        const pixelSize = size / 8;
        
        // Heart shape pattern (8x8 grid)
        //  01234567
        // 0 -##-##-
        // 1 ####### 
        // 2 #######
        // 3 #######
        // 4 -#####-
        // 5 --###--
        // 6 ---#---
        // 7 -------
        
        const heartPattern = [
            [0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,1,1,0,0],
            [0,0,0,1,0,0,0]
        ];
        
        // Colors for filled and empty hearts
        const fillColor = filled ? '#ff6b6b' : '#6e7681';
        const strokeColor = filled ? '#e54c4c' : '#484f58';
        
        // Draw each pixel of the heart
        for (let row = 0; row < heartPattern.length; row++) {
            for (let col = 0; col < heartPattern[row].length; col++) {
                if (heartPattern[row][col] === 1) {
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
                    
                    // Add a slight 3D effect with darker edges
                    ctx.fillStyle = strokeColor;
                    ctx.fillRect(x + col * pixelSize + pixelSize - 1, y + row * pixelSize, 1, pixelSize);
                    ctx.fillRect(x + col * pixelSize, y + row * pixelSize + pixelSize - 1, pixelSize, 1);
                }
            }
        }
    }
    
    /**
     * Draw performance monitoring display
     */
    drawPerformanceDisplay() {
        const metrics = this.game.getPerformanceMetrics();
        const x = this.canvas.width - 200;
        const y = 15;
        
        // Background panel
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
        this.ctx.fillRect(x - 10, y - 5, 190, 120);
        
        // Border
        this.ctx.strokeStyle = 'rgba(48, 54, 61, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 10, y - 5, 190, 120);
        
        // Title
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = 'bold 12px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Performance Monitor', x, y + 10);
        
        // FPS with color coding
        const fpsColor = metrics.fps >= 50 ? '#40d158' : metrics.fps >= 30 ? '#d1a01f' : '#f85149';
        this.ctx.fillStyle = fpsColor;
        this.ctx.font = '11px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`FPS: ${metrics.fps}`, x, y + 30);
        
        // Frame timing
        this.ctx.fillStyle = '#79c0ff';
        this.ctx.fillText(`Render: ${metrics.renderTime.toFixed(1)}ms`, x, y + 45);
        this.ctx.fillText(`Update: ${metrics.updateTime.toFixed(1)}ms`, x, y + 60);
        
        // Resolution
        this.ctx.fillStyle = '#7d8590';
        this.ctx.fillText(`Resolution: ${metrics.resolution}`, x, y + 75);
        
        // Game duration
        if (this.game.startTime > 0) {
            const gameTime = Math.floor((Date.now() - this.game.startTime) / 1000);
            const minutes = Math.floor(gameTime / 60);
            const seconds = gameTime % 60;
            this.ctx.fillText(`Time: ${minutes}m ${seconds}s`, x, y + 90);
        }
        
        // Memory usage (estimated)
        this.ctx.fillText('Memory: Optimized', x, y + 105);
    }
    
    /**
     * Draw data packets display on the right side
     */
    drawDataPacketsDisplay() {
        const dataPackets = this.game.upgradeSystem.getDataPackets();
        const x = this.canvas.width - 180;
        // Position below performance monitor if it's showing, otherwise at top
        const y = this.game.showPerformanceDisplay ? 155 : 15;
        
        // Background panel (increased height to accommodate shop text)
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
        this.ctx.fillRect(x - 10, y - 5, 170, 70);
        
        // Border with data theme color
        this.ctx.strokeStyle = 'rgba(64, 209, 88, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 10, y - 5, 170, 70);
        
        // Data packet icon (simple square representation)
        this.ctx.fillStyle = '#40d158';
        this.ctx.fillRect(x, y + 5, 12, 12);
        this.ctx.fillStyle = '#21262d';
        this.ctx.fillRect(x + 2, y + 7, 8, 8);
        this.ctx.fillStyle = '#40d158';
        this.ctx.fillRect(x + 4, y + 9, 4, 4);
        
        // Data packets text
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = 'bold 14px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Data Packets', x + 20, y + 15);
          
        // Count with color coding
        const countColor = dataPackets >= 100 ? '#ffd700' : dataPackets >= 50 ? '#40d158' : '#79c0ff';
        this.ctx.fillStyle = countColor;
        this.ctx.font = 'bold 16px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`${dataPackets}`, x + 20, y + 35);
        
        // Shop instruction text
        this.ctx.fillStyle = '#8b949e';
        this.ctx.font = '12px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Press S for Shop', x + 20, y + 55);
    }
    
    /**
     * Update HTML UI elements (if present)
     */
    updateUI() {
        if (this.uiScore) this.uiScore.textContent = this.game.score;
        if (this.uiBest) this.uiBest.textContent = this.game.bestDistance;
        if (this.uiHealth && this.game.player) this.uiHealth.textContent = this.game.player.health;
    }

    /**
     * Create a utility method to draw rounded rectangles
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
