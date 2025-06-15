/**
 * GameRenderer - Handles all game rendering functionality
 */

import { GAME_STATES, DIFFICULTY_LEVELS, GAME_CONFIG } from '../utils/constants.js';
import { GameDialogs } from './GameDialogs.js';
import { GameUI } from './GameUI.js';

export class GameRenderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        
        // Initialize GameDialogs for dialog rendering
        this.dialogs = new GameDialogs(game);
        
        // Initialize GameUI for UI rendering (including FPS counter)
        this.gameUI = new GameUI(game);
        
        // Performance optimizations
        this.lastRenderState = null; // Cache last render state to avoid redundant operations
        this.backgroundParticleTime = 0; // Separate timing for background particles
        this.particleSkipFrames = 0; // Skip particle updates for performance
        this.renderOptimizations = {
            skipBackgroundParticles: false,
            reduceGradientComplexity: false,
            cacheGradients: true
        };
        
        // Cached gradients for performance
        this.gradientCache = new Map();
    }

    /**
     * Clear the canvas with gradient background
     */
    clearCanvas() {
        // Use cached gradient for better performance
        const gradientKey = `bg_${this.canvas.width}_${this.canvas.height}`;
        let gradient = this.gradientCache.get(gradientKey);
        
        if (!gradient && this.renderOptimizations.cacheGradients) {
            gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#0d1117');
            gradient.addColorStop(0.5, '#161b22');
            gradient.addColorStop(1, '#21262d');
            this.gradientCache.set(gradientKey, gradient);
        } else if (!gradient) {
            // Create gradient without caching for low memory devices
            gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#0d1117');
            gradient.addColorStop(0.5, '#161b22');
            gradient.addColorStop(1, '#21262d');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add background particles during gameplay (optimized)
        if ((this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) 
            && !this.renderOptimizations.skipBackgroundParticles) {
            this.renderBackgroundParticles();
        }
    }

    /**
     * Main render method - handles all game state rendering
     */    render() {
        
        // Clear canvas for all states
        this.clearCanvas();

        if (this.game.gameState === GAME_STATES.LOGIN_PROMPT) {
            if (this.game.loginSystem) {
                this.game.loginSystem.render();
            }
            return;
        }

        if (this.game.gameState === GAME_STATES.POST_ANIMATION_POPUP) {
           
            this.dialogs.drawPostAnimationPopup();
            return;
        }
        
        if (this.game.gameState === GAME_STATES.HOME) {
           
            this.drawHomeScreen();
            return;
        }
        
        if (this.game.gameState === GAME_STATES.CREDITS) {
            
            this.drawCreditsScreen();
            return;
        }
        
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
        
        if (this.game.gameState === GAME_STATES.SHOP) {
         
            this.drawShop();
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
        
        this.ctx.restore();        // Render UI elements
        this.drawUI();
        
        // Render GameUI elements (including FPS counter)
        this.gameUI.drawUI();
        
        // Render milestone effects during gameplay
        if (this.game.gameState === GAME_STATES.PLAYING || this.game.gameState === GAME_STATES.PAUSED) {
            this.game.renderMilestoneEffects(this.ctx);
        }
        
        if (this.game.gameState === GAME_STATES.PAUSED) {
            this.drawPauseOverlay();
        } else if (this.game.gameState === GAME_STATES.GAME_OVER) {
            this.drawGameOverOverlay();
        }
    }    /**
     * Draw UI elements specific to GameRenderer (minimal, GameUI handles most UI)
     */
    drawUI() {
        // GameRenderer now handles minimal UI - GameUI handles the main UI elements
        // This method is kept for any renderer-specific UI that shouldn't be in GameUI
        
        // Only handle renderer-specific overlays here if needed
        // Most UI is now handled by GameUI.drawUI()
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
          // Game Over title - use random death message
        this.ctx.fillStyle = `rgba(248, 81, 73, ${textAlpha})`;
        this.ctx.font = 'bold 36px Courier New';
        this.ctx.textAlign = 'center';
        const deathMessage = this.game.gameOverMessage || 'GAME OVER';
        this.ctx.fillText(deathMessage, this.canvas.width / 2, this.canvas.height / 2 - 60);
        
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
            this.ctx.fillText(`Final Score: ${this.game.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            
            // Show survival time - use gameOverStartTime to stop counting after death
            const survivalTime = Math.floor((this.game.gameOverStartTime - this.game.startTime) / 1000);
            this.ctx.fillText(`Survival Time: ${survivalTime}s`, this.canvas.width / 2, this.canvas.height / 2 + 30);            // Show best score
            const difficultyBestScore = this.game.bestScores[this.game.selectedDifficulty] || 0;
            if (difficultyBestScore > 0) {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
                this.ctx.fillText(`Best Score: ${difficultyBestScore}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
            }
        }
          // Restart instructions (only show when fade is nearly complete)
        if (easedProgress > 0.7) {
            const instructionAlpha = Math.max(0, (easedProgress - 0.7) / 0.3);
            this.ctx.fillStyle = `rgba(86, 211, 100, ${instructionAlpha})`;
            this.ctx.font = '18px Courier New';
            this.ctx.fillText('Click to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
              // Additional controls
            this.ctx.fillStyle = `rgba(121, 192, 255, ${instructionAlpha})`;
            this.ctx.font = '14px Courier New';
            this.ctx.fillText('Press [Escape] for Difficulty Selection', this.canvas.width / 2, this.canvas.height / 2 + 100);
            
            // Leaderboard access
            this.ctx.fillStyle = `rgba(86, 211, 100, ${instructionAlpha})`;
            this.ctx.font = '12px Courier New';
            this.ctx.fillText('Press [L] to View Leaderboards', this.canvas.width / 2, this.canvas.height / 2 + 120);
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
     * Render background particles with performance optimizations
     */
    renderBackgroundParticles() {
        // Skip particle updates every other frame for performance
        this.particleSkipFrames++;
        if (this.particleSkipFrames % 2 === 0) {
            this.backgroundParticleTime = Date.now() * 0.001;
        }
        
        const time = this.backgroundParticleTime;
        
        // Reduced particle count for better performance (4 instead of 8)
        const particleCount = this.game.graphicsQuality === 'low' ? 2 : 4;
        
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.sin(time * 0.3 + i * 343.3) * 0.5 + 0.5) * this.canvas.width;
            const y = ((time * 0.02 + i * 0.1) % 1) * this.canvas.height;
            
            // Binary-looking data particles with reduced alpha for performance
            const alpha = this.game.graphicsQuality === 'low' ? 0.02 : 0.03 + Math.sin(time + i) * 0.02;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.font = '10px monospace';
            const digit = Math.floor(Math.sin(time * 2 + i * 10) * 4 + 4);
            this.ctx.fillText(digit === 0 ? '0' : '1', x, y);
        }
    }    /**
     * Draw the difficulty selection screen
     */
    drawDifficultySelection() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Clear previous hit areas
        this.game.difficultyHitAreas = [];
        
        // Animated gradient background
        const time = Date.now() * 0.001;
        const gradient = ctx.createRadialGradient(
            width/2 + Math.sin(time * 0.5) * 50, 
            height/2 + Math.cos(time * 0.3) * 30, 
            0, 
            width/2, height/2, 
            Math.max(width, height) * 0.8
        );
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.95)');
        gradient.addColorStop(0.3, 'rgba(30, 41, 59, 0.98)');
        gradient.addColorStop(0.7, 'rgba(21, 32, 43, 0.96)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Enhanced animated particles system
        this.drawDifficultyParticles(ctx, width, height, time);
        
        // Game title with glow effect
        this.drawEnhancedTitle(ctx, width, time);
        
        // Subtitle with effects
        this.drawSubtitle(ctx, width, time);
          // Check if there's a saved game and show continue option
        if (this.game.hasSavedGame && this.game.hasSavedGame()) {
            this.drawSavedGameNotice(ctx, width, time);
        }
        
        // Instructions with animated glow
        this.drawInstructions(ctx, width, time);
        
        // Enhanced difficulty options
        this.drawEnhancedDifficultyOptions(ctx, width, height, time);
        
        // Footer with version info
        this.drawFooter(ctx, width, height, time);
        
        ctx.restore();
    }
    
    /**
     * Draw enhanced particle system for difficulty screen
     */
    drawDifficultyParticles(ctx, width, height, time) {
        // Primary floating particles
        for (let i = 0; i < 12; i++) {
            const x = (Math.sin(time * 0.5 + i * 1.8) * 0.4 + 0.5) * width;
            const y = (Math.cos(time * 0.4 + i * 0.9) * 0.3 + 0.5) * height;
            const alpha = 0.15 + Math.sin(time * 2 + i) * 0.05;
            const size = 3 + Math.sin(time * 0.7 + i) * 2;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.shadowColor = 'rgba(88, 166, 255, 0.5)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Secondary particle trail
        for (let i = 0; i < 8; i++) {
            const x = (Math.cos(time * 0.3 + i * 2.2) * 0.6 + 0.5) * width;
            const y = (Math.sin(time * 0.6 + i * 1.1) * 0.4 + 0.5) * height;
            const alpha = 0.08 + Math.cos(time * 1.5 + i) * 0.03;
            const size = 1.5 + Math.cos(time * 0.9 + i) * 1;
            
            ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw enhanced title with glow effects
     */
    drawEnhancedTitle(ctx, width, time) {
        // Main title with animated glow
        const titleGlow = 0.3 + Math.sin(time * 2) * 0.1;
        ctx.shadowColor = 'rgba(88, 166, 255, ' + titleGlow + ')';
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Code Runner', width / 2, 80);
        
        // Add secondary glow layer
        ctx.shadowColor = 'rgba(168, 85, 247, ' + (titleGlow * 0.5) + ')';
        ctx.shadowBlur = 30;
        ctx.fillText('Code Runner', width / 2, 80);
        
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw subtitle with effects
     */
    drawSubtitle(ctx, width, time) {
        ctx.font = '18px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        
        // Animated text with subtle glow
        const textAlpha = 0.8 + Math.sin(time * 1.5) * 0.2;
        ctx.fillStyle = `rgba(125, 133, 144, ${textAlpha})`;
        ctx.fillText('Select Difficulty', width / 2, 110);
        
        ctx.font = '14px Courier New';
        ctx.fillStyle = `rgba(125, 133, 144, ${textAlpha * 0.8})`;
        ctx.fillText('Choose your survival challenge level', width / 2, 130);
    }
    
    /**
     * Draw saved game notice
     */
    drawSavedGameNotice(ctx, width, time) {
        const pulseAlpha = 0.7 + Math.sin(time * 3) * 0.3;
        ctx.fillStyle = `rgba(86, 211, 100, ${pulseAlpha})`;
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        
        // Add glow to saved game notice
        ctx.shadowColor = 'rgba(86, 211, 100, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(`💾 Saved Game Available`, width / 2, 155);
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw instructions with animated effects
     */
    drawInstructions(ctx, width, time) {
        ctx.font = '14px Courier New';
        const instructionAlpha = 0.6 + Math.sin(time * 2.5) * 0.2;
        ctx.fillStyle = `rgba(88, 166, 255, ${instructionAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('Click a difficulty to start the game', width / 2, 175);
    }
    
    /**
     * Draw enhanced difficulty options with better visuals
     */
    drawEnhancedDifficultyOptions(ctx, width, height, time) {
        let y = 220;
        const spacing = 110;
          this.game.difficultyKeys.forEach((diffKey, index) => {
            const difficulty = DIFFICULTY_LEVELS[diffKey];
            const isHovered = index === this.game.hoveredDifficulty;
            
            // Create enhanced hit area with wider buttons
            const hitArea = {
                x: width / 2 - 250,
                y: y - 25,
                width: 500,
                height: 95,
                index: index
            };
            this.game.difficultyHitAreas.push(hitArea);
            
            // Animated hover effects
            const hoverScale = isHovered ? 1.02 : 1;
            const hoverOffset = isHovered ? Math.sin(time * 4) * 2 : 0;
            
            ctx.save();
            ctx.translate(width / 2, y + 25);
            ctx.scale(hoverScale, hoverScale);
            ctx.translate(-width / 2, -(y + 25));
            
            // Enhanced background with gradient
            if (isHovered) {
                const hoverGradient = ctx.createLinearGradient(hitArea.x, hitArea.y, hitArea.x + hitArea.width, hitArea.y + hitArea.height);
                const rgbColor = this.hexToRgb(difficulty.color);
                hoverGradient.addColorStop(0, `rgba(${rgbColor}, 0.2)`);
                hoverGradient.addColorStop(0.5, `rgba(${rgbColor}, 0.35)`);
                hoverGradient.addColorStop(1, `rgba(${rgbColor}, 0.2)`);
                ctx.fillStyle = hoverGradient;
            } else {
                ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
            }
            
            // Draw enhanced rounded rectangle
            this.drawRoundedRect(ctx, hitArea.x, hitArea.y + hoverOffset, hitArea.width, hitArea.height, 12);
            ctx.fill();
            
            // Enhanced border with glow
            if (isHovered) {
                ctx.shadowColor = difficulty.color;
                ctx.shadowBlur = 15;
                ctx.strokeStyle = difficulty.color;
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = '#30363d';
                ctx.lineWidth = 1;
            }
            
            this.drawRoundedRect(ctx, hitArea.x, hitArea.y + hoverOffset, hitArea.width, hitArea.height, 12);
            ctx.stroke();
            ctx.shadowBlur = 0;
              // Enhanced difficulty icon and name
            ctx.fillStyle = difficulty.color;
            ctx.font = isHovered ? 'bold 22px Courier New' : 'bold 18px Courier New';
            ctx.textAlign = 'left';
            
            // Draw icon with glow
            if (isHovered) {
                ctx.shadowColor = difficulty.color;
                ctx.shadowBlur = 10;
            }
            
            const iconX = width / 2 - 220;
            const nameX = width / 2 - 190;
            ctx.fillText(difficulty.emoji, iconX, y + 15 + hoverOffset);
            ctx.fillText(difficulty.name, nameX, y + 15 + hoverOffset);
            ctx.shadowBlur = 0;
            
            // Enhanced description with better formatting and smaller text
            ctx.fillStyle = isHovered ? '#c9d1d9' : '#8b949e';
            ctx.font = isHovered ? 'bold 13px Courier New' : '12px Courier New';
            
            if (difficulty.healthRegenInterval > 0) {
                const minutes = Math.floor(difficulty.healthRegenInterval / 60000);
                const seconds = Math.floor((difficulty.healthRegenInterval % 60000) / 1000);
                const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                ctx.fillText(`❤️ Health regeneration: Every ${timeText}`, nameX, y + 40 + hoverOffset);
            } else {
                ctx.fillStyle = isHovered ? '#f85149' : '#da3633';
                ctx.fillText(`💀 No health regeneration - Extreme challenge!`, nameX, y + 40 + hoverOffset);
            }
            
            // Add difficulty rating stars
            this.drawDifficultyRating(ctx, nameX, y + 65 + hoverOffset, index + 1, isHovered, difficulty.color);
            
            ctx.restore();
            y += spacing;
        });
    }
      /**
     * Draw difficulty rating stars
     */
    drawDifficultyRating(ctx, x, y, level, isHovered, color) {
        ctx.font = isHovered ? '14px Courier New' : '12px Courier New';
        ctx.fillStyle = isHovered ? '#f0f6fc' : '#7d8590';
        ctx.fillText('Challenge: ', x, y);
        
        const starX = x + 75;
        for (let i = 0; i < 4; i++) {
            if (i < level) {
                ctx.fillStyle = color;
                if (isHovered) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 5;
                }
            } else {
                ctx.fillStyle = '#30363d';
                ctx.shadowBlur = 0;
            }
            ctx.fillText('★', starX + i * 20, y);
        }
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw footer with version info
     */
    drawFooter(ctx, width, height, time) {
        ctx.font = '12px Courier New';
        const footerAlpha = 0.4 + Math.sin(time * 1.5) * 0.1;
        ctx.fillStyle = `rgba(125, 133, 144, ${footerAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(`Version ${this.game.changelogData.version} | ${this.game.changelogData.lastUpdated}`, width / 2, height - 30);
        ctx.fillText('Click a difficulty to start the game', width / 2, height - 15);
    }
    
    /**
     * Helper function to convert hex to RGB values
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
     */    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }

    /**
     * Draw the leaderboard screen - delegates to GameDialogs
     */
    drawLeaderboard() {
        if (this.dialogs) {
            this.dialogs.drawLeaderboard(this.game.leaderboardSystem, this.game.tabHitAreas);
        }
    }

    /**
     * Draw the changelog screen - delegates to GameDialogs
     */
    drawChangelog() {
        if (this.dialogs) {
            this.dialogs.drawChangelog();
        }
    }    /**
     * Draw the shop screen - delegates to GameDialogs
     */
    drawShop() {
        if (this.dialogs) {
            // Initialize hit areas array if not exists
            if (!this.game.shopHitAreas) {
                this.game.shopHitAreas = [];
            }
            this.dialogs.drawShop(this.game.shopHitAreas);
        }
    }/**
     * Draw the reset confirmation dialog - delegates to GameDialogs
     */
    drawResetConfirmationDialog() {
        if (this.dialogs) {
            this.dialogs.drawResetConfirmationDialog();
        }
    }

    /**
     * Draw the home screen
     */
    drawHomeScreen() {
       
        if (this.dialogs) {
           
            this.dialogs.drawHomeScreen(this.game.homeHitAreas || [], this.game.hoveredHomeButton);
        } else {
           
        }
    }

    /**
     * Draw the credits screen
     */
    drawCreditsScreen() {
        if (this.dialogs) {
            this.dialogs.drawCreditsScreen(this.game.creditsHitAreas || []);
        }
    }
    
    /**
     * Set rendering optimizations based on performance requirements
     */
    setRenderOptimizations(options) {
        Object.assign(this.renderOptimizations, options);
        
        // Clear gradient cache if caching is disabled
        if (!this.renderOptimizations.cacheGradients) {
            this.gradientCache.clear();
        }
    }

    /**
     * Get performance statistics for monitoring
     */
    getRenderStats() {
        return {
            gradientCacheSize: this.gradientCache.size,
            particleSkipFrames: this.particleSkipFrames,
            optimizations: { ...this.renderOptimizations }
        };
    }

    /**
     * Clear all caches to free memory
     */
    clearCaches() {
        this.gradientCache.clear();
        this.lastRenderState = null;
    }

}
