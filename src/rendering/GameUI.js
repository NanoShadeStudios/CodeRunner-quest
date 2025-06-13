/**
 * GameUI - Handles all UI rendering functionality separate from core game logic
 */

import { GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';

export class GameUI {    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        
        // Store references to DOM UI elements if needed
        this.uiScore = document.getElementById('score');
        this.uiBest = document.getElementById('bestScore');
        this.uiHealth = document.getElementById('health');
        
        // UI state
        this.purchaseEffects = [];
        this.resetDialogHitAreas = [];
        this.tabHitAreas = [];    }

    /**
     * Draw all UI elements for the current game state
     */
    drawUI() {
        // Health display
        if (this.game.player) {
            this.drawHealthHearts();              // Show health regeneration timer based on difficulty
            if (this.game.player.health < this.game.player.maxHealth && this.game.lastHealthRegenTime) {
                const difficulty = DIFFICULTY_LEVELS[this.game.selectedDifficulty];
                
                // Skip display if no regeneration (Extreme mode)
                if (difficulty.healthRegenInterval > 0) {
                    const timeSinceLastRegen = Date.now() - this.game.lastHealthRegenTime;
                    const timeRemaining = Math.max(0, difficulty.healthRegenInterval - timeSinceLastRegen);
                    const secondsRemaining = Math.ceil(timeRemaining / 1000);
                      this.ctx.fillStyle = '#8b949e';
                    this.ctx.font = '12px Courier New';
                    this.ctx.fillText(`Next Heart: ${secondsRemaining}s`, 15, 90);
                }
            }
        }
            // Show difficulty level during gameplay (positioned on right side)
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            const difficulty = DIFFICULTY_LEVELS[this.game.selectedDifficulty];
            this.ctx.fillStyle = difficulty.color;
            this.ctx.font = '14px Courier New';
            this.ctx.textAlign = 'left';
            const x = this.canvas.width - 180; // Right side, aligned with data packets
            this.ctx.fillText(`${difficulty.emoji} ${difficulty.name}`, x, 110);
        }

        // Autosave status indicator (top right corner during gameplay)
        if ((this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) && 
            this.game.showAutosaveIndicator && this.game.autosaveStatus) {
            this.drawAutosaveIndicator();
        }
            // Performance monitoring display (top right)
        if (this.game.showPerformanceDisplay) {
            this.drawPerformanceDisplay();
        }        // Simple FPS counter (if enabled in settings)
        if (this.game.showFpsCounter) {
            this.drawSimpleFpsCounter();
        }
          // Data packets display (right side, only during gameplay)
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            this.drawDataPacketsDisplay();
        }

        // Basic score display (left side, only during gameplay)
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            this.drawScoreDisplay();
        }
            // F3 hint in bottom right corner (only during gameplay)
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            this.ctx.fillStyle = 'rgba(125, 133, 144, 0.6)';
            this.ctx.font = '10px "SF Mono", "Monaco", monospace';
            this.ctx.textAlign = 'right';            this.ctx.fillText(`F3: Performance Monitor`, this.canvas.width - 10, this.canvas.height - 10);
            this.ctx.fillText(`C: Changelog`, this.canvas.width - 10, this.canvas.height - 25);
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
        this.ctx.fillRect(x - 10, y - 5, 190, 130);
        
        // Border
        this.ctx.strokeStyle = 'rgba(48, 54, 61, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 10, y - 5, 190, 130);        // Title
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = 'bold 12px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Performance Monitor', x, y + 10);
          // FPS with color coding (current and average)
        const fpsColor = metrics.fps >= 50 ? '#40d158' : metrics.fps >= 30 ? '#d1a01f' : '#f85149';
        this.ctx.fillStyle = fpsColor;
        this.ctx.font = '11px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`FPS: ${metrics.fps} (Avg: ${metrics.avgFps})`, x, y + 30);
        
        // Frame timing with throttled updates
        this.ctx.fillStyle = '#79c0ff';        this.ctx.fillText(`Render: ${metrics.renderTime.toFixed(1)}ms`, x, y + 45);
        this.ctx.fillText(`Update: ${metrics.updateTime.toFixed(1)}ms`, x, y + 60);
        this.ctx.fillText(`Frame: ${metrics.frameTime.toFixed(1)}ms`, x, y + 75);
        
        // World metrics (entities and chunks)
        this.ctx.fillStyle = '#ffd700';        this.ctx.fillText(`Entities: ${metrics.entities}`, x, y + 90);
        this.ctx.fillText(`Chunks: ${metrics.chunks}`, x, y + 105);
        
        // Resolution and memory
        this.ctx.fillStyle = '#7d8590';
        this.ctx.fillText(`Resolution: ${metrics.resolution}`, x, y + 120);
        
        // Show throttling indicator
        this.ctx.fillStyle = '#40d158';
        this.ctx.font = '9px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`🔧 Optimized Monitoring`, x, y + 135);
    }    /**
     * Draw simple FPS counter (compact display)
     */
    drawSimpleFpsCounter() {
        const metrics = this.game.getPerformanceMetrics();
        
        // Position in bottom-left corner to avoid all UI conflicts
        const x = 15;
        const y = this.canvas.height - 30; // Bottom of screen, above F3 hints
        
        // Save current context state
        this.ctx.save();
        
        // FPS with color coding (no background rectangle)
        const fpsColor = metrics.fps >= 50 ? '#40d158' : metrics.fps >= 30 ? '#d1a01f' : '#f85149';
          this.ctx.fillStyle = fpsColor;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`FPS: ${metrics.fps}`, x, y);
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Draw data packets display on the right side
     */drawDataPacketsDisplay() {
        const dataPackets = this.game.upgradeSystem ? this.game.upgradeSystem.getDataPackets() : 0;
        const x = this.canvas.width - 180;
        // Position below performance monitor if it's showing, otherwise at top
        const y = this.game.showPerformanceDisplay ? 155 : 15;
          // Background panel
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
        this.ctx.fillRect(x - 10, y - 5, 170, 50);
        
        // Border with data theme color
        this.ctx.strokeStyle = 'rgba(64, 209, 88, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 10, y - 5, 170, 50);
          // Glitch icon (electrical/digital representation)
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(x, y + 5, 12, 12);
        this.ctx.fillStyle = '#21262d';
        this.ctx.fillRect(x + 2, y + 7, 8, 8);
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(x + 4, y + 9, 4, 4);        // Data Packets text
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = 'bold 14px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Data Packets', x + 20, y + 15);
            // Count with color coding
        const countColor = dataPackets >= 100 ? '#ffd700' : dataPackets >= 50 ? '#40d158' : '#79c0ff';
        this.ctx.fillStyle = countColor;
        this.ctx.font = 'bold 16px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`${dataPackets}`, x + 20, y + 35);}

    /**
     * Draw basic score display on the left side
     */
    drawScoreDisplay() {
        const x = 15;
        const y = 100; // Position below health hearts
        
        // Background panel
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
        this.ctx.fillRect(x - 5, y - 5, 140, 60);
        
        // Border
        this.ctx.strokeStyle = 'rgba(88, 166, 255, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 5, y - 5, 140, 60);        // Current score
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = 'bold 14px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Score', x, y + 15);
        
        this.ctx.fillStyle = '#79c0ff';
        this.ctx.font = 'bold 16px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`${this.game.score}`, x, y + 35);
        
        // Best score for current difficulty
        const bestScore = this.game.bestScores[this.game.selectedDifficulty] || 0;
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = 'bold 12px "SF Mono", "Monaco", monospace';
        this.ctx.fillText('Best', x, y + 50);
        
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 14px "SF Mono", "Monaco", monospace';
        this.ctx.fillText(`${bestScore}`, x + 35, y + 50);
    }
    
    /**
     * Update HTML UI elements (if present)
     */updateUI() {
        if (this.uiScore) this.uiScore.textContent = this.game.score;
        if (this.uiBest) {
            const difficultyBestScore = this.game.bestScores[this.game.selectedDifficulty] || 0;
            this.uiBest.textContent = difficultyBestScore;
        }
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
    }    /**
     * Draw autosave status indicator
     */
    drawAutosaveIndicator() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Position in top-right corner
        const x = canvas.width - 20;
        const y = 30;
        
        // Set text alignment
        ctx.textAlign = 'right';
        ctx.font = '12px Courier New';        // Status-specific styling
        switch (this.game.autosaveStatus) {
            case 'saving':
                ctx.fillStyle = '#f1c232';
                ctx.fillText(`💾 Saving...`, x, y);
                break;
            case 'saved':
                ctx.fillStyle = '#56d364';
                ctx.fillText(`✓ Game Saved`, x, y);
                
                // Show optimization stats if available (debug info)
                if (this.game.savesPrevented > 0 && window.debugMode) {
                    ctx.font = '10px Courier New';
                    ctx.fillStyle = '#7c3aed';
                    ctx.fillText(`⚡ ${this.game.savesPrevented} saves skipped`, x, y + 15);
                    ctx.font = '12px Courier New';
                }
                break;            case 'error':
                ctx.fillStyle = '#f85149';
                ctx.fillText(`⚠ Save Error`, x, y);
                break;            case 'loaded':
                ctx.fillStyle = '#58a6ff';
                ctx.fillText(`📂 Game Loaded`, x, y);
                break;
        }
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }

    /**
     * Draw enhanced score panel with detailed information
     */
    drawEnhancedScorePanel() {
        const ctx = this.ctx;
        const panelWidth = 280;
        const panelHeight = 150;
        const panelX = 15;
        const panelY = 15;
        
        // Panel background with modern design
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.95)');
        gradient.addColorStop(1, 'rgba(21, 32, 43, 0.90)');
        ctx.fillStyle = gradient;
        this.drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 8);
        ctx.fill();
        
        // Panel border with game theme
        ctx.strokeStyle = 'rgba(88, 166, 255, 0.6)';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 8);
        ctx.stroke();
          // Calculate various score metrics
        const currentScore = this.game.score;
        const difficultyBestScore = this.game.bestScores[this.game.selectedDifficulty] || 0;const totalPlayTime = this.game.startTime > 0 ? Math.floor((Date.now() - this.game.startTime) / 1000) : 0;
        const bonuses = this.game.upgradeSystem ? this.game.upgradeSystem.getBonuses() : { jumpHeight: 0, scoreMultiplier: 1.0, powerUpDuration: 0 };
        const dataPackets = this.game.upgradeSystem ? this.game.upgradeSystem.getDataPackets() : 0;
        const difficulty = DIFFICULTY_LEVELS[this.game.selectedDifficulty];        // Panel title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`📊 Game Statistics`, panelX + 10, panelY + 20);
        
        let yOffset = panelY + 45;
        const lineHeight = 16;
        const leftCol = panelX + 10;
        const rightCol = panelX + 150;        // Current score with progress indicator
        ctx.font = '13px Courier New';
        ctx.fillStyle = '#58a6ff';
        ctx.fillText(`Score:`, leftCol, yOffset);
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 13px Courier New';
        ctx.fillText(`${currentScore}`, rightCol, yOffset);
        
        // Best score comparison
        yOffset += lineHeight;
        ctx.font = '13px Courier New';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`Best:`, leftCol, yOffset);if (difficultyBestScore > 0) {
            const isNewRecord = currentScore > difficultyBestScore;
            ctx.fillStyle = isNewRecord ? '#40d158' : '#ffd700';
            ctx.font = isNewRecord ? 'bold 13px Courier New' : '13px Courier New';
            ctx.fillText(`${difficultyBestScore}${isNewRecord ? ' ⬆️' : ''}`, rightCol, yOffset);        } else {
            ctx.fillStyle = '#8b949e';
            ctx.fillText('No Record', rightCol, yOffset);
        }
          // Play time
        yOffset += lineHeight;
        ctx.font = '13px Courier New';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(`Time:`, leftCol, yOffset);
        ctx.fillStyle = '#f0f6fc';
        const minutes = Math.floor(totalPlayTime / 60);
        const seconds = totalPlayTime % 60;
        ctx.fillText(`${minutes}m ${seconds}s`, rightCol, yOffset);
          // Speed/pace indicator
        yOffset += lineHeight;
        ctx.fillStyle = '#f97316';
        ctx.fillText(`${this.t('pace')}:`, leftCol, yOffset);
        ctx.fillStyle = '#f0f6fc';        const pace = totalPlayTime > 0 ? (currentScore / totalPlayTime * 60).toFixed(1) : '0.0';
        ctx.fillText(`${pace}/${this.t('min')}`, rightCol, yOffset);
          // Score multiplier from upgrades
        yOffset += lineHeight;
        ctx.fillStyle = '#40d158';
        ctx.fillText(`${this.t('multiplier')}:`, leftCol, yOffset);
        
        // Get score multiplier from player's shop upgrades
        const scoreMultiplier = (this.game.player && this.game.player.shopUpgrades.scoreMultiplier) || 1.0;
        
        ctx.fillStyle = scoreMultiplier > 1 ? '#40d158' : '#f0f6fc';
        ctx.font = scoreMultiplier > 1 ? 'bold 13px Courier New' : '13px Courier New';
        ctx.fillText(`${scoreMultiplier.toFixed(1)}x`, rightCol, yOffset);
        
        // Data packets earned
        yOffset += lineHeight;        ctx.font = '13px Courier New';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${this.t('packets')}:`, leftCol, yOffset);
        const packetColor = dataPackets >= 100 ? '#ffd700' : dataPackets >= 50 ? '#40d158' : '#58a6ff';
        ctx.fillStyle = packetColor;        ctx.fillText(`${dataPackets} 💾`, rightCol, yOffset);// Progress bar for score to next milestone (changed to 1000 score for data packet milestones)
        yOffset += lineHeight + 5;
        const nextMilestone = Math.ceil(currentScore / 1000) * 1000; // Use 1000 score intervals for data packet milestones
        const progress = nextMilestone > 0 ? (currentScore % 1000) / 1000 : 0;
          ctx.fillStyle = '#8b949e';
        ctx.font = '11px Courier New';
        ctx.fillText(`${this.t('nextDataPacketBonus')}: ${nextMilestone}`, leftCol, yOffset);
          // Show reward amount for next milestone (100 data packets per 1000 score)
        const nextReward = 100;
        
        ctx.fillStyle = '#40d158';
        ctx.font = '11px Courier New';
        ctx.fillText(`+${nextReward} 💾`, rightCol + 20, yOffset);
        
        // Progress bar
        const barWidth = panelWidth - 20;
        const barHeight = 6;
        const barY = yOffset + 5;
        
        // Progress bar background
        ctx.fillStyle = 'rgba(139, 148, 158, 0.3)';
        this.drawRoundedRect(ctx, leftCol, barY, barWidth, barHeight, 3);
        ctx.fill();
        
        // Progress bar fill
        if (progress > 0) {
            const progressGradient = ctx.createLinearGradient(leftCol, barY, leftCol + barWidth * progress, barY);
            progressGradient.addColorStop(0, '#40d158');
            progressGradient.addColorStop(1, '#ffd700');
            ctx.fillStyle = progressGradient;
            this.drawRoundedRect(ctx, leftCol, barY, barWidth * progress, barHeight, 3);
            ctx.fill();
        }    }
    
    /**
     * Draw dash cooldown indicator
     */    drawDashCooldown() {
        const player = this.game.player;
        if (!player) return;
        
        // SUPER VISIBLE DEBUG - Draw a big red rectangle to see if this function is called
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.canvas.width - 200, 50, 100, 50);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('DASH DEBUG', this.canvas.width - 190, 80);
        
        console.log('=== DASH COOLDOWN FUNCTION CALLED ===');
          // Debug: Log dash upgrade status
        console.log('Dash upgrades:', {
            dash: player.shopUpgrades.dash,
            dashModuleLevel: player.shopUpgrades.dashModuleLevel,
            hasDash: player.shopUpgrades.dash || player.shopUpgrades.dashModuleLevel > 0        });
        
        // Always show dash UI (basic dash should be available by default)
        // Note: Commenting out the upgrade check to always show dash UI
        // const hasDash = player.shopUpgrades.dash || player.shopUpgrades.dashModuleLevel > 0;
        // if (!hasDash) {
        //     return; // Don't show dash UI if no upgrades
        // }
        
        // Determine max cooldown based on dash type
        let maxCooldown = 2000; // Default for basic dash
        if (player.shopUpgrades.dashModuleLevel > 0) {
            const dashProperties = {
                1: 1500,  // Level 1: 1.5s
                2: 1200,  // Level 2: 1.2s  
                3: 900    // Level 3: 0.9s
            };
            maxCooldown = dashProperties[player.shopUpgrades.dashModuleLevel] || 2000;
        }
        
        const currentCooldown = Math.max(0, player.dashState.dashCooldown);
        const cooldownProgress = currentCooldown / maxCooldown;
        const isReady = currentCooldown <= 0;        // Position on the right side under difficulty indicator
        const x = this.canvas.width - 180; // Right side, aligned with data packets
        const y = 130; // Below difficulty area
          // DEBUG: Always show a test indicator to verify positioning
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = '12px Courier New';
        this.ctx.fillText('🔧 DASH UI TEST', x, y + 20);
        
        // ADD TEMPORARY TESTING CONTROLS
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '10px Courier New';
        this.ctx.fillText('Press T to give data packets, Y to buy basic dash', x, y + 35);
        
        // Only continue with full UI if player has dash ability
        if (!hasDash) return;        // Draw dash icon and label with enhanced styling
        if (isReady) {
            // Add pulsing glow effect when ready
            const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
            this.ctx.shadowColor = '#40d158';
            this.ctx.shadowBlur = 5 * pulseIntensity;
            this.ctx.fillStyle = '#40d158';
            this.ctx.font = 'bold 14px Courier New';
            this.ctx.fillText(`💨 ${this.t('ui.dash')}`, x, y);
            this.ctx.shadowBlur = 0; // Reset shadow
        } else {
            this.ctx.fillStyle = '#8b949e';
            this.ctx.font = '14px Courier New';
            this.ctx.fillText(`💨 ${this.t('ui.dash')}`, x, y);
        }
        
        // Draw cooldown bar
        const barWidth = 80;
        const barHeight = 8;
        const barX = x + 75;
        const barY = y - 10;
        
        // Background bar
        this.ctx.fillStyle = 'rgba(139, 148, 158, 0.3)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
          if (!isReady) {
            // Cooldown progress bar (red/orange when on cooldown)
            const progressWidth = barWidth * (1 - cooldownProgress);
            this.ctx.fillStyle = cooldownProgress > 0.5 ? '#f85149' : '#d1a01f';
            this.ctx.fillRect(barX, barY, progressWidth, barHeight);
            
            // Show remaining time with more precision for short cooldowns
            const remainingSeconds = currentCooldown < 1000 ? 
                (currentCooldown / 1000).toFixed(1) : 
                Math.ceil(currentCooldown / 1000);
            this.ctx.fillStyle = '#8b949e';
            this.ctx.font = '11px Courier New';
            this.ctx.fillText(`${remainingSeconds}s`, barX + barWidth + 5, y - 2);
        } else {
            // Ready indicator (full green bar with pulsing effect)
            const pulseAlpha = 0.7 + 0.3 * Math.sin(Date.now() * 0.01); // Pulsing effect
            this.ctx.fillStyle = `rgba(64, 209, 88, ${pulseAlpha})`;
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
              // Prominent "DASH READY!" text with enhanced styling
            this.ctx.fillStyle = '#40d158';
            this.ctx.font = 'bold 12px Courier New';
            this.ctx.fillText(this.t('ui.dashReady'), barX + barWidth + 5, y - 2);
            
            // Add subtle glow effect when ready
            this.ctx.shadowColor = '#40d158';
            this.ctx.shadowBlur = 3;
            this.ctx.fillText(this.t('ui.dashReady'), barX + barWidth + 5, y - 2);
            this.ctx.shadowBlur = 0; // Reset shadow
        }
          // Show dash level if using dash modules
        if (player.shopUpgrades.dashModuleLevel > 0) {
            this.ctx.fillStyle = '#58a6ff';
            this.ctx.font = '10px Courier New';
            this.ctx.fillText(`LV${player.shopUpgrades.dashModuleLevel}`, x + 55, y - 15);
        }
    }
}
