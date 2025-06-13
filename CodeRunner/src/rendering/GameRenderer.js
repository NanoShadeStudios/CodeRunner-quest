/**
 * GameRenderer - Handles all game rendering functionality
 */

import { GAME_STATES, DIFFICULTY_LEVELS, GAME_CONFIG } from '../utils/constants.js';

export class GameRenderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
    }

    /**
     * Clear the canvas with gradient background
     */
    clearCanvas() {
        // Enhanced background for larger screen with gameplay particles
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0d1117');
        gradient.addColorStop(0.5, '#161b22');
        gradient.addColorStop(1, '#21262d');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add background particles during gameplay
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            const time = Date.now() * 0.001;
            
            // Flowing data packets (8 instead of 5)
            for (let i = 0; i < 8; i++) {
                const x = (Math.sin(time * 0.3 + i * 343.3) * 0.5 + 0.5) * this.canvas.width;
                const y = ((time * 0.02 + i * 0.1) % 1) * this.canvas.height;
                
                // Binary-looking data particles
                this.ctx.fillStyle = `rgba(0, 255, 255, ${0.03 + Math.sin(time + i) * 0.02})`;
                this.ctx.font = '10px monospace';
                const digit = Math.floor(Math.sin(time * 2 + i * 10) * 4 + 4);
                this.ctx.fillText(digit === 0 ? '0' : '1', x, y);
            }
        }
    }

    /**
     * Render the game state
     */
    render() {
        this.clearCanvas();
          
        if (this.game.gameState === GAME_STATES.DIFFICULTY_SELECT) {
            this.drawDifficultySelection();
            return;
        }
          
        if (this.game.gameState === GAME_STATES.CHANGELOG) {
            this.drawChangelog();
            return;
        }
        
        if (this.game.gameState === GAME_STATES.LEADERBOARD) {
            this.drawLeaderboard();
            return;
        }
        
        if (this.game.gameState === GAME_STATES.RESET_CONFIRM) {
            this.drawResetConfirmationDialog();
            return;
        }
        
        this.ctx.save();
        
        // Render world and entities
        if (this.game.world) {
            this.game.world.draw(this.ctx, this.game.camera);
        }
        
        if (this.game.player) {
            this.game.player.draw(this.ctx, this.game.camera);
        }
        
        this.ctx.restore();
        
        // Render UI elements
        this.drawUI();
        
        if (this.game.gameState === GAME_STATES.PAUSED) {
            this.drawPauseOverlay();
        } else if (this.game.gameState === GAME_STATES.GAME_OVER) {
            this.drawGameOverOverlay();
        }
    }

    /**
     * Draw UI elements like score, health, etc.
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
                    const timeUntilNextRegen = Math.max(0, difficulty.healthRegenInterval - timeSinceLastRegen);
                    const secondsUntilRegen = Math.ceil(timeUntilNextRegen / 1000);
                    
                    this.ctx.fillStyle = '#40d158';
                    
                    // Show minutes if over 60 seconds, otherwise show seconds
                    if (secondsUntilRegen >= 60) {
                        const minutesUntilRegen = Math.ceil(secondsUntilRegen / 60);
                        this.ctx.fillText(`Next heal in: ${minutesUntilRegen}m`, 15, 90);
                    } else {
                        this.ctx.fillText(`Next heal in: ${secondsUntilRegen}s`, 15, 90);
                    }
                } else {
                    // Show "No regeneration" for Extreme mode
                    this.ctx.fillStyle = '#f85149';
                    this.ctx.fillText('No health regeneration', 15, 90);
                }
            }
        }
        
        // Difficulty display (only during gameplay)
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
        const heartSize = 16;
        const heartSpacing = 4;
        const startX = 15;
        const startY = 15;
        
        for (let i = 0; i < this.game.player.maxHealth; i++) {
            const x = startX + i * (heartSize + heartSpacing);
            const y = startY;
            
            // Draw heart background (empty heart)
            this.drawPixelHeart(x, y, heartSize, false);
            
            // Draw filled heart if player has this much health
            if (i < this.game.player.health) {
                this.drawPixelHeart(x, y, heartSize, true);
            }
        }
    }

    /**
     * Draw a single pixelated heart
     */
    drawPixelHeart(x, y, size, filled) {
        const pixelSize = size / 8;
        const color = filled ? '#f85149' : '#30363d';
        
        this.ctx.fillStyle = color;
        
        // Heart pattern (8x8 pixel art)
        const heartPattern = [
            [0,1,1,0,0,1,1,0],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (heartPattern[row][col]) {
                    this.ctx.fillRect(
                        x + col * pixelSize,
                        y + row * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }

    /**
     * Draw pause overlay
     */
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.font = '24px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '14px Courier New';
        this.ctx.fillText('Press [P] to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        this.ctx.textAlign = 'left';
    }

    /**
     * Draw game over overlay
     */
    drawGameOverOverlay() {
        // Calculate fade progress (0 to 1)
        const currentTime = Date.now();
        
        const elapsed = currentTime - this.game.gameOverStartTime;
        const fadeProgress = Math.min(elapsed / GAME_CONFIG.GAME_OVER_FADE_DURATION, 1.0);
        
        // Smooth easing function for more natural fade
        const easedProgress = fadeProgress * fadeProgress * (3 - 2 * fadeProgress); // smoothstep
        
        // Dark overlay with fade
        const overlayAlpha = 0.8 * easedProgress;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only show text elements if fade has progressed enough
        if (easedProgress < 0.1) return; // Wait for initial fade before showing text
        
        const textAlpha = Math.max(0, (easedProgress - 0.2) / 0.8); // Text fades in after overlay
        
        // Game Over title
        this.ctx.fillStyle = `rgba(248, 81, 73, ${textAlpha})`;
        this.ctx.font = 'bold 36px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        // High Score Celebration Animation
        if (this.game.isNewHighScore && easedProgress > 0.3) {
            this.drawHighScoreCelebration(currentTime, textAlpha);
        }
        
        // Death reason
        if (this.game.gameOverReason) {
            this.ctx.fillStyle = `rgba(240, 246, 252, ${textAlpha})`;
            this.ctx.font = '16px Courier New';
            this.ctx.fillText(`Cause: ${this.game.gameOverReason}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        }
        
        // Player stats
        if (this.game.player) {
            this.ctx.fillStyle = `rgba(88, 166, 255, ${textAlpha})`;
            this.ctx.fillText(`Final Distance: ${this.game.score}m`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            
            // Show survival time - use gameOverStartTime to stop counting after death
            const survivalTime = Math.floor((this.game.gameOverStartTime - this.game.startTime) / 1000);
            this.ctx.fillText(`Survival Time: ${survivalTime}s`, this.canvas.width / 2, this.canvas.height / 2 + 30);
            
            // Show best distance
            if (this.game.bestDistance > 0) {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
                this.ctx.fillText(`Best Distance: ${this.game.bestDistance}m`, this.canvas.width / 2, this.canvas.height / 2 + 50);
            }
        }
        
        // Restart instructions (only show when fade is nearly complete)
        if (easedProgress > 0.7) {
            const instructionAlpha = Math.max(0, (easedProgress - 0.7) / 0.3);
            this.ctx.fillStyle = `rgba(86, 211, 100, ${instructionAlpha})`;
            this.ctx.font = '18px Courier New';
            this.ctx.fillText('Press [R] to Restart Current Game', this.canvas.width / 2, this.canvas.height / 2 + 80);
            
            // Additional controls
            this.ctx.fillStyle = `rgba(121, 192, 255, ${instructionAlpha})`;
            this.ctx.font = '14px Courier New';
            this.ctx.fillText('Press [D] for Difficulty Selection', this.canvas.width / 2, this.canvas.height / 2 + 100);
            
            this.ctx.font = '12px Courier New';
            this.ctx.fillStyle = `rgba(125, 133, 144, ${instructionAlpha})`;
            this.ctx.fillText('Press [P] to Pause/Resume', this.canvas.width / 2, this.canvas.height / 2 + 120);
            
            // Upload score button (only if score is high enough and not already uploaded)
            if (this.game.score >= 100 && this.game.leaderboardSystem && 
                this.game.leaderboardSystem.canUploadForDifficulty(this.game.selectedDifficulty)) {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${instructionAlpha})`;
                this.ctx.font = 'bold 14px Courier New';
                this.ctx.fillText('Press [E] to Upload Score to Leaderboard', this.canvas.width / 2, this.canvas.height / 2 + 145);
            }
            
            // Leaderboard access
            this.ctx.fillStyle = `rgba(86, 211, 100, ${instructionAlpha})`;
            this.ctx.font = '12px Courier New';
            this.ctx.fillText('Press [L] to View Leaderboards', this.canvas.width / 2, this.canvas.height / 2 + 165);
        }
        
        this.ctx.textAlign = 'left';
    }

    /**
     * Draw flashy high score celebration animation
     */
    drawHighScoreCelebration(currentTime, baseAlpha) {
        const animationTime = currentTime - this.game.gameOverStartTime;
        const time = animationTime * 0.001; // Convert to seconds
        
        // Pulsing effect
        const pulse = Math.sin(time * 8) * 0.3 + 0.7;
        const bigPulse = Math.sin(time * 3) * 0.2 + 0.8;
        
        // Rainbow color cycling
        const hue = (time * 60) % 360;
        const rainbowColor = `hsl(${hue}, 100%, 70%)`;
        
        // Bouncing/scaling effect
        const bounce = Math.abs(Math.sin(time * 4)) * 0.3 + 1.0;
        
        this.ctx.save();
        
        // Main celebration text
        const celebrationAlpha = Math.min(baseAlpha * pulse, 1.0);
        this.ctx.fillStyle = rainbowColor.replace('70%', `70%, ${celebrationAlpha})`);
        this.ctx.font = `bold ${28 * bounce}px Courier New`;
        this.ctx.textAlign = 'center';
        
        // Add glow effect
        this.ctx.shadowBlur = 15 * pulse;
        this.ctx.shadowColor = rainbowColor;
        
        this.ctx.fillText('🎉 NEW HIGH SCORE! 🎉', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw celebration particles
        this.drawCelebrationParticles(currentTime, baseAlpha);
        
        this.ctx.restore();
    }

    /**
     * Draw animated celebration particles
     */
    drawCelebrationParticles(currentTime, alpha) {
        const time = (currentTime - this.game.gameOverStartTime) * 0.001;
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time;
            const radius = 80 + Math.sin(time * 3 + i) * 20;
            const x = this.canvas.width / 2 + Math.cos(angle) * radius;
            const y = this.canvas.height / 2 - 100 + Math.sin(angle) * radius * 0.5;
            
            const particleAlpha = alpha * (0.7 + Math.sin(time * 5 + i) * 0.3);
            
            // Different colored particles
            const hue = (time * 30 + i * 30) % 360;
            this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${particleAlpha})`;
            
            const size = 4 + Math.sin(time * 4 + i) * 2;
            this.ctx.fillRect(x - size/2, y - size/2, size, size);
        }
    }

    /**
     * Draw firework burst effect
     */
    drawFireworkBurst(centerX, centerY, time, alpha) {
        const sparkCount = 8;
        const burstRadius = 40;
        
        for (let i = 0; i < sparkCount; i++) {
            const angle = (i / sparkCount) * Math.PI * 2;
            const distance = burstRadius * Math.min(time * 2, 1.0);
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const sparkAlpha = alpha * Math.max(0, 1.0 - time);
            this.ctx.fillStyle = `rgba(255, 215, 0, ${sparkAlpha})`;
            this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    }

    /**
     * Draw data packets display
     */
    drawDataPacketsDisplay() {
        const dataPackets = this.game.upgradeSystem ? this.game.upgradeSystem.getDataPackets() : 0;
        
        // Position in top-right corner
        const x = this.canvas.width - 120;
        const y = 25;
        
        // Draw icon
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`💾 Data Packets: ${dataPackets}`, x + 100, y);
        
        // Reset text align
        this.ctx.textAlign = 'left';
    }

    /**
     * Draw performance display
     */
    drawPerformanceDisplay() {
        const x = this.canvas.width - 200;
        const y = 40;
        const lineHeight = 15;
        
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.7)';
        this.ctx.fillRect(x - 10, y - 20, 190, 100);
        
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.font = '12px "SF Mono", "Monaco", monospace';
        this.ctx.textAlign = 'right';
        
        // Title
        this.ctx.fillStyle = '#f0f6fc';
        this.ctx.fillText('PERFORMANCE METRICS', x + 170, y);
        
        // FPS counter
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.fillText(`FPS: ${Math.round(this.game.fps)}`, x + 170, y + lineHeight * 1);
        
        // World metrics
        if (this.game.world) {
            this.ctx.fillText(`Active Chunks: ${this.game.world.activeChunks.size}`, x + 170, y + lineHeight * 2);
            this.ctx.fillText(`Entities: ${this.game.world.entities.length}`, x + 170, y + lineHeight * 3);
        }
        
        // Physics metrics
        if (this.game.physics) {
            this.ctx.fillText(`Collision Checks: ${this.game.physics.collisionChecks || 0}`, x + 170, y + lineHeight * 4);
        }
        
        // Restore text alignment
        this.ctx.textAlign = 'left';
    }

    /**
     * Draw the difficulty selection screen
     */
    drawDifficultySelection() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear previous hit areas
        this.game.difficultyHitAreas = [];
        
        // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Code Runner', width / 2, 80);
        
        // Subtitle
        ctx.font = '18px Courier New';
        ctx.fillText('Select Difficulty', width / 2, 130);
        
        // Draw difficulty options
        const difficultyCount = this.game.difficultyKeys.length;
        const buttonWidth = 300;
        const buttonHeight = 60;
        const buttonSpacing = 20;
        const totalHeight = difficultyCount * buttonHeight + (difficultyCount - 1) * buttonSpacing;
        let startY = height / 2 - totalHeight / 2;
        
        this.game.difficultyKeys.forEach((key, index) => {
            const difficulty = DIFFICULTY_LEVELS[key];
            const isHovered = index === this.game.hoveredDifficulty;
            
            // Button position
            const x = width / 2 - buttonWidth / 2;
            const y = startY + (buttonHeight + buttonSpacing) * index;
            
            // Store hit area for mouse interaction
            this.game.difficultyHitAreas.push({
                x,
                y,
                width: buttonWidth,
                height: buttonHeight
            });
            
            // Button background
            const baseColor = this.hexToRgba(difficulty.color, 0.2);
            const hoverColor = this.hexToRgba(difficulty.color, 0.4);
            
            ctx.fillStyle = isHovered ? hoverColor : baseColor;
            this.drawRoundedRect(ctx, x, y, buttonWidth, buttonHeight, 8);
            ctx.fill();
            
            // Button border
            ctx.strokeStyle = difficulty.color;
            ctx.lineWidth = isHovered ? 3 : 2;
            this.drawRoundedRect(ctx, x, y, buttonWidth, buttonHeight, 8);
            ctx.stroke();
            
            // Button text
            ctx.fillStyle = isHovered ? '#f0f6fc' : '#d0d7de';
            ctx.font = `${isHovered ? 'bold ' : ''}20px Courier New`;
            ctx.textAlign = 'center';
            ctx.fillText(`${difficulty.emoji} ${difficulty.name}`, width / 2, y + buttonHeight / 2 + 7);
            
            // Difficulty description
            ctx.font = '12px Courier New';
            ctx.fillStyle = '#8b949e';
            
            const description = difficulty.healthRegenInterval === 0 ? 
                'No health regeneration' : 
                `Health regen every ${Math.round(difficulty.healthRegenInterval / 1000)} seconds`;
            
            ctx.fillText(description, width / 2, y + buttonHeight - 12);
        });
        
        // Instructions
        ctx.fillStyle = '#58a6ff';
        ctx.font = '14px Courier New';
        ctx.fillText('Click a difficulty to start the game', width / 2, height - 80);
        
        // Version info
        ctx.fillStyle = '#d0d7de';
        ctx.font = '12px Courier New';
        ctx.fillText(`Version ${this.game.changelogData.version} | ${this.game.changelogData.lastUpdated}`, width / 2, height - 50);
    }

    /**
     * Draw rounded rectangle
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

    /**
     * Convert hex color to rgba format with specified alpha
     */
    hexToRgba(hex, alpha) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Convert hex color to rgb format
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
}
