/**
 * Game Engine - Main game loop and coordination
 */

import { GAME_CONFIG, GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';
import { InputManager } from '../systems/InputManager.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { LeaderboardSystem } from '../systems/LeaderboardSystem.js';
import { WorldGenerator } from './WorldGenerator.js';
import { Player } from './Player.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { GameRenderer } from '../rendering/GameRenderer.js';
import { GameUI } from '../rendering/GameUI.js';
import { GameDialogs } from '../rendering/GameDialogs.js';

// Module integration helper
import { connectRenderingModules } from './game-module-bridge.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById(GAME_CONFIG.CANVAS_ID);        this.ctx = this.canvas.getContext('2d');
        
        this.gameState = GAME_STATES.INITIALIZING;
        this.previousGameState = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameOverReason = null;
        
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
          this.camera = { x: 0, y: 0 };
        this.score = 0;
        this.bestDistance = 0;
        this.previousBestDistance = 0; // Store previous best for high score detection
        this.startTime = 0; // Will be set when game actually startsthis.player = null;
        this.world = null;
        this.physics = null;
        this.inputManager = null;
        this.upgradeSystem = null;
        this.leaderboardSystem = null;
        
        // Difficulty system
        this.selectedDifficulty = 'EASY';
        this.difficultyIndex = 0;
        this.difficultyKeys = Object.keys(DIFFICULTY_LEVELS);
        this.lastHealthRegenTime = 0;
        
        // Performance monitoring for enhanced effects
        this.fpsCounter = {
            frames: 0,
            lastTime: 0,
            currentFPS: 0
        };
        
        this.performanceMetrics = {
            renderTime: 0,
            updateTime: 0,
            particleCount: 0
        };        // Debug options for performance monitoring
        this.showPerformanceDisplay = false; // Toggle with F3 key
        
        // Purchase effect tracking
        this.purchaseEffect = null;
          // Changelog data
        this.changelogData = {
            version: "v1.3.0",
            lastUpdated: "June 2025",
            entries: [
                {
                    version: "v1.3.0",
                    date: "June 2025",
                    title: "Difficulty Selection System",
                    changes: [
                        "• New difficulty selection screen at game start",
                        "🔹 Easy: Fast health regeneration (1 minute)",
                        "🔸 Medium: Moderate regeneration (3 minutes)", 
                        "🔴 Hard: Slow regeneration (7 minutes)",
                        "❌ Extreme: No health regeneration at all",
                        "• Difficulty indicator shown during gameplay",
                        "• Health regeneration timer updates based on selected difficulty"
                    ]
                },
                {
                    version: "v1.2.0",
                    date: "June 2025",
                    title: "Upgrade System Overhaul",                    changes: [
                        "• Complete shop system integration with permanent upgrades",
                        "• Data Packets currency system for shop purchases", 
                        "• Multiple upgrade categories: Movement, Score & Data, Mechanics, Revive, Cosmetics",
                        "• Persistent upgrade ownership across game sessions",
                        "• Animated shop interface with modern UI design",
                        "• Shop accessible through main website interface",
                        
                    ]
                },
                {
                    version: "v1.1.0", 
                    date: "June 2025",
                    title: "Performance & UI Improvements",
                    changes: [
                        "• Added F3 performance monitoring display",
                        "• Enhanced health regeneration system",
                        "• Improved pixelated heart health display",
                        "• Better game over animations with high score celebration",
                        "• Optimized rendering pipeline"
                    ]
                }
            ]
        };
        
        this.init();
    }    init() {
        this.createSystems();
        this.setupInputCallbacks();
        
        // Connect rendering modules
        connectRenderingModules(this);
        
        // Start with difficulty selection instead of jumping straight to gameplay
        this.gameState = GAME_STATES.DIFFICULTY_SELECT;
        
        this.gameLoop(0);
    }createSystems() {
        // Core systems
        this.inputManager = new InputManager();
        this.upgradeSystem = new UpgradeSystem();
        this.shopSystem = new ShopSystem(this);
        this.leaderboardSystem = new LeaderboardSystem();
        
        // New rendering modules
        this.renderer = new GameRenderer(this);
        this.ui = new GameUI(this);
        this.dialogs = new GameDialogs(this);
        
        // Set up name input checker for InputManager
        this.inputManager.setNameInputChecker(() => {
            return this.leaderboardSystem && this.leaderboardSystem.nameInputActive;
        });
        
        // Add mouse click listener for leaderboard tabs and menus
        this.tabHitAreas = [];
        this.difficultyHitAreas = [];
        
        // Mouse state tracking
        this.mousePos = { x: 0, y: 0 };
        this.hoveredDifficulty = -1;
        
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }    /**
     * Handle mouse movement for hover effects
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mousePos.x = (e.clientX - rect.left) * scaleX;
        this.mousePos.y = (e.clientY - rect.top) * scaleY;
          // Reset hover states
        this.hoveredDifficulty = -1;
        let isOverClickable = false;
        
        // Check difficulty selection hover
        if (this.gameState === GAME_STATES.DIFFICULTY_SELECT) {
            for (let i = 0; i < this.difficultyHitAreas.length; i++) {
                const area = this.difficultyHitAreas[i];
                if (this.mousePos.x >= area.x && this.mousePos.x <= area.x + area.width &&
                    this.mousePos.y >= area.y && this.mousePos.y <= area.y + area.height) {
                    this.hoveredDifficulty = i;
                    isOverClickable = true;
                    break;
                }
            }
        }
        
        // Check leaderboard tab hover
        if (this.gameState === GAME_STATES.LEADERBOARD) {
            for (const tab of this.tabHitAreas) {
                if (this.mousePos.x >= tab.x && this.mousePos.x <= tab.x + tab.width &&
                    this.mousePos.y >= tab.y && this.mousePos.y <= tab.y + tab.height) {
                    isOverClickable = true;
                    break;
                }
            }
        }
        
        // Change cursor based on hover state
        this.canvas.style.cursor = isOverClickable ? 'pointer' : 'default';
    }

    /**
     * Handle canvas mouse clicks (for leaderboard tabs, upgrades, and difficulty)
     */    handleCanvasClick(e) {
        // Get click position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Handle reset confirmation dialog clicks
        if (this.gameState === GAME_STATES.RESET_CONFIRM && this.resetDialogHitAreas) {
            for (const button of this.resetDialogHitAreas) {
                if (x >= button.x && x <= button.x + button.width && 
                    y >= button.y && y <= button.y + button.height) {
                    if (button.action === 'cancel') {
                        this.cancelReset();
                    } else if (button.action === 'confirm') {
                        this.resetData();
                    }
                    return;
                }
            }
        }
        
        // Handle leaderboard tab clicks
        if (this.gameState === GAME_STATES.LEADERBOARD && this.tabHitAreas.length) {
            for (const tab of this.tabHitAreas) {
                if (x >= tab.x && x <= tab.x + tab.width && 
                    y >= tab.y && y <= tab.y + tab.height) {
                    this.leaderboardSystem.selectTab(tab.difficulty);
                    break;
                }
            }        }
          // Handle difficulty selection clicks
        if (this.gameState === GAME_STATES.DIFFICULTY_SELECT) {
            for (let i = 0; i < this.difficultyHitAreas.length; i++) {
                const area = this.difficultyHitAreas[i];
                if (x >= area.x && x <= area.x + area.width &&
                    y >= area.y && y <= area.y + area.height) {
                    this.difficultyIndex = i;
                    this.selectedDifficulty = this.difficultyKeys[this.difficultyIndex];
                    this.startNewGame();
                    break;
                }
            }
        }
    }
    
    /**
     * Draw difficulty tabs for leaderboard
     */
    drawDifficultyTabs(ctx, width) {
        const tabs = this.leaderboardSystem.getDifficultyTabs();
        const tabWidth = 120;
        const tabHeight = 30;
        const tabsStartX = width / 2 - ((tabWidth * tabs.length) / 2);
        const tabY = 85;
        
        // Clear previous hit areas
        this.tabHitAreas = [];
        
        // Draw tabs
        tabs.forEach((difficulty, index) => {
            const tabX = tabsStartX + (index * tabWidth);
            const difficultyInfo = DIFFICULTY_LEVELS[difficulty];
            const isSelected = this.leaderboardSystem.isTabSelected(difficulty);
            
            // Tab background
            ctx.fillStyle = isSelected ? 
                `rgba(${this.hexToRgb(difficultyInfo.color)}, 0.3)` : 
                'rgba(21, 32, 43, 0.5)';
            
            // Draw tab with rounded top
            ctx.beginPath();
            ctx.moveTo(tabX, tabY + tabHeight);
            ctx.lineTo(tabX, tabY + 5);
            ctx.quadraticCurveTo(tabX, tabY, tabX + 5, tabY);
            ctx.lineTo(tabX + tabWidth - 5, tabY);
            ctx.quadraticCurveTo(tabX + tabWidth, tabY, tabX + tabWidth, tabY + 5);
            ctx.lineTo(tabX + tabWidth, tabY + tabHeight);
            ctx.fill();
            
            // Tab border
            ctx.strokeStyle = isSelected ? difficultyInfo.color : '#30363d';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(tabX, tabY + tabHeight);
            ctx.lineTo(tabX, tabY + 5);
            ctx.quadraticCurveTo(tabX, tabY, tabX + 5, tabY);
            ctx.lineTo(tabX + tabWidth - 5, tabY);
            ctx.quadraticCurveTo(tabX + tabWidth, tabY, tabX + tabWidth, tabY + 5);
            ctx.lineTo(tabX + tabWidth, tabY + tabHeight);
            ctx.stroke();
            
            // Tab text
            ctx.fillStyle = isSelected ? difficultyInfo.color : '#8b949e';
            ctx.font = isSelected ? 'bold 14px Courier New' : '14px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`${difficultyInfo.emoji} ${difficultyInfo.name}`, tabX + tabWidth / 2, tabY + 20);
            
            // Store tab hit area for mouse interaction
            this.tabHitAreas.push({
                x: tabX,
                y: tabY,
                width: tabWidth,
                height: tabHeight,
                difficulty
            });
        });
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
      setupInputCallbacks() {
        this.inputManager.setCallback('pause', () => this.togglePause());        this.inputManager.setCallback('restart', () => {
            if (this.gameState === GAME_STATES.GAME_OVER || 
                this.gameState === GAME_STATES.PLAYING || 
                this.gameState === GAME_STATES.PAUSED) {
                this.restart();
            }
        });
        
        this.inputManager.setCallback('difficultySelect', () => {
            if (this.gameState === GAME_STATES.GAME_OVER) {
                this.goToDifficultySelection();
            }        });
          this.inputManager.setCallback('confirm', () => {
            // Only handle leaderboard confirm, upgrades/difficulty are now mouse-only
            if (this.gameState === GAME_STATES.LEADERBOARD) {
                this.handleLeaderboardConfirm();
            }
        });        this.inputManager.setCallback('skip', () => {
            if (this.gameState === GAME_STATES.CHANGELOG) {
                this.closeChangelog();
            } else if (this.gameState === GAME_STATES.LEADERBOARD && this.leaderboardSystem.showUploadPrompt) {
                this.leaderboardSystem.cancelUpload();
            }
        });
        
        // Changelog toggle
        this.inputManager.setCallback('changelog', () => {
            if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) {
                this.showChangelog();
            } else if (this.gameState === GAME_STATES.CHANGELOG) {
                this.closeChangelog();
            }
        });        // F3 Performance Toggle
        this.inputManager.setCallback('togglePerformance', () => {            this.showPerformanceDisplay = !this.showPerformanceDisplay;
        });
        
        // Leaderboard toggle
        this.inputManager.setCallback('leaderboard', () => {
            if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED || this.gameState === GAME_STATES.GAME_OVER) {
                this.showLeaderboard();
            } else if (this.gameState === GAME_STATES.LEADERBOARD) {
                this.closeLeaderboard();
            }
        });
          // Upload score
        this.inputManager.setCallback('uploadScore', () => {
            if (this.gameState === GAME_STATES.GAME_OVER) {
                this.initiateScoreUpload();
            }
        });
        
        // Text input for name entry
        this.inputManager.setCallback('textInput', (char) => {
            if (this.leaderboardSystem) {
                this.leaderboardSystem.handleTextInput(char);
            }
        });
          // Backspace for name entry
        this.inputManager.setCallback('backspace', () => {
            if (this.leaderboardSystem) {
                this.leaderboardSystem.handleBackspace();
            }
        });
        
        // Delete entry from leaderboard
        this.inputManager.setCallback('deleteEntry', () => {
            if (this.gameState === GAME_STATES.LEADERBOARD && this.leaderboardSystem) {
                this.handleDeleteEntry();
            }
        });
          // Change player name
        this.inputManager.setCallback('changeName', () => {
            if (this.gameState === GAME_STATES.LEADERBOARD && this.leaderboardSystem) {
                this.handleChangeName();
            }
        });
        
        // Fullscreen toggle
        this.inputManager.setCallback('fullscreen', () => {
            this.toggleFullscreen();
        });
    }    createWorld() {
        this.world = new WorldGenerator(this);
        this.physics = new PhysicsEngine(this.world);
        
        // Force generation of initial chunks to prevent void spawning
        this.world.generateChunk(0);
        this.world.generateChunk(1);
    }    createPlayer() {        // Use safe spawn position from world generator for better gameplay
        const spawnPos = this.world.findSafeSpawnPosition();
        this.player = new Player(spawnPos.x, spawnPos.y, this);
        
        // Apply existing shop upgrades to the new player
        if (this.shopSystem) {
            this.shopSystem.applyAllOwnedUpgrades();
        }
    }
    
    gameLoop(currentTime) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update performance metrics
        this.updatePerformanceMetrics(currentTime);
        
        if (this.gameState === GAME_STATES.PLAYING) {
            this.update(this.deltaTime);
        }
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }    update(deltaTime) {
        this.updateCamera();
        this.updateScore();
        this.updateHealthRegeneration(deltaTime);        
        // Update world generation
        if (this.world) {
            this.world.update(deltaTime, this.camera);
        }
          // Update player
        if (this.player) {
            const inputKeys = this.inputManager.getKeys();
            this.player.update(deltaTime, inputKeys, this.world, this.physics);
        }
    }updateCamera() {
        const targetX = this.player.x - this.canvas.width / 3;
        const clampedTargetX = Math.max(0, targetX);
        
        // Smooth camera movement to reduce jitter - linear interpolation
        const lerpFactor = 0.1; // Adjust for smoothness (0.05 = very smooth, 0.2 = responsive)
        this.camera.x = this.camera.x + (clampedTargetX - this.camera.x) * lerpFactor;
        
        this.camera.y = 100; // Fixed Y position
    }
    
    updateScore() {
        const distanceTraveled = Math.floor(this.player.x / 10);
        const bonuses = this.upgradeSystem.getBonuses();
        this.score = Math.max(this.score, Math.floor(distanceTraveled * bonuses.scoreMultiplier));
        this.bestDistance = Math.max(this.bestDistance, this.score);
        
        // Award data packets during gameplay (1 packet per 100 score points)
        const packetsEarned = Math.floor(this.score / 100);
        const currentPackets = this.upgradeSystem.getDataPackets();
        if (packetsEarned > currentPackets) {
            this.upgradeSystem.addDataPackets(packetsEarned - currentPackets);
        }
    }
      /**
     * Handle health regeneration over time based on difficulty
     */
    updateHealthRegeneration(deltaTime) {
        if (!this.player || this.player.health >= this.player.maxHealth) {
            return;
        }
        
        const difficulty = DIFFICULTY_LEVELS[this.selectedDifficulty];
        
        // Skip regeneration if difficulty has no regeneration (Extreme mode)
        if (difficulty.healthRegenInterval === 0) {
            return;
        }
        
        const currentTime = Date.now();
        const timeSinceLastRegen = currentTime - this.lastHealthRegenTime;
        
        // Regenerate 1 health based on difficulty interval
        if (timeSinceLastRegen >= difficulty.healthRegenInterval) {
            this.player.health = Math.min(this.player.health + 1, this.player.maxHealth);
            this.lastHealthRegenTime = currentTime;
            this.updateUI();
            
            // Create visual feedback for healing
            if (this.player.createHealText) {
                this.player.createHealText(1);
            }
        }
    }    render() {
        this.clearCanvas();
          if (this.gameState === GAME_STATES.DIFFICULTY_SELECT) {
            this.drawDifficultySelection();
            return;
        }
          if (this.gameState === GAME_STATES.CHANGELOG) {
            this.drawChangelog();
            return;
        }
        
        if (this.gameState === GAME_STATES.LEADERBOARD) {
            this.drawLeaderboard();
            return;
        }
        
        if (this.gameState === GAME_STATES.RESET_CONFIRM) {
            this.drawResetConfirmationDialog();
            return;
        }
        
        // Delegate to renderer for the main game screen
        this.renderer.renderGameScreen();
    }
    
    /**
     * Delegate to the dialogs module with appropriate parameters
     */
    delegateToDialogs(methodName) {
        switch(methodName) {
            case 'drawDifficultySelection':
                this.dialogs.drawDifficultySelection(this.difficultyHitAreas, this.hoveredDifficulty, this.difficultyKeys);
                break;
            case 'drawChangelog':
                this.dialogs.drawChangelog(this.changelogData);
                break;
            case 'drawLeaderboard':
                this.dialogs.drawLeaderboard(this.leaderboardSystem, this.tabHitAreas);
                break;
            case 'drawResetConfirmationDialog':
                this.dialogs.drawResetConfirmationDialog(this.resetDialogHitAreas);
                break;
        }    }

    drawUI() {
        // Use the GameUI module for UI rendering
        this.ui.drawUI();
        
        // Difficulty display (only during gameplay)
        if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) {
            const difficulty = DIFFICULTY_LEVELS[this.selectedDifficulty];
            this.ctx.fillStyle = difficulty.color;
            this.ctx.font = '14px Courier New';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${difficulty.emoji} ${difficulty.name}`, 15, 110);
        }
          // Performance monitoring display (top right)
        if (this.showPerformanceDisplay) {
            this.drawPerformanceDisplay();
        }
        
        // Data packets display (right side, only during gameplay)
        if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) {
            this.drawDataPacketsDisplay();
        }          // F3 hint in bottom right corner (only during gameplay)
        if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) {
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
        
        for (let i = 0; i < this.player.maxHealth; i++) {
            const x = startX + i * (heartSize + heartSpacing);
            const y = startY;
            
            // Draw heart background (empty heart)
            this.drawPixelHeart(x, y, heartSize, false);
            
            // Draw filled heart if player has this much health
            if (i < this.player.health) {
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
      drawGameOverOverlay() {
        // Calculate fade progress (0 to 1)
        const currentTime = Date.now();
        // gameOverStartTime should already be set when gameOver() is called
        // Don't reset it here to maintain accurate survival time calculation
        
        const elapsed = currentTime - this.gameOverStartTime;
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
        if (this.isNewHighScore && easedProgress > 0.3) {
            this.drawHighScoreCelebration(currentTime, textAlpha);
        }
        
        // Death reason
        if (this.gameOverReason) {
            this.ctx.fillStyle = `rgba(240, 246, 252, ${textAlpha})`;
            this.ctx.font = '16px Courier New';
            this.ctx.fillText(`Cause: ${this.gameOverReason}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        }
          // Player stats
        if (this.player) {
            this.ctx.fillStyle = `rgba(88, 166, 255, ${textAlpha})`;
            this.ctx.fillText(`Final Distance: ${this.score}m`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            
            // Show survival time - use gameOverStartTime to stop counting after death
            const survivalTime = Math.floor((this.gameOverStartTime - this.startTime) / 1000);
            this.ctx.fillText(`Survival Time: ${survivalTime}s`, this.canvas.width / 2, this.canvas.height / 2 + 30);
            
            // Show best distance
            if (this.bestDistance > 0) {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
                this.ctx.fillText(`Best Distance: ${this.bestDistance}m`, this.canvas.width / 2, this.canvas.height / 2 + 50);
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
            if (this.score >= 100 && this.leaderboardSystem && this.leaderboardSystem.canUploadForDifficulty(this.selectedDifficulty)) {
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
        const animationTime = currentTime - this.gameOverStartTime;
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
        const time = (currentTime - this.gameOverStartTime) * 0.001;
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
    
    togglePause() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
        } else if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
        }
    }    gameOver(reason) {
        // Update best distance
        this.bestDistance = Math.max(this.bestDistance, this.score);
        
        // Check if this is a new high score against the previous best
        // Require a minimum score of 50 to avoid celebrating very short runs
        const minScoreForCelebration = 50;
        this.isNewHighScore = this.score > this.previousBestDistance && 
                              this.score >= minScoreForCelebration;
          this.gameState = GAME_STATES.GAME_OVER;
        this.gameOverReason = reason;
        this.gameOverStartTime = Date.now();
        
        // Task 4: Call showLeaderboard() automatically on death screen
        if (this.leaderboardSystem) {
            this.leaderboardSystem.showLeaderboard(this.selectedDifficulty);
        }
    }    restart() {
        // Store the previous best before resetting
        this.previousBestDistance = this.bestDistance;
        
        this.gameState = GAME_STATES.INITIALIZING;
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        this.score = 0;
        this.startTime = Date.now();
        this.camera = { x: 0, y: 0 };
        
        // Clear previous world data to prevent void spawning issues
        this.world = null;
        this.player = null;
        this.physics = null;
        
        // Restart with current difficulty instead of going back to selection
        this.createWorld();
        this.createPlayer();
        this.gameState = GAME_STATES.PLAYING;
        this.lastHealthRegenTime = Date.now();
        this.updateUI();
    }    goToDifficultySelection() {
        // Store the previous best before resetting
        this.previousBestDistance = this.bestDistance;
        
        this.gameState = GAME_STATES.INITIALIZING;
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        this.score = 0;
        this.startTime = Date.now();
        this.camera = { x: 0, y: 0 };
        
        // Clear previous world data to prevent issues
        this.world = null;
        this.player = null;
        this.physics = null;
        
        // Go back to difficulty selection
        this.gameState = GAME_STATES.DIFFICULTY_SELECT;
        this.updateUI();
    }
    
    startNewGame() {
        // Clear any lingering input states to prevent auto-jumping
        this.inputManager.clearInputs();
        
        // Start the game with selected difficulty
        this.createWorld();
        this.createPlayer();
        
        this.gameState = GAME_STATES.PLAYING;
        this.startTime = Date.now();
        this.lastHealthRegenTime = Date.now();
        this.updateUI();
        
        // Game started with selected difficulty
    }
      showChangelog() {
        // Store the current game state to return to it later
        this.previousGameState = this.gameState;
        this.gameState = GAME_STATES.CHANGELOG;
    }
      closeChangelog() {
        // Return to the previous game state (PLAYING or PAUSED)
        this.gameState = this.previousGameState || GAME_STATES.PLAYING;
    }
    
    showLeaderboard() {
        // Store the current game state to return to it later
        this.previousGameState = this.gameState;
        this.gameState = GAME_STATES.LEADERBOARD;
    }
      closeLeaderboard() {
        // Return to the previous game state
        this.gameState = this.previousGameState || GAME_STATES.PLAYING;
        this.leaderboardSystem.clearResult();
    }
      handleLeaderboardConfirm() {
        if (this.leaderboardSystem.showUploadPrompt) {
            if (this.leaderboardSystem.playerName.trim()) {
                // Check if this is a name change operation
                if (this.leaderboardSystem.currentUpload && this.leaderboardSystem.currentUpload.isNameChange) {
                    // Handle name change
                    const updated = this.leaderboardSystem.updatePlayerName(this.leaderboardSystem.playerName);                    if (updated) {
                        this.leaderboardSystem.showUploadPrompt = false;
                        this.leaderboardSystem.nameInputActive = false;
                        this.leaderboardSystem.currentUpload = null;
                    }} else {
                    // Handle regular score submission
                    this.leaderboardSystem.submitScoreFromUpload(this.leaderboardSystem.playerName);
                }
            } else {
                this.leaderboardSystem.cancelUpload();
            }
        }
    }initiateScoreUpload() {
        if (!this.leaderboardSystem) return;
        
        // Use the actual survival time from the game state
        const survivalTime = Math.floor((this.gameOverStartTime - this.startTime) / 1000);
        const uploadStarted = this.leaderboardSystem.initiateUpload(this.selectedDifficulty, this.score, survivalTime);
        
        // If upload was initiated successfully, show the leaderboard
        if (uploadStarted) {
            this.showLeaderboard();
        }
    }
    
    /**
     * Handle deletion of player's entry from current difficulty leaderboard
     */
    handleDeleteEntry() {
        if (!this.leaderboardSystem) return;
        
        const hasEntry = this.leaderboardSystem.hasPlayerEntryInCurrentDifficulty();
        if (hasEntry) {
            const deleted = this.leaderboardSystem.deletePlayerEntry();
            if (deleted) {
                // Player entry successfully deleted
            }
        } else {
            this.leaderboardSystem.uploadResult = {
                success: false,
                message: 'No entry found to delete in this difficulty level.'
            };
        }
    }
    
    /**
     * Handle changing player name across all leaderboard entries
     */
    handleChangeName() {
        if (!this.leaderboardSystem) return;
        
        // Check if player has any entries
        const hasAnyEntry = Object.keys(DIFFICULTY_LEVELS).some(difficulty => 
            this.leaderboardSystem.playerEntries.has(difficulty)
        );
        
        if (!hasAnyEntry) {
            this.leaderboardSystem.uploadResult = {
                success: false,
                message: 'No entries found. You must have at least one leaderboard entry to change your name.'
            };
            return;
        }
        
        // Start name input mode for changing name
        this.leaderboardSystem.showUploadPrompt = true;
        this.leaderboardSystem.nameInputActive = true;
        this.leaderboardSystem.playerName = this.leaderboardSystem.getSavedPlayerName() || '';
        this.leaderboardSystem.currentUpload = { isNameChange: true }; // Flag to indicate this is a name change
    }
    
    handleUpgradePurchase() {
        const selectedIndex = this.upgradeSystem.getSelectedUpgrade();
        const purchased = this.upgradeSystem.purchaseUpgrade(selectedIndex);
          if (purchased) {
            // Play purchase sound and create visual effect
            this.playPurchaseSound();
            this.createPurchaseEffect(selectedIndex);
        } else {
            this.playErrorSound();
        }
    }
    
    startGame() {
        this.createWorld();
        this.createPlayer();
        
        this.gameState = GAME_STATES.PLAYING;
        this.startTime = Date.now();
        this.lastHealthRegenTime = Date.now();
        this.updateUI();    }
      /**
     * Draw the difficulty selection screen
     */
    drawDifficultySelection() {
        this.dialogs.drawDifficultySelection();
    }
        
        // Animated particles in background
        const time = Date.now() * 0.001;
        for (let i = 0; i < 30; i++) {
            const x = (Math.sin(time * 0.5 + i * 0.1) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.3 + i * 0.15) * 0.5 + 0.5) * height;
            const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;
            const size = 1 + Math.sin(time + i) * 0.5;
            
            ctx.fillStyle = `rgba(79, 172, 254, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Main title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT DIFFICULTY', width / 2, 80);
        
        // Subtitle
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.fillText('Choose your health regeneration rate', width / 2, 110);        // Instructions
        ctx.font = '14px Courier New';
        ctx.fillText('Hover and Click to Start Game', width / 2, 140);
        
        // Difficulty options
        let y = 200;
        
        // Reset difficulty hit areas
        this.difficultyHitAreas = [];
          this.difficultyKeys.forEach((diffKey, index) => {
            const difficulty = DIFFICULTY_LEVELS[diffKey];
            const isHovered = index === this.hoveredDifficulty;
            
            // Create hit area for this difficulty
            const hitArea = {
                x: width/2 - 300,
                y: y - 35,
                width: 600,
                height: 60,
                index: index
            };
            this.difficultyHitAreas.push(hitArea);
              // Highlight hovered difficulty only (mouse-only interaction)
            if (isHovered) {
                // Green hover aura effect with border
                ctx.shadowColor = '#40d158';
                ctx.shadowBlur = 25;
                ctx.fillStyle = 'rgba(64, 209, 88, 0.25)';
                ctx.fillRect(width/2 - 300, y - 35, 600, 60);
                
                // Add subtle border
                ctx.strokeStyle = '#40d158';
                ctx.lineWidth = 2;
                ctx.strokeRect(width/2 - 300, y - 35, 600, 60);
                ctx.shadowBlur = 0;
            }
              // Difficulty emoji and name
            ctx.fillStyle = difficulty.color;
            ctx.font = 'bold 24px Courier New';
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.fillText(`${difficulty.emoji} ${difficulty.name}`, width/2 - 280, y - 5);
            
            // Difficulty description
            ctx.font = '16px Courier New';
            ctx.fillStyle = '#7d8590';
            ctx.fillText(difficulty.description, width/2 - 280, y + 20);
            
            // Health regeneration info
            ctx.font = '14px Courier New';
            let regenText = '';
            if (difficulty.healthRegenInterval === 0) {
                regenText = 'No health regeneration';
            } else {
                const minutes = Math.floor(difficulty.healthRegenInterval / 60000);
                if (minutes < 1) {
                    const seconds = Math.floor(difficulty.healthRegenInterval / 1000);
                    regenText = `Regenerates 1 health every ${seconds} seconds`;
                } else {
                    regenText = `Regenerates 1 health every ${minutes} minute${minutes > 1 ? 's' : ''}`;
                }
            }
            ctx.fillText(regenText, width/2 + 50, y + 5);
            
            y += 80;
        });
        
        // Footer
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        ctx.fillText('Choose wisely - difficulty affects survival and strategy!', width/2, height - 40);
        
        ctx.restore();
    }
      /**
     * Draw the changelog with game updates and improvements
     */
    drawChangelog() {
        this.dialogs.drawChangelog(this.changelogData);
    }
        
        // Animated particles background
        const time = Date.now() * 0.001;
        
        // Floating particles
        for (let i = 0; i < 30; i++) {
            const x = (Math.sin(time * 0.5 + i * 0.1) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.3 + i * 0.15) * 0.5 + 0.5) * height;
            const alpha = 0.08 + Math.sin(time * 2 + i) * 0.04
            const size = 1 + Math.sin(time + i) * 0.5;
            
            ctx.fillStyle = `rgba(79, 172, 254, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Code-themed particles
        for (let i = 0; i < 15; i++) {
            const x = (Math.sin(time * 0.7 + i * 0.4) * 0.9 + 0.5) * width;
            const y = (Math.cos(time * 0.6 + i * 0.3) * 0.7 + 0.5) * height;
            const alpha = 0.05 + Math.sin(time * 3 + i) * 0.03;
            
            ctx.fillStyle = `rgba(64, 209, 88, ${alpha})`;
            ctx.font = '8px Courier New';
            ctx.fillText(['v', '.', '{}', '[]', '+'][i % 5], x, y);
        }
        
        // Main title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('CHANGELOG', width / 2, 60);
        
        // Version info
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#79c0ff';
        ctx.fillText(`Current Version: ${this.changelogData.version} - ${this.changelogData.lastUpdated}`, width / 2, 85);
        
        // Instructions
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.fillText('Press [C] or [Esc] to Return', width / 2, 110);
        
        // Changelog entries
        let y = 150;
        const maxHeight = height - 180;
        const lineHeight = 18;
        
        for (let entryIndex = 0; entryIndex < this.changelogData.entries.length && y < maxHeight; entryIndex++) {
            const entry = this.changelogData.entries[entryIndex];
            
            // Version header
            ctx.fillStyle = '#58a6ff';
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`${entry.version} - ${entry.title}`, 50, y);
            y += 25;
            
            // Date
            ctx.fillStyle = '#7d8590';
            ctx.font = '12px Courier New';
            ctx.fillText(entry.date, 50, y);
            y += 20;
            
            // Changes
            ctx.fillStyle = '#f0f6fc';
            ctx.font = '13px Courier New';
            
            for (let i = 0; i < entry.changes.length && y < maxHeight - 20; i++) {
                const change = entry.changes[i];
                
                // Split long lines
                const maxWidth = width - 100;
                const words = change.split(' ');
                let currentLine = '';
                
                for (let word of words) {
                    const testLine = currentLine + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && currentLine !== '') {
                        ctx.fillText(currentLine.trim(), 70, y);
                        y += lineHeight;
                        currentLine = word + ' ';
                        
                        if (y >= maxHeight - 20) break;
                    } else {
                        currentLine = testLine;
                    }
                }
                
                if (currentLine.trim() !== '' && y < maxHeight - 20) {
                    ctx.fillText(currentLine.trim(), 70, y);
                    y += lineHeight;
                }
            }
            
            y += 15; // Space between entries
        }
        
        // Footer
        ctx.font = 'bold 16px Courier New';
        ctx.fillStyle = '#56d364';
        ctx.textAlign = 'center';
        ctx.fillText('Press [C] to Return to Game', width/2, height - 30);
        
        ctx.restore();
    }
      /**
     * Draw the leaderboard with smooth animations
     */
    drawLeaderboard() {
        this.dialogs.drawLeaderboard(this.leaderboardSystem, this.tabHitAreas);
    }
    
    /**
     * Draw the score upload prompt dialog
     */
    drawUploadPrompt() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // Dialog box
        const dialogWidth = 500;
        const dialogHeight = 250;
        const dialogX = (width - dialogWidth) / 2;
        const dialogY = (height - dialogHeight) / 2;
        
        // Background with gradient
        const gradient = ctx.createLinearGradient(dialogX, dialogY, dialogX, dialogY + dialogHeight);
        gradient.addColorStop(0, '#161b22');
        gradient.addColorStop(1, '#0d1117');
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Courier New';
        ctx.fillText('Upload Your Score', width / 2, dialogY + 40);
        
        // Score info
        const { score, difficulty, survivalTime } = this.leaderboardSystem.currentUpload;
        const difficultyInfo = DIFFICULTY_LEVELS[difficulty];
        
        // Format survival time properly
        const minutes = Math.floor(survivalTime / 60);
        const seconds = Math.floor(survivalTime % 60);
        const timeFormatted = `${minutes}m ${seconds}s`;
        
        ctx.fillStyle = '#7d8590';
        ctx.font = '14px Courier New';
        ctx.fillText(`${difficultyInfo.emoji} ${difficultyInfo.name} - ${score}m - ${timeFormatted}`, width / 2, dialogY + 70);
        
        // Input field
        const inputWidth = 300;
        const inputX = (width - inputWidth) / 2;
        const inputY = dialogY + 110;
        
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(inputX, inputY, inputWidth, 40);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        ctx.strokeRect(inputX, inputY, inputWidth, 40);
        
        // Player name text with cursor
        ctx.fillStyle = '#f0f6fc';
        ctx.textAlign = 'left';
        ctx.font = '18px Courier New';
        
        const playerName = this.leaderboardSystem.playerName;
        const textX = inputX + 10;
        ctx.fillText(playerName, textX, inputY + 26);
        
        // Blinking cursor
        if (this.leaderboardSystem.nameInputActive && Math.floor(Date.now() / 500) % 2 === 0) {
            const textWidth = ctx.measureText(playerName).width;
            ctx.fillStyle = '#f0f6fc';
            ctx.fillRect(textX + textWidth + 2, inputY + 8, 2, 24);
        }
        
        // Instructions
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        ctx.font = '14px Courier New';
        ctx.fillText('Enter your name and press ENTER to submit', width / 2, dialogY + 170);
        ctx.fillText('Press ESC to cancel', width / 2, dialogY + 190);
        
        // Loading state
        if (this.leaderboardSystem.isUploading) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
            
            ctx.fillStyle = '#56d364';
            ctx.font = '18px Courier New';
            ctx.fillText('Uploading score...', width / 2, height / 2);
            
            // Animated upload indicator
            const time = Date.now() * 0.005;
            for (let i = 0; i < 3; i++) {
                const dotAlpha = 0.3 + 0.7 * Math.sin(time + i * 2);
                ctx.fillStyle = `rgba(86, 211, 100, ${dotAlpha})`;                ctx.fillRect(width / 2 + (i - 1) * 15, height / 2 + 20, 8, 8);
            }
        }
    }
    
    /**
     * Draw the reset confirmation dialog
     */
    drawResetConfirmationDialog() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // Dialog box
        const dialogWidth = 550;
        const dialogHeight = 350;
        const dialogX = (width - dialogWidth) / 2;
        const dialogY = (height - dialogHeight) / 2;
        
        // Background with gradient
        const gradient = ctx.createLinearGradient(dialogX, dialogY, dialogX, dialogY + dialogHeight);
        gradient.addColorStop(0, '#161b22');
        gradient.addColorStop(1, '#0d1117');
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#f85149'; // Red border for warning
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.stroke();
        
        // Warning icon
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f85149';
        ctx.fillText('⚠️ RESET ALL SAVE DATA ⚠️', width / 2, dialogY + 40);
        
        // Description text
        ctx.fillStyle = '#f0f6fc';
        ctx.font = '16px Courier New';
        ctx.fillText('This will permanently delete:', width / 2, dialogY + 80);
        
        // List of items that will be deleted
        ctx.fillStyle = '#7d8590';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        const itemsX = dialogX + 100;
        let itemY = dialogY + 115;
        const items = [
            '• All shop upgrades and owned items',
            '• Profile information (name, picture, stats)',
            '• Leaderboard entries and scores',
            '• Upload history and player data',
            '• All game progress and achievements'
        ];
        
        items.forEach(item => {
            ctx.fillText(item, itemsX, itemY);
            itemY += 25;
        });
        
        // Warning message
        ctx.fillStyle = '#f85149';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText('This action CANNOT be undone!', width / 2, dialogY + 265);
        
        // Animated buttons
        const time = Date.now() * 0.001;
        
        // Cancel button
        const cancelButtonX = dialogX + 100;
        const cancelButtonY = dialogY + 300;
        const cancelButtonWidth = 150;
        const cancelButtonHeight = 36;
        
        ctx.fillStyle = '#30363d';
        this.drawRoundedRect(ctx, cancelButtonX, cancelButtonY, cancelButtonWidth, cancelButtonHeight, 4);
        ctx.fill();
        
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, cancelButtonX, cancelButtonY, cancelButtonWidth, cancelButtonHeight, 4);
        ctx.stroke();
        
        ctx.fillStyle = '#58a6ff';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Cancel', cancelButtonX + cancelButtonWidth / 2, cancelButtonY + 24);
        
        // Confirm button with pulsing effect
        const confirmButtonX = dialogX + dialogWidth - 250;
        const confirmButtonY = dialogY + 300;
        const confirmButtonWidth = 150;
        const confirmButtonHeight = 36;
        
        const pulseScale = 0.05 * Math.sin(time * 4) + 1;
        
        ctx.fillStyle = 'rgba(248, 81, 73, 0.2)';
        this.drawRoundedRect(
            ctx, 
            confirmButtonX - (confirmButtonWidth * pulseScale - confirmButtonWidth) / 2, 
            confirmButtonY - (confirmButtonHeight * pulseScale - confirmButtonHeight) / 2, 
            confirmButtonWidth * pulseScale, 
            confirmButtonHeight * pulseScale, 
            4
        );
        ctx.fill();
        
        ctx.fillStyle = '#21262d';
        this.drawRoundedRect(ctx, confirmButtonX, confirmButtonY, confirmButtonWidth, confirmButtonHeight, 4);
        ctx.fill();
        
        ctx.strokeStyle = '#f85149';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, confirmButtonX, confirmButtonY, confirmButtonWidth, confirmButtonHeight, 4);
        ctx.stroke();
        
        ctx.fillStyle = '#f85149';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Reset Data', confirmButtonX + confirmButtonWidth / 2, confirmButtonY + 24);
        
        // Store button hit areas for mouse interaction
        this.resetDialogHitAreas = [
            {
                x: cancelButtonX,
                y: cancelButtonY,
                width: cancelButtonWidth,
                height: cancelButtonHeight,
                action: 'cancel'
            },
            {
                x: confirmButtonX,
                y: confirmButtonY,
                width: confirmButtonWidth,
                height: confirmButtonHeight,
                action: 'confirm'
            }
        ];
    }
    
    /**
     * Show the reset confirmation dialog
     */
    showResetConfirmationDialog() {
        // Store the previous game state to return to it if the reset is cancelled
        this.previousGameState = this.gameState;
        this.gameState = GAME_STATES.RESET_CONFIRM;
        this.resetDialogHitAreas = [];
    }
    
    /**
     * Cancel the reset operation and return to the previous game state
     */
    cancelReset() {
        // Return to previous game state
        this.gameState = this.previousGameState || GAME_STATES.PLAYING;
        this.resetDialogHitAreas = [];
    }
    
    /**
     * Reset all save data
     */
    resetData() {
        try {
            // Clear all CodeRunner localStorage keys
            const keysToRemove = [
                'coderunner_profile',           // Profile data (name, picture, stats)
                'coderunner_owned_upgrades',    // Shop system upgrades
                'coderunner_leaderboards',      // Leaderboard data
                'coderunner_uploads',           // Upload history
                'coderunner_player_name',       // Saved player name
                'coderunner_player_entries',    // Player's leaderboard entries
                'coderunner_moderation',        // Moderation data
                'coderunner_no_fake_data'       // Fake data flag
            ];
            
            let removedCount = 0;
            keysToRemove.forEach(key => {
                if (localStorage.getItem(key) !== null) {
                    localStorage.removeItem(key);
                    removedCount++;
                }
            });
            
            // Reset game systems if they exist
            if (this.shopSystem) {
                this.shopSystem.reset();
            }
            
            // Reset upgrade system data packets
            if (this.upgradeSystem) {
                this.upgradeSystem.dataPackets = 0;
                this.upgradeSystem.resetUpgrades();
            }
            
            // Reset leaderboard system
            if (this.leaderboardSystem) {
                // Clear leaderboard data
                Object.keys(this.leaderboardSystem.leaderboards).forEach(difficulty => {
                    this.leaderboardSystem.leaderboards[difficulty] = [];
                });
                this.leaderboardSystem.uploadedDifficulties.clear();
                this.leaderboardSystem.playerEntries.clear();
                this.leaderboardSystem.savedPlayerName = '';
                this.leaderboardSystem.playerName = '';
            }
            
            // Reset profile manager if it exists
            if (window.profileManager) {
                window.profileManager.profileData = {
                    name: 'Anonymous',
                    gamesPlayed: 0,
                    totalPackets: 0,
                    playTime: 0,
                    profilePicture: Array(256).fill('#161b22')
                };
                
                // Update UI elements
                const nameInput = document.getElementById('playerName');
                if (nameInput) {
                    nameInput.value = 'Anonymous';
                }
                
                // Reset pixel editor canvas
                const canvas = document.getElementById('pixelCanvas');
                if (canvas) {
                    const pixels = canvas.querySelectorAll('.pixel');
                    pixels.forEach(pixel => {
                        pixel.style.backgroundColor = '#161b22';
                    });
                }
            }
            
            // Show success message and reload the page
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
            // Return to the title/difficulty screen
            this.gameState = GAME_STATES.DIFFICULTY_SELECT;
            
            return true;
        } catch (error) {
            // Error during save data reset
            return false;
        }
    }
    
    clearCanvas() {
        // Enhanced background for larger screen with gameplay particles
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0d1117');
        gradient.addColorStop(0.5, '#161b22');
        gradient.addColorStop(1, '#21262d');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add background particles during gameplay
        if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) {
            const time = Date.now() * 0.001;
            
            // Flowing data packets (8 instead of 5)
            for (let i = 0; i < 8; i++) {
                const x = (time * 30 + i * 200) % (this.canvas.width + 100) - 50;
                const y = 50 + i * 80;
                const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;
                
                this.ctx.fillStyle = `rgba(79, 172, 254, ${alpha})`;
                this.ctx.font = '12px Courier New';
                this.ctx.fillText('▶', x, y);
            }
            
            // Code fragments (10 instead of 8)
            for (let i = 0; i < 10; i++) {
                const x = (time * -20 + i * 150) % (this.canvas.width + 100);
                const y = 100 + i * 60;
                const alpha = 0.08 + Math.sin(time * 1.5 + i) * 0.04;
                
                this.ctx.fillStyle = `rgba(64, 209, 88, ${alpha})`;
                this.ctx.font = '10px Courier New';
                const codeChars = ['{}', '()', '[]', '<>', ';;'][i % 5];
                this.ctx.fillText(codeChars, x, y);
            }
            
            // Network connection lines
            this.ctx.strokeStyle = 'rgba(121, 192, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                this.ctx.beginPath();
                const y = 150 + i * 200;
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y + Math.sin(time + i) * 20);
                this.ctx.stroke();
            }
        }
    }
    
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
    
    updateUI() {
        const uiScore = document.getElementById('score');
        const uiBest = document.getElementById('best-distance');
        const uiHealth = document.getElementById('health');
        
        if (uiScore) uiScore.textContent = this.score;
        if (uiBest) uiBest.textContent = this.bestDistance;
        if (uiHealth && this.player) uiHealth.textContent = this.player.health;
    }
    
    /**
     * Update performance metrics for monitoring
     */
    updatePerformanceMetrics(currentTime) {
        // Update FPS counter
        this.fpsCounter.frames++;
        if (currentTime - this.fpsCounter.lastTime >= 1000) {
            this.fpsCounter.currentFPS = Math.round(this.fpsCounter.frames * 1000 / (currentTime - this.fpsCounter.lastTime));
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = currentTime;
        }
    }
    
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics() {
        return {
            fps: this.fpsCounter.currentFPS,
            renderTime: this.performanceMetrics.renderTime,
            updateTime: this.performanceMetrics.updateTime,
            particleCount: this.performanceMetrics.particleCount,
            resolution: `${this.canvas.width}x${this.canvas.height}`
        };
    }
    
    /**
     * Draw performance monitoring display
     */
    drawPerformanceDisplay() {
        const metrics = this.getPerformanceMetrics();
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
        
        // Frame timing (simulated - would need actual timing)
        this.ctx.fillStyle = '#79c0ff';
        this.ctx.fillText(`Render: ${metrics.renderTime.toFixed(1)}ms`, x, y + 45);
        this.ctx.fillText(`Update: ${metrics.updateTime.toFixed(1)}ms`, x, y + 60);
        
        // Resolution
        this.ctx.fillStyle = '#7d8590';
        this.ctx.fillText(`Resolution: ${metrics.resolution}`, x, y + 75);
        
        // Particle count (estimated)
        this.ctx.fillText(`Particles: ~${metrics.particleCount}`, x, y + 90);
        
        // Performance warning
        if (metrics.fps < 30) {
            this.ctx.fillStyle = '#f85149';
            this.ctx.fillText('⚠ Low FPS detected', x, y + 105);
        }
    }
    
    /**
     * Play purchase sound effect
     */
    playPurchaseSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Silent fail if audio context not available
        }
    }
    
    /**
     * Play error sound effect
     */
    playErrorSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Silent fail if audio context not available
        }
    }
    
    /**
     * Create visual purchase effect
     */
    createPurchaseEffect(upgradeIndex) {
        this.purchaseEffect = {
            upgradeIndex: upgradeIndex,
            startTime: Date.now(),
            duration: 1000
        };
    }
    
    /**
     * Draw data packets display on the right side
     */    drawDataPacketsDisplay() {
        const dataPackets = this.upgradeSystem.getDataPackets();
        const x = this.canvas.width - 180;
        // Position below performance monitor if it's showing, otherwise at top
        const y = this.showPerformanceDisplay ? 155 : 15;
        
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
     * Toggle fullscreen mode
     */    toggleFullscreen() {
        try {
            const canvasContainer = document.querySelector('.canvas-container');
            
            if (!document.fullscreenElement) {
                // Enter fullscreen on canvas container only
                if (canvasContainer.requestFullscreen) {
                    canvasContainer.requestFullscreen();
                } else if (canvasContainer.webkitRequestFullscreen) {
                    canvasContainer.webkitRequestFullscreen();
                } else if (canvasContainer.msRequestFullscreen) {
                    canvasContainer.msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        } catch (error) {
            // Fullscreen operation failed
        }
    }
}
