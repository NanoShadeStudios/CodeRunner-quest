// filepath: c:\Users\lutaa\OneDrive\Desktop\CodeRunner\src\core\Game.js
/**
 * Game Engine - Main game loop and coordination
 */

import { GAME_CONFIG, GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';
import { InputManager } from '../systems/InputManager.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { LeaderboardSystem } from '../systems/LeaderboardSystem.js';
import { OpeningAnimationSystem } from '../systems/OpeningAnimationSystem.js';


import { LoginSystem } from '../systems/LoginSystem.js';
// import { UserProfileSystem } from '../systems/UserProfileSystem.js'; // TODO: Implement UserProfileSystem
import { WorldGenerator } from './WorldGenerator.js';
import { Player } from './Player.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { GameRenderer } from '../rendering/GameRenderer.js';
import { GameUI } from '../rendering/GameUI.js';
import { GameDialogs } from '../rendering/GameDialogs.js';

// Debug helper
import { UpgradeTestHelper } from '../debug/UpgradeTestHelper.js';

// Module integration helper
import { connectRenderingModules } from './game-module-bridge.js';

export class Game {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById(GAME_CONFIG.CANVAS_ID);        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to fill the window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
          // Initialize performance metrics
        this.performanceMetrics = {
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            fpsHistory: []
        };        // Visual effects arrays
        this.milestoneEffects = [];
        this.speedPenaltyEffects = [];
        this.effectPool = {
            milestone: [],
            speedPenalty: []
        };
        this.maxPoolSize = 10;
        
        // Changelog and version data
        this.changelogData = {
            version: "v2.1.0",
            lastUpdated: "June 2025",
            entries: [
                {
                    version: "v2.1.0",
                    date: "June 2025",
                    title: "Bug Fixes & Performance",
                    changes: [
                        "🐛 FIXES:",
                        "• Fixed player movement not working",
                        "• Fixed input handling system",
                        "• Fixed game initialization errors",
                        "• Improved performance metrics",
                        "",
                        "⚡ IMPROVEMENTS:",
                        "• Better error handling",
                        "• Fallback key bindings",
                        "• More stable game loop"
                    ]
                }
            ]
        };
        
        // Game state and timing
        this.gameState = GAME_STATES.INITIALIZING;
        this.previousGameState = null;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.lastRenderTime = 0;
        this.lastMetricsUpdate = 0;
        this.lastAdaptiveOptimization = 0;
        
        // Game objects
        this.player = null;
        this.world = null;
        this.physics = null;
        this.camera = { x: 0, y: 0 };
        
        // Game systems
        this.inputManager = null;
        this.upgradeSystem = null;
        this.leaderboardSystem = null;
        this.audioSystem = null;
        
        // Graphics settings
        this.graphicsQuality = 'medium'; // Will be updated from settings
          // Difficulty level settings
        this.selectedDifficulty = 'EASY';
        this.difficultyKeys = Object.keys(DIFFICULTY_LEVELS);
        
        // Score and game state
        this.score = 0;
        this.bonusScore = 0;
        this.bestScores = {
            EASY: 0,
            MEDIUM: 0,
            HARD: 0,
            EXTREME: 0,
            IMPOSSIBLE: 0
        };
        
        // Game timing
        this.startTime = 0;
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        
        // Health regeneration
        this.healthRegenRate = 1000;
        this.lastHealthRegenTime = 0;
        
        // Speed penalty system
        this.speedPenalty = {
            enabled: true,
            segmentDistance: 1000,
            timeLimit: 15000,
            penalty: 100,
            lastCheckpoint: 0,
            segmentStartTime: 0,
            totalPenalties: 0,
            totalPenaltyPoints: 0
        };
        
        // UI state
        this.tabHitAreas = [];
        this.difficultyHitAreas = [];
        this.shopHitAreas = [];
        this.homeHitAreas = [];
        this.creditsHitAreas = [];
        this.mousePos = { x: 0, y: 0 };
        this.hoveredDifficulty = -1;
        this.hoveredHomeButton = -1;
        
        // Initialize the game asynchronously
        this.initAsync();
    }async initAsync() {
        try {
            await this.init();
        } catch (error) {
            console.error('🎮 Game initialization failed:', error);
            // Fallback to basic initialization
            this.gameState = GAME_STATES.HOME;
            this.gameLoop(0);
        }
    }

    async init() {console.log('🎮 Game.init() started');
        this.createSystems();
        this.setupInputCallbacks();
        
        // Initialize graphics quality from settings
        this.initializeGraphicsSettings();
        
        // Add debug commands for testing upgrades (after systems are created)
        this.addDebugCommands();
          // Load saved best scores
        this.loadBestScores();
        
        // Load saved game data (data packets, etc.)
        console.log('🎮 Game.init() about to call loadGameData()');
        this.loadGameData();
        console.log('🎮 Game.init() finished loadGameData()');
          // Start continuous autosave system (runs regardless of game state)
        this.startAutosave();        // Connect rendering modules (after systems are created)
        connectRenderingModules(this);
        
        // Check authentication state and determine initial navigation
        console.log('🔑 Checking authentication state for automatic navigation...');
        await this.determineInitialNavigation();
        
        this.gameLoop(0);
    }createSystems() {        this.inputManager = new InputManager();
        this.shopSystem = new ShopSystem(this);        this.upgradeSystem = new UpgradeSystem();
        this.leaderboardSystem = new LeaderboardSystem(this);
        this.openingAnimation = new OpeningAnimationSystem(this);
        // this.audioVideoPrompt = new AudioVideoPromptSystem(this); // Removed - going directly to login
        this.loginSystem = new LoginSystem(this);
        // this.userProfileSystem = new UserProfileSystem(this); // TODO: Implement UserProfileSystem
        
        this.renderer = new GameRenderer(this);        // Set up name input checker for InputManager
        this.inputManager.setNameInputChecker(() => {
            // Check if leaderboard name input is active
            const leaderboardInputActive = this.leaderboardSystem && this.leaderboardSystem.nameInputActive;
              // Check if login system has focused input fields
            const loginInputActive = this.loginSystem && this.loginSystem.hasActiveFocusedField();
            
            // Check if user profile system has focused input fields (TODO: Re-enable when UserProfileSystem is implemented)
            // const profileInputActive = this.userProfileSystem && this.userProfileSystem.isActive && 
            //                          Object.values(this.userProfileSystem.inputFields || {}).some(field => field.focused);
            
            return leaderboardInputActive || loginInputActive; // || profileInputActive;
        });// Add mouse click listener for leaderboard tabs and menus
        this.tabHitAreas = [];
        this.difficultyHitAreas = [];
        this.shopHitAreas = [];
        this.homeHitAreas = [];
        this.creditsHitAreas = [];
        
        // Mouse state tracking
        this.mousePos = { x: 0, y: 0 };
        this.hoveredDifficulty = -1;
        this.hoveredHomeButton = -1;
          this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));    }
    
    /**
     * Resize canvas to fill the window while maintaining aspect ratio
     */
    resizeCanvas() {
        // Get the display size (CSS pixels)
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        // Check if the canvas is not the same size
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            // Make the canvas the same size
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }
    
    setupInputCallbacks() {
        // Core game controls
        this.inputManager.setCallback('pause', () => this.togglePause());
        this.inputManager.setCallback('restart', () => this.restart());
        this.inputManager.setCallback('confirm', () => this.handleConfirm());
        this.inputManager.setCallback('skip', () => this.handleEscape());
          // Screen navigation
        this.inputManager.setCallback('changelog', () => this.toggleChangelog());
        this.inputManager.setCallback('difficultySelect', () => this.showDifficultySelection());
        this.inputManager.setCallback('leaderboard', () => this.showLeaderboard());
        this.inputManager.setCallback('continue', () => this.handleContinue());
        this.inputManager.setCallback('profile', () => this.showProfile());
        
        // Leaderboard functionality
        this.inputManager.setCallback('uploadScore', () => this.handleUploadScore());
        this.inputManager.setCallback('textInput', (char) => this.handleTextInput(char));
        this.inputManager.setCallback('backspace', () => this.handleBackspace());
        this.inputManager.setCallback('deleteEntry', () => this.handleDeleteEntry());
        this.inputManager.setCallback('changeName', () => this.handleChangeName());
        
        // Shop functionality
        this.inputManager.setCallback('shop', () => this.handleShopToggle());
        this.inputManager.setCallback('shopScrollUp', () => this.handleShopScroll(-1));
        this.inputManager.setCallback('shopScrollDown', () => this.handleShopScroll(1));
          // System controls
        this.inputManager.setCallback('togglePerformance', () => this.togglePerformanceDisplay());
        this.inputManager.setCallback('fullscreen', () => this.toggleFullscreen());
    }

    /**
     * Initialize graphics settings from general settings
     */    initializeGraphicsSettings() {
        if (window.generalSettings) {
            this.graphicsQuality = window.generalSettings.getGraphicsQuality();
            this.showFpsCounter = window.generalSettings.isShowFpsCounterEnabled();
            console.log('🎮 Graphics settings initialized - FPS counter:', this.showFpsCounter);
            this.applyGraphicsQuality();
        } else {
            // Default values if settings not available yet
            this.graphicsQuality = 'medium';
            this.showFpsCounter = false;
            console.log('🎮 Using default graphics settings - FPS counter:', this.showFpsCounter);
        }
    }    /**
     * Apply graphics quality settings to game systems
     */
    applyGraphicsQuality() {
        // Apply settings based on quality level
        switch (this.graphicsQuality) {
            case 'low':
                // Reduce particle effects and visual quality
                this.particleQuality = 0.3;
                this.tileDetailLevel = 'low';
                this.lightingQuality = 'low';
                this.shadowQuality = 'off';
                break;
            case 'medium':
                // Default settings
                this.particleQuality = 0.7;
                this.tileDetailLevel = 'medium';
                this.lightingQuality = 'medium';
                this.shadowQuality = 'low';
                break;
            case 'high':
                // Maximum quality
                this.particleQuality = 1.0;
                this.tileDetailLevel = 'high';
                this.lightingQuality = 'high';
                this.shadowQuality = 'high';
                break;
        }
        
        // Apply to existing world if available
        if (this.world) {
            this.world.particleQuality = this.particleQuality;
            this.world.tileDetailLevel = this.tileDetailLevel;
        }
        
        // Apply renderer optimizations based on quality
        if (this.renderer) {
            this.renderer.setRenderOptimizations({
                skipBackgroundParticles: this.graphicsQuality === 'low',
                reduceGradientComplexity: this.graphicsQuality === 'low',
                cacheGradients: this.graphicsQuality !== 'low'
            });
        }
        
        // Apply tile renderer optimizations
        if (this.world?.tileRenderer) {
            this.world.tileRenderer.setHighPerformanceMode(this.graphicsQuality === 'low');
        }
    }

    /**
     * Handle mouse movement for UI interactions
     */
    handleMouseMove(e) {
        // Get mouse position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Update mouse position
        this.mousePos.x = x;
        this.mousePos.y = y;        // Handle different game states
        switch (this.gameState) {            case GAME_STATES.VIDEO_INTRO:
                // Video intro system removed - skipping video intro state
                break;
                
            case GAME_STATES.HOME:
                this.handleHomeHover(x, y);
                break;
                
            case GAME_STATES.DIFFICULTY_SELECT:
                this.handleDifficultyHover(x, y);
                break;
                
            case GAME_STATES.LEADERBOARD:
                // Pass through to leaderboard system if needed
                break;
                
            case GAME_STATES.SHOP:
                // Handle shop hover effects if needed
                break;
                
            default:
                // Reset hover states for other game states
                this.hoveredDifficulty = -1;
                break;
        }
        
        // Handle popup system mouse movement if popup is active
        if (this.popupSystem && this.popupSystem.activePopup) {
            this.popupSystem.handleMouseMove(x, y);
        }
    }    /**
     * Handle clicks in post animation popup
     */
    handlePostAnimationPopupClick(x, y) {
        // For the popup, any click anywhere should close it and go to home
        // Play menu click sound
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }
        
        // Transition to home screen
        this.gameState = GAME_STATES.HOME;
    }

    /**
     * Handle mouse hover effects for home screen
     */
    handleHomeHover(x, y) {
        this.hoveredHomeButton = -1;
        
        // Check if mouse is over any home button
        if (this.homeHitAreas) {
            for (let i = 0; i < this.homeHitAreas.length; i++) {
                const area = this.homeHitAreas[i];
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    this.hoveredHomeButton = i;
                    break;
                }
            }
        }
    }

    /**
     * Handle clicks in home screen
     */
    handleHomeClick(x, y) {
        if (!this.homeHitAreas) return;
        
        // Check if any home button was clicked
        for (let i = 0; i < this.homeHitAreas.length; i++) {
            const area = this.homeHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                  // Handle different button actions
                if (area.action === 'play') {
                    this.gameState = GAME_STATES.DIFFICULTY_SELECT;
                } else if (area.action === 'credits') {
                    this.previousGameState = GAME_STATES.HOME;
                    this.gameState = GAME_STATES.CREDITS;
                } else if (area.action === 'profile') {
                    this.showProfile();
                }
                break;
            }
        }
    }

    /**
     * Handle clicks in credits screen
     */
    handleCreditsClick(x, y) {
        if (!this.creditsHitAreas) return;
        
        // Check if back button was clicked
        for (const area of this.creditsHitAreas) {
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                if (area.action === 'back') {
                    this.gameState = GAME_STATES.HOME;
                }
                break;
            }
        }
    }

    /**
     * Handle mouse hover effects for difficulty selection
     */
    handleDifficultyHover(x, y) {
        this.hoveredDifficulty = -1;
        
        // Check if mouse is over any difficulty button
        for (let i = 0; i < this.difficultyHitAreas.length; i++) {
            const area = this.difficultyHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                this.hoveredDifficulty = i;
                break;
            }
        }
    }

    /**
     * Handle canvas mouse clicks for UI interactions
     */
    handleCanvasClick(e) {
        // Get click position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;        // Handle different game states
        switch (this.gameState) {            case GAME_STATES.VIDEO_INTRO:
                // Video intro system removed - skipping video intro state
                break;
                  case GAME_STATES.LOGIN_PROMPT:
                // Handle login prompt clicks (delegate to login system)
                if (this.loginSystem) {
                    this.loginSystem.handleClick(x, y);
                }
                break;
                  case GAME_STATES.PROFILE:
                // Handle profile system clicks (delegate to profile system)
                // TODO: Re-enable when UserProfileSystem is implemented
                // if (this.userProfileSystem) {
                //     this.userProfileSystem.handleClick(x, y);
                // }
                break;
                
            case GAME_STATES.POST_ANIMATION_POPUP:
                this.handlePostAnimationPopupClick(x, y);
                break;
                
            case GAME_STATES.HOME:
                this.handleHomeClick(x, y);
                break;
                
            case GAME_STATES.CREDITS:
                this.handleCreditsClick(x, y);
                break;
                
            case GAME_STATES.DIFFICULTY_SELECT:
                this.handleDifficultyClick(x, y);
                break;
                
            case GAME_STATES.LEADERBOARD:
                this.handleLeaderboardClick(x, y);
                break;
                  case GAME_STATES.SHOP:
                this.handleShopClick(x, y);
                break;
                  case GAME_STATES.RESET_CONFIRM:
                this.handleResetConfirmClick(x, y);
                break;
                
            case GAME_STATES.GAME_OVER:
                this.handleGameOverClick(x, y);
                break;
                  default:
                // Handle popup system clicks if popup is active
                if (this.popupSystem && this.popupSystem.activePopup) {
                    this.popupSystem.handleClick(x, y);
                }
                break;
        }
    }

    /**
     * Handle mouse wheel scrolling for shop interface
     */
    handleMouseWheel(e) {
        // Only handle wheel events in shop state
        if (this.gameState !== GAME_STATES.SHOP) {
            return;
        }

        // Prevent default scroll behavior
        e.preventDefault();

        // Determine scroll direction (deltaY > 0 = scroll down, deltaY < 0 = scroll up)
        const direction = e.deltaY > 0 ? 1 : -1;
        
        // Use existing scroll handler
        this.handleShopScroll(direction);
    }

    /**
     * Handle clicks in difficulty selection screen
     */
    handleDifficultyClick(x, y) {
        // Check if any difficulty button was clicked
        for (let i = 0; i < this.difficultyHitAreas.length; i++) {
            const area = this.difficultyHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Select the difficulty and start the game
                this.selectedDifficulty = this.difficultyKeys[i];                this.startGame();
                break;
            }
        }
    }

    /**
     * Start the game with the selected difficulty
     */    startGame() {
        // Initialize world generator
        this.world = new WorldGenerator(this);
        
        // Initialize physics engine with world reference
        this.physics = new PhysicsEngine(this.world);
        
        // Find a safe spawn position using the world generator
        const spawnPosition = this.world.findSafeSpawnPosition();
        
        // Create player at spawn position without upgrades (shop system handles upgrades)
        this.player = new Player(spawnPosition.x, spawnPosition.y, this, null);
        
        // Apply shop upgrades to player if available
        if (this.shopSystem) {
            this.shopSystem.applyAllOwnedUpgrades(this.player);
        }
        
        // Set camera position so player appears on far left of screen (no void behind)
        this.camera.x = this.player.x - 50; // Position player 50px from left edge
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // Generate initial chunks for the camera position to ensure world is visible on spawn
        this.world.generateChunksForCamera(this.camera);
        
        // Force update visible chunks for immediate rendering on first frame
        const startChunk = Math.floor(this.camera.x / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE)) - 1;
        const endChunk = Math.ceil((this.camera.x + this.canvas.width) / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE)) + 1;
        this.world.updateVisibleChunks(startChunk, endChunk);
        this.world.lastCameraX = this.camera.x; // Update camera tracking to prevent immediate re-update
        
        // Reset game state variables
        this.score = 0;
        this.bonusScore = 0;
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
          // Record start time for survival tracking
        this.startTime = Date.now();
        
        // Set last health regen time to current time
        this.lastHealthRegenTime = this.startTime;
          // Initialize speed penalty system
        this.speedPenalty.lastCheckpoint = this.player.x;
        this.speedPenalty.segmentStartTime = this.startTime;
        this.speedPenalty.totalPenalties = 0;
        this.speedPenalty.totalPenaltyPoints = 0;
        
        // Change game state to playing
        this.gameState = GAME_STATES.PLAYING;
    }

    /**
     * Restart the current game with the same difficulty
     */
    restart() {        // Reset milestone tracking
        this.lastMilestone = 0;
        this.milestoneEffects = [];
        
        // Reset speed penalty effects
        this.speedPenaltyEffects = [];
        
        // Clear any existing game over state
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        
        // Restart the game using the same initialization logic as startGame
        this.startGame();
          // Play restart sound if available
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }
    }

    /**
     * Handle clicks in leaderboard screen
     */
    handleLeaderboardClick(x, y) {
        if (!this.tabHitAreas.length) return;
        
        // Check if any tab was clicked
        for (const tab of this.tabHitAreas) {
            if (x >= tab.x && x <= tab.x + tab.width && 
                y >= tab.y && y <= tab.y + tab.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                  this.leaderboardSystem.selectTab(tab.difficulty);
                break;
            }
        }
    }

    /**
     * Handle clicks in game over screen
     */
    handleGameOverClick(x, y) {
        // For now, any click during game over will restart the game
        // This provides the basic functionality to make UI responsive again
        
        // Play menu click sound
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }
        
        // Restart the game
        this.restart();
    }    /**
     * Handle clicks in shop screen
     */
    handleShopClick(x, y) {
        // Check if we have any shop hit areas to process
        if (!this.shopHitAreas || !this.shopHitAreas.length) {
            console.log(`⚠️ No shop hit areas available for clicking`);
            return;
        }
        
        // Get scroll offset for click position adjustment
        const scrollOffset = this.shopScrollOffset || 0;        // Debugging: Log click attempt
        console.log(`🖱️ Shop click at (${x}, ${y}), scroll offset: ${scrollOffset}`);
        console.log(`📋 Available hit areas: ${this.shopHitAreas.length}`);
        console.log(`🎯 Click position: original Y = ${y} (no adjustment needed - hit areas are screen-positioned)`);
        
        // Filter to problematic upgrades for focused debugging
        const problematicUpgrades = this.shopHitAreas.filter(area => 
            area.upgradeId === 'score-multiplier' || area.upgradeId === 'datapack-multiplier'
        );
        
        if (problematicUpgrades.length > 0) {
            console.log(`🎯 Found ${problematicUpgrades.length} problematic upgrades in hit areas:`, 
                problematicUpgrades.map(area => ({ id: area.upgradeId, x: area.x, y: area.y, w: area.width, h: area.height }))
            );
        }// Check if any shop item was clicked
        for (const hitArea of this.shopHitAreas) {
            // Hit areas are already positioned in SCREEN coordinates (scroll-adjusted during drawing)
            // So we should use the raw click position without further adjustment
            const adjustedClickY = y; // Use raw click Y - no scroll adjustment needed
            
            // Collision detection
            const isInX = x >= hitArea.x && x <= hitArea.x + hitArea.width;
            const isInY = adjustedClickY >= hitArea.y && adjustedClickY <= hitArea.y + hitArea.height;            // Enhanced debugging for problematic upgrades
            if (hitArea.upgradeId === 'score-multiplier' || hitArea.upgradeId === 'datapack-multiplier') {
                console.log(`🔍 DETAILED CLICK CHECK for ${hitArea.upgradeId}:`, {
                    hitArea: { x: hitArea.x, y: hitArea.y, w: hitArea.width, h: hitArea.height },
                    rawClick: { x, y },
                    clickPosition: { x, y: adjustedClickY }, // No scroll adjustment
                    collision: { 
                        x: isInX, 
                        y: isInY,
                        xRange: `${hitArea.x} <= ${x} <= ${hitArea.x + hitArea.width}`,
                        yRange: `${hitArea.y} <= ${adjustedClickY} <= ${hitArea.y + hitArea.height}`
                    },
                    scrollOffset,
                    match: isInX && isInY
                });
            }
            
            if (isInX && isInY) {
                console.log(`🎯 HIT DETECTED! Processing ${hitArea.upgradeId}`);
                
                // Handle purchase action
                if (hitArea.action === 'buy' && hitArea.upgradeId) {
                    console.log(`💰 Attempting purchase of ${hitArea.upgradeId}...`);
                    const success = this.shopSystem.buyUpgrade(hitArea.upgradeId);
                    
                    if (success) {
                        // Play purchase sound
                        if (this.audioSystem) {
                            this.audioSystem.onMenuClick();
                        }
                        
                        // Force shop to refresh hit areas by clearing them
                        // This ensures the next render will show updated ownership status
                        this.shopHitAreas = [];
                        
                        console.log(`✅ Shop purchase successful: ${hitArea.upgradeId}`);
                        
                    } else {
                        // Play error sound for failed purchase
                        if (this.audioSystem) {
                            this.audioSystem.onDamage();
                        }
                        
                        console.log(`❌ Shop purchase failed: ${hitArea.upgradeId}`);
                    }
                }
                  break; // Stop checking other hit areas once we find a match
            }
        }
        
        console.log(`🔚 Shop click processing complete - no hits detected`);
    }

    /**
     * Handle clicks in reset confirmation dialog
     */
    handleResetConfirmClick(x, y) {
        // Check if we have reset dialog hit areas to process
        if (!this.resetDialogHitAreas || !this.resetDialogHitAreas.length) return;
        
        // Check if any reset dialog button was clicked
        for (const hitArea of this.resetDialogHitAreas) {
            if (x >= hitArea.x && x <= hitArea.x + hitArea.width && 
                y >= hitArea.y && y <= hitArea.y + hitArea.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Handle button actions
                if (hitArea.action === 'cancel') {
                    // Close the reset dialog and return to previous state
                    this.gameState = this.previousGameState || GAME_STATES.DIFFICULTY_SELECT;                } else if (hitArea.action === 'confirm') {
                    // Perform the reset operation
                    this.performResetSaveData();
                }
                
                break; // Stop checking other hit areas once we find a match
            }
        }
    }

    /**
     * Perform the actual reset of all save data
     */
    performResetSaveData() {
        try {
            // Clear all localStorage keys related to the game
            const keysToRemove = [
                'coderunner_save_data',
                'coderunner_best_scores',
                'coderunner_owned_upgrades',
                'coderunner_audio_settings',
                'coderunner_leaderboards',
                'coderunner_player_name',
                'coderunner_uploads',
                'coderunner_player_entries',
                'coderunner_moderation',
                'coderunner_general_settings',
                'coderunner_no_fake_data'
            ];
            
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (error) {
                    console.warn(`Failed to remove ${key}:`, error);
                }
            });
            
            // Reset all game systems to their initial state
            this.resetGameSystems();
            
            // Show success message
            if (this.popupSystem) {
                this.popupSystem.showConfirmationPopup(
                    "Reset Complete",
                    "All game data has been successfully reset. The page will reload to apply changes.",
                    () => {
                        // Reload the page to ensure clean state
                        window.location.reload();
                    }
                );
            } else {
                // Fallback if popup system isn't available
                alert("All game data has been reset successfully. The page will reload.");
                window.location.reload();
            }
            
        } catch (error) {
            console.error('Error during reset:', error);
            
            // Show error message
            if (this.popupSystem) {
                this.popupSystem.showErrorPopup(
                    "Reset Error",
                    "An error occurred while resetting data. Please try again or refresh the page manually.",
                    () => {
                        this.popupSystem.closePopup();
                        // Return to difficulty selection
                        this.gameState = GAME_STATES.DIFFICULTY_SELECT;
                    }
                );
            } else {
                alert("An error occurred during reset. Please refresh the page manually.");
                this.gameState = GAME_STATES.DIFFICULTY_SELECT;
            }
        }
    }

    /**
     * Reset all game systems to their initial state
     */
    resetGameSystems() {
        // Reset upgrade system
        if (this.upgradeSystem) {
            this.upgradeSystem.dataPackets = 0;
        }
        
        // Reset shop system
        if (this.shopSystem && this.shopSystem.reset) {
            this.shopSystem.reset();
        }
        
        // Reset leaderboard system
        if (this.leaderboardSystem) {
            // Clear local data
            this.leaderboardSystem.savedPlayerName = '';
            this.leaderboardSystem.playerName = '';
            this.leaderboardSystem.uploadedDifficulties = new Set();
            this.leaderboardSystem.playerEntries = new Map();
            
            // Reset leaderboards
            Object.keys(this.leaderboardSystem.leaderboards || {}).forEach(difficulty => {
                this.leaderboardSystem.leaderboards[difficulty] = [];
            });
        }
        
        // Reset audio system to defaults
        if (this.audioSystem) {
            this.audioSystem.masterVolume = 0.7;
            this.audioSystem.sfxVolume = 0.8;
            this.audioSystem.musicVolume = 0.5;
            this.audioSystem.isMuted = false;
            this.audioSystem.musicMode = 'chill';
        }
          // Reset best scores
        this.bestScores = {
            easy: 0,
            normal: 0,
            hard: 0,
            nightmare: 0,
            impossible: 0
        };
        
        // Reset autosave tracking
        this.lastSaveData = null;
        this.dataFingerprint = null;
        this.savesPrevented = 0;
        
        // Reset to difficulty selection screen
        this.gameState = GAME_STATES.DIFFICULTY_SELECT;
    }

    /**
     * Handle shop scrolling
     */
    handleShopScroll(direction) {
        if (this.gameState !== GAME_STATES.SHOP) {
            return;
        }

        // Initialize scroll offset if not set
        if (this.shopScrollOffset === undefined) {
            this.shopScrollOffset = 0;
        }        // Calculate scroll amount (direction: -1 for up, 1 for down)
        const scrollAmount = 120; // Increased for faster scrolling, especially downward
        this.shopScrollOffset += direction * scrollAmount;        // Clamp scroll offset to valid range
        const maxScroll = this.shopMaxScroll || 0;
        this.shopScrollOffset = Math.max(0, Math.min(this.shopScrollOffset, maxScroll));
        
        // Temporary debug loggingconsole
        ;
    }

    /**
     * Handle shop toggle
     */
    handleShopToggle() {
        
        
        if (this.gameState === GAME_STATES.SHOP) {
            // Return to previous state
            
            this.gameState = this.previousGameState || GAME_STATES.DIFFICULTY_SELECT;
        } else {
            // Open shop and remember previous state
            
            this.previousGameState = this.gameState;
            this.gameState = GAME_STATES.SHOP;
            
            // Initialize shop scroll offset
            this.shopScrollOffset = 0;
        }
    }

    /**
     * Toggle shop - alias for handleShopToggle for HTML interface compatibility
     */
    toggleShop() {
        return this.handleShopToggle();
    }

    /**
     * Toggle pause state between playing and paused
     */
    togglePause() {
        // Only allow pause/unpause during PLAYING or PAUSED states
        if (this.gameState === GAME_STATES.PLAYING) {
            // Pause the game
            this.gameState = GAME_STATES.PAUSED;
            this.isPaused = true;
            
            // Play menu sound if available
            if (this.audioSystem) {
                this.audioSystem.onMenuOpen();
            }
        } else if (this.gameState === GAME_STATES.PAUSED) {
            // Resume the game
            this.gameState = GAME_STATES.PLAYING;
            this.isPaused = false;
            
            // Play menu sound if available
            if (this.audioSystem) {
                this.audioSystem.onMenuClose();
            }
        }
        // If called from other states, do nothing
    }    /**
     * Main game loop - handles updates and rendering
     */    gameLoop(timestamp) {
        // Request the next frame
        requestAnimationFrame((ts) => this.gameLoop(ts));
        
        // Initialize performance tracking if needed
        if (!this.performanceMetrics) {
            this.performanceMetrics = {
                frameTime: 0,
                updateTime: 0,
                renderTime: 0,
                fpsHistory: []
            };
        }
        
        // Calculate delta time
        if (!this.lastFrameTime) {
            this.lastFrameTime = timestamp;
        }
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update FPS counter and performance metrics
        this.updateFPS(deltaTime);
        
        // Measure update time
        const updateStart = performance.now();
        this.update(deltaTime);
        this.lastUpdateTime = performance.now() - updateStart;
        
        // Measure render time
        const renderStart = performance.now();
        this.render();
        this.lastRenderTime = performance.now() - renderStart;
    }/**
     * Update FPS counter
     */
    updateFPS(deltaTime) {
        if (deltaTime > 0) {
            this.fps = Math.round(1000 / deltaTime);
        }
        
        // Update performance metrics with throttling
        this.updatePerformanceMetrics(deltaTime);
    }    /**
     * Update performance metrics with throttling to reduce overhead
     */    updatePerformanceMetrics(deltaTime) {
        const now = performance.now();
        
        // Initialize metrics object if it doesn't exist
        if (!this.performanceMetrics) {
            this.performanceMetrics = {
                frameTime: 0,
                updateTime: 0,
                renderTime: 0,
                fpsHistory: []
            };
        }
        
        // Throttle metrics updates to every 100ms (10 times per second) to reduce overhead
        if (!this.lastMetricsUpdate || now - this.lastMetricsUpdate >= 100) {
            this.performanceMetrics.frameTime = deltaTime;
            this.performanceMetrics.updateTime = this.lastUpdateTime || 0;
            this.performanceMetrics.renderTime = this.lastRenderTime || 0;
            
            // Maintain FPS history with sampling (only keep last 60 values)
            this.performanceMetrics.fpsHistory.push(this.fps);
            if (this.performanceMetrics.fpsHistory.length > 60) {
                this.performanceMetrics.fpsHistory.shift();
            }
            
            this.lastMetricsUpdate = now;
            
            // Apply adaptive optimizations every 2 seconds
            if (now - (this.lastAdaptiveOptimization || 0) > 2000) {
                this.applyAdaptivePerformanceOptimizations();
                this.lastAdaptiveOptimization = now;
            }
        }
    }/**
     * Get performance metrics with caching and throttling
     */
    getPerformanceMetrics() {
        const now = performance.now();
        
        // Cache metrics for 100ms to avoid expensive calculations on every call (increased from 50ms)
        if (this.cachedMetrics && this.lastMetricsCacheTime && 
            now - this.lastMetricsCacheTime < 100) {
            return this.cachedMetrics;
        }
        
        // Calculate average FPS from history (sampled data)
        const fpsHistory = this.performanceMetrics.fpsHistory;
        const avgFps = fpsHistory.length > 0 ? 
            Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length) : this.fps;
        
        // Create cached metrics object
        this.cachedMetrics = {
            fps: this.fps,
            avgFps: avgFps,
            frameTime: this.performanceMetrics.frameTime,
            updateTime: this.performanceMetrics.updateTime,
            renderTime: this.performanceMetrics.renderTime,
            resolution: `${this.canvas.width}x${this.canvas.height}`,
            entities: this.world?.entities?.length || 0,
            chunks: this.world?.chunks?.size || 0,
            memory: this.getMemoryUsageEstimate(),
            poolStats: this.getPoolStats(),
            renderStats: this.renderer?.getRenderStats?.() || {}
        };
        
        this.lastMetricsCacheTime = now;
        return this.cachedMetrics;
    }/**
     * Update game logic
     */
    update(deltaTime) {
        // Handle audio/video prompt
        if (this.gameState === GAME_STATES.AUDIO_VIDEO_PROMPT) {
            if (this.audioVideoPrompt) {
                this.audioVideoPrompt.update(deltaTime);
            }
            return;
        }

        // Handle video intro
        if (this.gameState === GAME_STATES.VIDEO_INTRO) {
            // Video intro system removed - transition directly to appropriate state
            if (this.openingAnimation && this.openingAnimation.shouldPlay()) {
                this.gameState = GAME_STATES.OPENING_ANIMATION;
                this.openingAnimation.start();
            } else {
                this.gameState = GAME_STATES.HOME;
            }
            return;
        }

        // Handle opening animation
        if (this.gameState === GAME_STATES.OPENING_ANIMATION) {
            if (this.openingAnimation) {
                this.openingAnimation.update(deltaTime);
                
                // Check if animation is complete
                if (!this.openingAnimation.isActive) {
                    // Don't override the state if it was already changed by onComplete()
                    if (this.gameState === GAME_STATES.OPENING_ANIMATION) {
                        this.gameState = GAME_STATES.HOME;
                    }
                }
            }
            return;
        }

        // Handle login prompt
        if (this.gameState === GAME_STATES.LOGIN_PROMPT) {
            if (this.loginSystem) {
                this.loginSystem.update(deltaTime);
            }
            return;
        }

        // Handle user profile system
        if (this.gameState === GAME_STATES.PROFILE) {
            // TODO: Re-enable when UserProfileSystem is implemented
            // if (this.userProfileSystem) {
            //     this.userProfileSystem.update(deltaTime);
            // }
            return;
        }        // Only update core systems if game is playing
        if (this.gameState === GAME_STATES.PLAYING) {
            // Batch system updates for better performance
            this.updateCoreGameSystems(deltaTime);
        }

        // Update visual effects (milestone and speed penalty effects)
        // These run regardless of game state for smooth transitions
        this.updateVisualEffects(deltaTime);
        
        // Note: TileRenderer is updated by WorldGenerator.update(), not here
    }    /**
     * Batch update core game systems for better performance
     */    updateCoreGameSystems(deltaTime) {
        // Update systems in order of dependency
        if (this.player) {
            try {
                this.player.update(deltaTime, this.inputManager.getKeys(), this.world, this.physics);
            } catch (error) {
                console.error('🚨 Error in player.update():', error);
                console.error('🚨 Error stack:', error.stack);
            }// Update score based on distance traveled plus collected bonuses
            if (this.player.startX !== undefined) {
                const distanceTraveled = Math.max(0, this.player.x - this.player.startX);
                
                // Calculate base distance score - if user has score multiplier upgrade, give 2 points per meter instead of 1
                let baseDistanceScore = Math.floor(distanceTraveled / 10); // Default: 1 point per 10 pixels (1 point per meter)
                
                // Check if player has score multiplier upgrade - if so, double the distance score
                if (this.player && this.player.shopUpgrades.scoreMultiplier > 1.0) {
                    baseDistanceScore = Math.floor(distanceTraveled / 5); // 2 points per 10 pixels (2 points per meter)
                }
                
                // Add bonus score from data packets and other sources
                if (this.bonusScore === undefined) {
                    this.bonusScore = 0;
                }
                
                // Calculate total score (no additional multiplier needed since distance scoring is already enhanced)
                const totalScore = Math.max(0, baseDistanceScore + this.bonusScore - this.speedPenalty.totalPenaltyPoints);
                
                this.score = totalScore;
                
                // Speed penalty system - check if player is taking too long
                this.checkSpeedPenalty(distanceTraveled);
            }
        }

        if (this.world) {
            this.world.update(deltaTime, this.player);
        }

        // Update camera to follow player
        if (this.camera && this.player) {
            // Position player on the left side of screen (not centered) to avoid void behind player
            this.camera.x = this.player.x - 50;
            this.camera.y = this.player.y - this.canvas.height / 2;
        }
        
        // Check for distance milestones and award bonus data packets
        this.checkDistanceMilestones();
        
        // Check for game over conditions
        if (this.player && this.player.health <= 0 && this.gameState !== GAME_STATES.GAME_OVER) {
            this.gameOver();
        }
    }

    /**
     * Update visual effects with performance optimizations
     */
    updateVisualEffects(deltaTime) {
        // Update milestone visual effects
        this.updateMilestoneEffects(deltaTime);
        
        // Update speed penalty visual effects
        this.updateSpeedPenaltyEffects(deltaTime);
    }
    /**
     * Autosave System Methods
     */    /**
     * Save current game data to localStorage
     */
    saveGameData() {        try {            // Prepare comprehensive save data
            const saveData = {
                // Core game data
                dataPackets: this.upgradeSystem.getDataPackets(),
                bestScores: this.bestScores,
                
                // Shop upgrades
                ownedUpgrades: this.shopSystem ? this.shopSystem.getOwnedUpgrades() : [],
                
                // Profile data
                profileData: this.getProfileData(),
                
                // Audio settings
                audioSettings: this.getAudioSettings(),
                
                // Leaderboard preferences
                leaderboardData: this.getLeaderboardData(),
                
                // Metadata
                timestamp: Date.now(),
                version: "1.4.0" // For future compatibility
            };

            // Create fingerprint for change detection (excluding timestamp)
            const dataForFingerprint = { ...saveData };
            delete dataForFingerprint.timestamp;
            const newFingerprint = this.createDataFingerprint(dataForFingerprint);
              // Check if data actually changed since last save
            if (this.dataFingerprint === newFingerprint && this.lastSaveData) {
                this.savesPrevented++;
                // Debug logging for datapackets
                if (window.debugMode) {
                    console.log(`Autosave skipped - no changes detected. Current datapackets: ${saveData.dataPackets}, Last saved: ${this.lastSaveData.dataPackets}`);
                }
                return true; // Return success without saving
            }

            this.autosaveStatus = 'saving';
            this.showAutosaveIndicator = true;

            // Debug logging for successful saves
            if (window.debugMode) {
                console.log(`💾 Saving game data - datapackets: ${saveData.dataPackets}, fingerprint changed: ${this.dataFingerprint} -> ${newFingerprint}`);
            }

            // Save to localStorage
            localStorage.setItem('coderunner_save_data', JSON.stringify(saveData));
            
            // Update optimization tracking
            this.lastSaveData = saveData;
            this.dataFingerprint = newFingerprint;
            this.autosaveStatus = 'saved';
            this.lastSaveTime = Date.now();
            
            // Reset prevented saves counter occasionally
            if (this.savesPrevented > 100) {
                
                this.savesPrevented = 0;
            }
            
            // Hide indicator after 2 seconds
            setTimeout(() => {
                this.showAutosaveIndicator = false;
            }, 2000);

            return true;

        } catch (error) {
            
            this.autosaveStatus = 'error';
            
            // Hide error indicator after 3 seconds
            setTimeout(() => {
                this.showAutosaveIndicator = false;
            }, 3000);
            
            return false;
        }
    }    /**
     * Create a quick fingerprint/hash of save data for change detection
     */
    createDataFingerprint(data) {
        // More robust hash function for change detection
        try {
            const str = JSON.stringify(data, Object.keys(data).sort());
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash + str.length;
        } catch (e) {
            // Fallback to simple method
            return JSON.stringify(data).length + Object.keys(data).length;
        }
    }

    /**
     * Get profile data for save system
     */
    getProfileData() {
        return {
            selectedDifficulty: this.selectedDifficulty,
            difficultyIndex: this.difficultyIndex,
            lastPlayTime: Date.now(),
            totalPlaySessions: (this.profileData?.totalPlaySessions || 0) + 1
        };
    }

    /**
     * Get audio settings for save system
     */
    getAudioSettings() {
        if (this.audioSystem) {
            return this.audioSystem.getSettings ? this.audioSystem.getSettings() : {
                masterVolume: 1.0,
                musicVolume: 0.7,
                sfxVolume: 0.8,
                musicEnabled: true,
                sfxEnabled: true
            };
        }
        return {
            masterVolume: 1.0,
            musicVolume: 0.7,
            sfxVolume: 0.8,
            musicEnabled: true,
            sfxEnabled: true
        };
    }

    /**
     * Get leaderboard data for save system
     */
    getLeaderboardData() {
        if (this.leaderboardSystem) {
            return this.leaderboardSystem.getLocalData ? this.leaderboardSystem.getLocalData() : {
                playerName: this.leaderboardSystem.playerName || '',
                localScores: []
            };
        }
        return {
            playerName: '',
            localScores: []
        };    }

    /**
     * Load profile data from save system
     */    loadProfileData(profileData) {
        try {
            if (profileData && typeof profileData === 'object') {
                // Restore difficulty settings
                if (profileData.selectedDifficulty && DIFFICULTY_LEVELS[profileData.selectedDifficulty]) {
                    this.selectedDifficulty = profileData.selectedDifficulty;
                }
                
                if (typeof profileData.difficultyIndex === 'number' && profileData.difficultyIndex >= 0) {
                    this.difficultyIndex = Math.min(profileData.difficultyIndex, this.difficultyKeys.length - 1);
                }
                
                // Restore session data
                if (typeof profileData.totalPlaySessions === 'number') {
                    this.profileData = this.profileData || {};
                    this.profileData.totalPlaySessions = profileData.totalPlaySessions;
                }
                
                
            }
        } catch (error) {
            
        }
    }

    /**
     * Load saved game data from localStorage
     */
    loadGameData() {
        try {
            const savedData = localStorage.getItem('coderunner_save_data');
            
            if (savedData) {
                // Show loading popup if popup system is available
                if (this.popupSystem) {
                    this.popupSystem.showLoadingPopup("Loading game data...");
                }
                  const data = JSON.parse(savedData);
                
                // Debug logging for load
                if (window.debugMode) {
                    console.log(`📂 Loading game data - datapackets from save: ${data.dataPackets}, current: ${this.upgradeSystem.getDataPackets()}`);
                }
                
                // Restore data packets
                if (typeof data.dataPackets === 'number') {
                    const previousDataPackets = this.upgradeSystem.getDataPackets();
                    this.upgradeSystem.dataPackets = data.dataPackets;
                    
                    if (window.debugMode) {
                        console.log(`💾 Datapackets restored: ${previousDataPackets} -> ${data.dataPackets}`);
                    }
                }
                  // Restore best scores (merge with existing)
                if (data.bestScores) {
                    Object.keys(data.bestScores).forEach(difficulty => {
                        if (typeof data.bestScores[difficulty] === 'number') {
                            this.bestScores[difficulty] = Math.max(
                                this.bestScores[difficulty] || 0,
                                data.bestScores[difficulty]
                            );
                        }
                    });
                }
                
                // Restore shop upgrades
                if (data.ownedUpgrades && this.shopSystem) {
                    this.shopSystem.loadOwnedUpgrades(data.ownedUpgrades);
                }
                
                // Restore profile data
                if (data.profileData) {
                    this.loadProfileData(data.profileData);
                }                // Restore audio settings
                if (data.audioSettings && this.audioSystem) {
                   
                    // Only load audio settings if this isn't the initial load (to avoid overriding fresh AudioSystem settings)
                    // Check if AudioSystem has already been properly initialized by looking for a recent direct save
                    const directSettings = localStorage.getItem('coderunner_audio_settings');
                    let shouldLoadUnifiedSettings = true;
                    
                    if (directSettings) {
                        try {
                            const parsed = JSON.parse(directSettings);
                            // If direct localStorage settings are very recent (within last 5 seconds), 
                            // it means AudioSystem just loaded them and we shouldn't override
                            const timeSinceDirectSave = Date.now() - (parsed.timestamp || 0);
                            if (timeSinceDirectSave < 5000) {
                                
                                shouldLoadUnifiedSettings = false;
                            }
                        } catch (e) {
                            // If parsing fails, proceed with unified settings
                        }
                    }
                    
                    if (shouldLoadUnifiedSettings) {
                        this.audioSystem.loadSettings(data.audioSettings);
                    }
                }
                
                // Restore leaderboard data
                if (data.leaderboardData && this.leaderboardSystem) {
                    this.leaderboardSystem.loadSavedData(data.leaderboardData);
                }
                
                this.autosaveStatus = 'loaded';
                this.showAutosaveIndicator = true;
                
                // Close loading popup and show loaded confirmation
                if (this.popupSystem) {
                    this.popupSystem.closePopup();
                    
                    setTimeout(() => {
                        this.popupSystem.showConfirmationPopup(
                            "Game Loaded",
                            `Successfully loaded your saved game!\n\nData Packets: ${data.dataPackets || 0}\nUpgrades: ${data.ownedUpgrades ? data.ownedUpgrades.length : 0} owned`,

                            () => {
                                this.popupSystem.closePopup();
                            }
                        );
                    }, 300);
                }
                
                // Hide autosave indicator after 3 seconds
                setTimeout(() => {
                    this.showAutosaveIndicator = false;
                }, 3000);
                
                
                return true;
            }
        } catch (error) {
            
            this.autosaveStatus = 'error';
            
            // Close loading popup if it was shown
            if (this.popupSystem) {
                this.popupSystem.closePopup();
                
                setTimeout(() => {
                    this.popupSystem.showErrorPopup(
                        "Load Error",
                        "Failed to load saved game data. Starting with fresh data.",
                        () => {
                            this.popupSystem.closePopup();
                        }
                    );
                }, 300);
            }
            
            setTimeout(() => {
                this.showAutosaveIndicator = false;
            }, 3000);
        }
        
        return false;
    }    /**
     * Start periodic autosave (runs continuously regardless of game state)
     */
    startAutosave() {
        if (this.autosaveInterval) {
            this.stopAutosave();
        }
        
        
        this.autosaveInterval = setInterval(() => {
            // Save every second regardless of game state
            // The saveGameData method has built-in change detection to prevent unnecessary saves
            this.saveGameDataOptimized();
        }, this.autosaveDelay);
    }    /**
     * Optimized autosave that only saves when data changes
     */
    saveGameDataOptimized() {
        // Use the optimized saveGameData method which includes change detection
        
        this.saveGameData();
    }

    /**
     * Stop periodic autosave
     */
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }    /**
     * Manual save trigger for key events
     */
    triggerManualSave() {
        // For manual saves (important events), always save regardless of change detection
        // but still respect the minimum time interval to prevent spam
        const now = Date.now();
        if (now - this.lastSaveTime > 500) { // Reduced to 500ms for manual saves
            this.forceSave();
        }
    }

    /**
     * Force save without change detection (for important events)
     */
    forceSave() {
        try {
            this.autosaveStatus = 'saving';
            this.showAutosaveIndicator = true;

            // Prepare comprehensive save data
            const saveData = {
                // Core game data                dataPackets: this.upgradeSystem.getDataPackets(),
                bestScores: this.bestScores,
                
                // Shop upgrades
                ownedUpgrades: this.shopSystem ? this.shopSystem.getOwnedUpgrades() : [],
                
                // Profile data
                profileData: this.getProfileData(),
                
                // Audio settings
                audioSettings: this.getAudioSettings(),
                      // Leaderboard preferences
                leaderboardData: this.getLeaderboardData(),
                
                // Metadata
                timestamp: Date.now(),
                version: "1.4.0" // For future compatibility
            };

            // Save to localStorage (bypass change detection)
            localStorage.setItem('coderunner_save_data', JSON.stringify(saveData));
            
            // Update optimization tracking
            const dataForFingerprint = { ...saveData };
            delete dataForFingerprint.timestamp;
            this.lastSaveData = saveData;
            this.dataFingerprint = this.createDataFingerprint(dataForFingerprint);
            this.autosaveStatus = 'saved';
            this.lastSaveTime = Date.now();
            
            // Hide indicator after 2 seconds
            setTimeout(() => {
                this.showAutosaveIndicator = false;
            }, 2000);

            return true;

        } catch (error) {
            
            this.autosaveStatus = 'error';
            
            // Hide error indicator after 3 seconds
            setTimeout(() => {
                this.showAutosaveIndicator = false;
            }, 3000);
            
            return false;
        }
    }    /**
     * Check for score milestones and award bonus data packets
     */
    checkDistanceMilestones() {
        if (!this.player || !this.upgradeSystem) return;
        
        const currentScore = Math.floor(this.score);
        const nextMilestone = Math.floor((this.lastMilestone + this.milestoneInterval) / this.milestoneInterval) * this.milestoneInterval;
        
        // Check if we've reached a new milestone
        if (currentScore >= nextMilestone && nextMilestone > this.lastMilestone) {
            this.lastMilestone = nextMilestone;
            
            // Award 100 data packets for every 1000 score milestone
            const rewardAmount = 100;
            
            // Award the data packets
            this.upgradeSystem.addDataPackets(rewardAmount);
            
            // Trigger autosave when data packets are collected
            this.triggerManualSave();
            
            // Play audio feedback for milestone achievement
            if (window.audioSystem) {
                window.audioSystem.onPowerup();
            }
            
            // Create visual effect
            this.createMilestoneEffect(nextMilestone, rewardAmount);
        }
    }    /**
     * Create visual effect for milestone achievement
     */
    createMilestoneEffect(distance, reward) {
        // Use object pooling to reduce garbage collection
        // Initialize the pool if it doesn't exist
        if (!this.effectPool.milestone) {
            this.effectPool.milestone = [];
        }
        
        let effect = this.effectPool.milestone.pop();
        if (!effect) {
            effect = {};
        }
        
        // Reset/initialize effect properties
        effect.distance = distance;
        effect.reward = reward;
        effect.timer = 0;
        effect.maxTimer = 3000; // Show for 3 seconds
        effect.y = 100; // Start position
        effect.alpha = 1.0;
          this.milestoneEffects.push(effect);
          // Remove old effects to prevent too many on screen
        if (this.milestoneEffects.length > 3) {
            const oldEffect = this.milestoneEffects.shift();
            this.returnEffectToPool('milestone', oldEffect);
        }
    }

    /**
     * Update milestone visual effects
     */    updateMilestoneEffects(deltaTime) {
        if (!this.milestoneEffects) {
            this.milestoneEffects = [];
            return;
        }
        
        for (let i = this.milestoneEffects.length - 1; i >= 0; i--) {
            const effect = this.milestoneEffects[i];
            effect.timer += deltaTime;
            
            // Animate the effect
            const progress = effect.timer / effect.maxTimer;
            effect.y = 100 - (progress * 30); // Float upward
            effect.alpha = Math.max(0, 1 - progress); // Fade out
            
            // Remove expired effects and return to pool
            if (effect.timer >= effect.maxTimer) {
                const expiredEffect = this.milestoneEffects.splice(i, 1)[0];
                this.returnEffectToPool('milestone', expiredEffect);
            }
        }
    }    /**
     * Create visual effect for speed penalty
     */
    createSpeedPenaltyEffect(timeTaken, penalty) {
        // Use object pooling to reduce garbage collection
        // Initialize the pool if it doesn't exist
        if (!this.effectPool.speedPenalty) {
            this.effectPool.speedPenalty = [];
        }
        
        let effect = this.effectPool.speedPenalty.pop();
        if (!effect) {
            effect = {};
        }
        
        // Reset/initialize effect properties
        effect.timeTaken = timeTaken;
        effect.penalty = penalty;
        effect.timer = 0;
        effect.maxTimer = 4000; // Show for 4 seconds
        effect.y = 200; // Start position (below milestones)
        effect.alpha = 1.0;
        
        this.speedPenaltyEffects.push(effect);
        
        // Remove old effects to prevent too many on screen
        if (this.speedPenaltyEffects.length > 3) {
            const oldEffect = this.speedPenaltyEffects.shift();
            this.returnEffectToPool('speedPenalty', oldEffect);
        }
    }

    /**
     * Update speed penalty visual effects
     */    updateSpeedPenaltyEffects(deltaTime) {
        if (!this.speedPenaltyEffects) {
            this.speedPenaltyEffects = [];
            return;
        }
        
        for (let i = this.speedPenaltyEffects.length - 1; i >= 0; i--) {
            const effect = this.speedPenaltyEffects[i];
            effect.timer += deltaTime;
            
            // Animate the effect
            const progress = effect.timer / effect.maxTimer;
            effect.y = 200 - (progress * 20); // Float upward slowly
            effect.alpha = Math.max(0, 1 - progress); // Fade out
            
            // Remove expired effects and return to pool
            if (effect.timer >= effect.maxTimer) {
                const expiredEffect = this.speedPenaltyEffects.splice(i, 1)[0];
                this.returnEffectToPool('speedPenalty', expiredEffect);
            }
        }
    }

    /**
     * Render milestone effects
     */
    renderMilestoneEffects(ctx) {
        if (!this.milestoneEffects.length) return;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        for (const effect of this.milestoneEffects) {
            const centerX = this.canvas.width / 2;
            const y = effect.y;
            
            // Background glow
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20 * effect.alpha;
              // Main text
            ctx.fillStyle = `rgba(255, 215, 0, ${effect.alpha})`;
            ctx.font = 'bold 24px Courier New';
            ctx.fillText(`${effect.distance} SCORE MILESTONE!`, centerX, y);
            
            // Reward text
            ctx.fillStyle = `rgba(86, 211, 100, ${effect.alpha})`;
            ctx.font = 'bold 18px Courier New';
            ctx.fillText(`+${effect.reward} Data Packets! 💾`, centerX, y + 30);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }        ctx.restore();
    }

    /**
     * Render speed penalty effects
     */
    renderSpeedPenaltyEffects(ctx) {
        if (!this.speedPenaltyEffects.length) return;
        
        ctx.save();
        ctx.textAlign = 'center';
        
        for (const effect of this.speedPenaltyEffects) {
            const centerX = this.canvas.width / 2;
            const y = effect.y;
            
            // Background glow (red for penalty)
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 15 * effect.alpha;
            
            // Main text
            ctx.fillStyle = `rgba(255, 68, 68, ${effect.alpha})`;
            ctx.font = 'bold 20px Courier New';
            ctx.fillText('SPEED PENALTY!', centerX, y);
            
            // Details text
            ctx.fillStyle = `rgba(255, 100, 100, ${effect.alpha})`;
            ctx.font = 'bold 16px Courier New';
            ctx.fillText(`Took ${(effect.timeTaken/1000).toFixed(1)}s (limit: 15s)`, centerX, y + 25);
            
            // Penalty amount
            ctx.fillStyle = `rgba(255, 68, 68, ${effect.alpha})`;
            ctx.font = 'bold 18px Courier New';
            ctx.fillText(`-${effect.penalty} points!`, centerX, y + 45);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }

    /**
     * Check speed penalty system - deduct points if player is too slow
     */
    checkSpeedPenalty(distanceTraveled) {
        if (!this.speedPenalty.enabled) return;
        
        const currentTime = Date.now();
        const distanceFromLastCheckpoint = distanceTraveled - (this.speedPenalty.lastCheckpoint - this.player.startX);
        
        // Check if player has traveled the required segment distance (100 meters = 1000 pixels)
        if (distanceFromLastCheckpoint >= this.speedPenalty.segmentDistance) {
            const timeTaken = currentTime - this.speedPenalty.segmentStartTime;
              // If time taken exceeds 15 seconds, apply penalty
            if (timeTaken > this.speedPenalty.timeLimit) {
                // Add penalty to total penalty points
                this.speedPenalty.totalPenaltyPoints += this.speedPenalty.penalty;
                this.speedPenalty.totalPenalties++;
                
                // Create visual effect for penalty
                this.createSpeedPenaltyEffect(timeTaken, this.speedPenalty.penalty);
                
                // Play audio feedback for penalty
                if (window.audioSystem) {
                    window.audioSystem.playSound('penalty'); // You might need to add this sound
                }
                
                console.log(`Speed penalty applied! Time: ${(timeTaken/1000).toFixed(1)}s, Penalty: ${this.speedPenalty.penalty} points, Total penalties: ${this.speedPenalty.totalPenalties}`);
            }
            
            // Reset for next segment
            this.speedPenalty.lastCheckpoint = this.player.x;
            this.speedPenalty.segmentStartTime = currentTime;        }
    }    /**
     * Render the current game state
     */
    render() {
        // Handle video intro
        if (this.gameState === GAME_STATES.VIDEO_INTRO) {
            // Video intro system removed - skip rendering
            return;
        }

        // Handle opening animation
        if (this.gameState === GAME_STATES.OPENING_ANIMATION) {
            if (this.openingAnimation) {
                this.openingAnimation.render();
            }
            return;
        }
          // Handle login prompt
        if (this.gameState === GAME_STATES.LOGIN_PROMPT) {
            if (this.loginSystem) {
                this.loginSystem.render();
            }
            return;
        }
          // Handle user profile system
        if (this.gameState === GAME_STATES.PROFILE) {
            // TODO: Re-enable when UserProfileSystem is implemented
            // if (this.userProfileSystem) {
            //     this.userProfileSystem.render();
            // }
            return;
        }
        
        // Use the renderer if available, otherwise fallback
        if (this.renderer) {
            this.renderer.render();
        } else {
            
            // Fallback rendering
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
          // Handle popups and overlays
        if (this.popupSystem) {
            this.popupSystem.render(this.ctx);
        }
        
        // Render milestone effects
        this.renderMilestoneEffects(this.ctx);
        
        // Render speed penalty effects
        this.renderSpeedPenaltyEffects(this.ctx);
    }    /**
     * Start the game with the selected difficulty
     */
    startGame() {
        // Initialize world generator
        this.world = new WorldGenerator(this);
        
        // Initialize physics engine with world reference
        this.physics = new PhysicsEngine(this.world);
        
        // Find a safe spawn position using the world generator
        const spawnPosition = this.world.findSafeSpawnPosition();
        
        // Create player at spawn position without upgrades (shop system handles upgrades)
        this.player = new Player(spawnPosition.x, spawnPosition.y, this, null);
        
        // Apply shop upgrades to player if available
        if (this.shopSystem) {
            this.shopSystem.applyAllOwnedUpgrades(this.player);
        }
        
        // Set camera position so player appears on far left of screen (no void behind)
        this.camera.x = this.player.x - 50; // Position player 50px from left edge
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // Generate initial chunks for the camera position to ensure world is visible on spawn
        this.world.generateChunksForCamera(this.camera);
        
        // Force update visible chunks for immediate rendering on first frame
        const startChunk = Math.floor(this.camera.x / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE)) - 1;
        const endChunk = Math.ceil((this.camera.x + this.canvas.width) / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE)) + 1;
        this.world.updateVisibleChunks(startChunk, endChunk);
        this.world.lastCameraX = this.camera.x; // Update camera tracking to prevent immediate re-update
        
        // Reset game state variables
        this.score = 0;
        this.bonusScore = 0;
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
          // Record start time for survival tracking
        this.startTime = Date.now();
        
        // Set last health regen time to current time
        this.lastHealthRegenTime = this.startTime;
          // Initialize speed penalty system
        this.speedPenalty.lastCheckpoint = this.player.x;
        this.speedPenalty.segmentStartTime = this.startTime;
        this.speedPenalty.totalPenalties = 0;
        this.speedPenalty.totalPenaltyPoints = 0;
        
        // Change game state to playing
        this.gameState = GAME_STATES.PLAYING;
    }

    /**
     * Restart the current game with the same difficulty
     */
    restart() {        // Reset milestone tracking
        this.lastMilestone = 0;
        this.milestoneEffects = [];
        
        // Reset speed penalty effects
        this.speedPenaltyEffects = [];
        
        // Clear any existing game over state
        this.gameOverReason = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        
        // Restart the game using the same initialization logic as startGame
        this.startGame();
          // Play restart sound if available
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }
    }

    /**
     * Show the leaderboard screen
     */
    showLeaderboard() {
        this.gameState = GAME_STATES.LEADERBOARD;
    }    /**
     * Show the difficulty selection screen
     */
    showDifficultySelection() {
        this.gameState = GAME_STATES.DIFFICULTY_SELECT;
    }

    /**
     * Show the user profile screen
     */
    showProfile() {
        // TODO: Re-enable when UserProfileSystem is implemented
        console.log('Profile feature not yet implemented');
        // if (this.userProfileSystem) {
        //     // Get current user info from login system
        //     const currentUser = this.loginSystem ? this.loginSystem.getCurrentUser() : null;
        //     const isGuest = this.loginSystem ? this.loginSystem.isGuest : false;
        //     
        //     this.userProfileSystem.start(currentUser, isGuest);
        //     this.gameState = GAME_STATES.PROFILE;
        // }
    }

    /**
     * Show the reset confirmation dialog
     */
    showResetConfirmationDialog() {
        this.gameState = GAME_STATES.RESET_CONFIRM;
    }

    /**
     * Handle game over logic
     */
    gameOver(reason) {
        if (this.gameState === GAME_STATES.GAME_OVER) {
            return; // Already in game over state
        }

        // Set game over state
        this.gameState = GAME_STATES.GAME_OVER;
        this.gameOverStartTime = Date.now();
        this.gameOverReason = reason || 'Unknown';        // Check for new high score
        const currentBestScore = this.bestScores[this.selectedDifficulty] || 0;
        if (this.score > currentBestScore) {
            this.isNewHighScore = true;
            this.previousBestScore = currentBestScore;
            this.bestScores[this.selectedDifficulty] = this.score;
            
            // Save the new best score
            this.saveBestScores();
        }// Prompt for leaderboard upload if score is high enough
        if (this.score >= 100 && this.leaderboardSystem && 
            this.leaderboardSystem.canUploadForDifficulty(this.selectedDifficulty)) {
            
            // Set up for potential score upload
            this.leaderboardSystem.prepareScoreUpload(this.score, this.selectedDifficulty, this.startTime);
        }
          // Stop autosave and trigger final save on game over
        this.stopAutosave();
        this.triggerManualSave();
    }

    /**
     * Save best scores to localStorage
     */
    saveBestScores() {
        try {
            localStorage.setItem('coderunner_best_scores', JSON.stringify(this.bestScores));        } catch (error) {
           
        }
    }    /**
     * Load best scores from localStorage
     */
    loadBestScores() {
        try {
            const saved = localStorage.getItem('coderunner_best_scores');
            if (saved) {
                this.bestScores = { ...this.bestScores, ...JSON.parse(saved) };
            }
        } catch (error) {
           
        }
    }

    /**
     * Toggle changelog display
     */
    toggleChangelog() {
        if (this.gameState === GAME_STATES.CHANGELOG) {
            // Return to previous state
            this.gameState = this.previousGameState || GAME_STATES.DIFFICULTY_SELECT;
        } else {
            // Open changelog and remember previous state
            this.previousGameState = this.gameState;
            this.gameState = GAME_STATES.CHANGELOG;
        }
    }

    /**
     * Toggle performance display (F3 key functionality)
     */
    togglePerformanceDisplay() {
        this.showPerformanceDisplay = !this.showPerformanceDisplay;
        
        // Play menu sound if available
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        try {
            const canvasContainer = document.querySelector('.canvas-container');
            
            if (!document.fullscreenElement) {
                // Enter fullscreen
                const fullscreenPromise = canvasContainer?.requestFullscreen?.() || 
                                        canvasContainer?.webkitRequestFullscreen?.() || 
                                        canvasContainer?.msRequestFullscreen?.();
                
                if (fullscreenPromise) {
                    fullscreenPromise.catch(() => {
                        // Fullscreen request failed - fail silently
                    });
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
            }        } catch (error) {
            // Fullscreen operation failed - fail silently
        }
    }

    /**
     * Handle escape key functionality
     */
    handleEscape() {
        // Check for upload prompt first (highest priority)
        if (this.leaderboardSystem && this.leaderboardSystem.showUploadPrompt) {            this.leaderboardSystem.cancelUpload();
            return;
        }

        // Handle different game states
        switch (this.gameState) {

            case GAME_STATES.VIDEO_INTRO:
                // Video intro system removed - transition to appropriate state
                if (this.openingAnimation && this.openingAnimation.shouldPlay()) {
                    this.gameState = GAME_STATES.OPENING_ANIMATION;
                    this.openingAnimation.start();
                } else {
                    this.gameState = GAME_STATES.HOME;
                }
                break;
                
            case GAME_STATES.POST_ANIMATION_POPUP:
                // Close popup and go to home screen
                this.gameState = GAME_STATES.HOME;
                break;
                  case GAME_STATES.LOGIN_PROMPT:
                // On escape, choose guest mode
                if (this.loginSystem) {
                    this.loginSystem.handleGuestChoice();
                }
                break;
                
            case GAME_STATES.PROFILE:
                // On escape, go back from profile
                if (this.userProfileSystem) {
                    this.userProfileSystem.goBack();
                }
                break;
                
            case GAME_STATES.HOME:
                // Do nothing when escape is pressed from home screen
                break;
                
            case GAME_STATES.LEADERBOARD:
                // Return to previous state or default to difficulty selection
                this.gameState = this.previousGameState || GAME_STATES.DIFFICULTY_SELECT;
                break;
                
            case GAME_STATES.CHANGELOG:
                // Return to previous state or default to difficulty selection
                this.gameState = this.previousGameState || GAME_STATES.DIFFICULTY_SELECT;
                break;
                
            case GAME_STATES.SHOP:
                // Use existing shop toggle pattern
                this.handleShopToggle();
                break;
                  case GAME_STATES.DIFFICULTY_SELECT:
                // Go back to home screen
                this.gameState = GAME_STATES.HOME;
                break;
                
            case GAME_STATES.PLAYING:
            case GAME_STATES.PAUSED:
                // Return to difficulty selection
                this.gameState = GAME_STATES.DIFFICULTY_SELECT;
                break;
                
            case GAME_STATES.GAME_OVER:
                // Return to difficulty selection
                this.gameState = GAME_STATES.DIFFICULTY_SELECT;
                break;
                
            case GAME_STATES.CREDITS:
                // Go back to home screen from credits
                this.gameState = GAME_STATES.HOME;
                break;            default:
                // For any other state, go to difficulty selection
                this.gameState = GAME_STATES.DIFFICULTY_SELECT;
                break;
        }
    }

    /**
     * Handle confirm action (Enter key)
     */
    handleConfirm() {
        // Check for upload prompt first (highest priority)
        if (this.leaderboardSystem && this.leaderboardSystem.showUploadPrompt) {
            // Handle name submission or cancel upload
            if (this.leaderboardSystem.playerName.trim()) {
                this.leaderboardSystem.submitScoreFromUpload(this.leaderboardSystem.playerName);            } else {
                this.leaderboardSystem.cancelUpload();
            }
            return;
        }

        // Handle different game states
        switch (this.gameState) {

            case GAME_STATES.VIDEO_INTRO:
                // Video intro system removed - transition to appropriate state
                if (this.openingAnimation && this.openingAnimation.shouldPlay()) {
                    this.gameState = GAME_STATES.OPENING_ANIMATION;
                    this.openingAnimation.start();
                } else {
                    this.gameState = GAME_STATES.HOME;
                }
                break;
                  case GAME_STATES.POST_ANIMATION_POPUP:
                // Close popup and go to home screen
                this.gameState = GAME_STATES.HOME;
                break;
                
            case GAME_STATES.LOGIN_PROMPT:
                // On enter, trigger login choice
                if (this.loginSystem) {
                    this.loginSystem.handleLoginChoice();
                }
                break;
                
            case GAME_STATES.HOME:
                // No specific action for home screen
                break;
                
            case GAME_STATES.DIFFICULTY_SELECT:
                // No specific action for difficulty selection
                break;
                
            case GAME_STATES.PLAYING:
                // Pause game when Enter is pressed during gameplay
                this.togglePause();
                break;
                
            case GAME_STATES.PAUSED:
                // Resume game when Enter is pressed while paused
                this.togglePause();
                break;
                
            case GAME_STATES.GAME_OVER:
                // Restart game when Enter is pressed in game over
                this.restart();
                break;
                
            case GAME_STATES.LEADERBOARD:
                // No specific action for leaderboard
                break;
                
            case GAME_STATES.SHOP:
                // No specific action for shop
                break;
                
            default:
                // No specific action for other states
                break;
        }
    }

    /**
     * Add debug commands for testing upgrades
     */    addDebugCommands() {
        // Create upgrade test helper for debug commands
        if (!this.upgradeTestHelper) {
            this.upgradeTestHelper = new UpgradeTestHelper(this);
            this.upgradeTestHelper.addDebugCommands();
        }
        
        // Add save/load debug commands
        if (typeof window !== 'undefined') {
            // Debug command to toggle debug mode
            window.toggleDebug = () => {
                window.debugMode = !window.debugMode;
                console.log(`Debug mode ${window.debugMode ? 'enabled' : 'disabled'}`);
            };
            
            // Debug command to test save functionality
            window.testSave = () => {
                console.log('🧪 Testing manual save...');
                const success = this.forceSave();
                console.log(`Save ${success ? 'successful' : 'failed'}`);
            };
            
            // Debug command to check current datapackets
            window.checkDatapackets = () => {
                const current = this.upgradeSystem.getDataPackets();
                console.log(`💎 Current datapackets: ${current}`);
                
                // Check localStorage
                try {
                    const saved = localStorage.getItem('coderunner_save_data');
                    if (saved) {
                        const data = JSON.parse(saved);
                        console.log(`💾 Saved datapackets: ${data.dataPackets || 'none'}`);
                    } else {
                        console.log('💾 No save data found');
                    }
                } catch (e) {
                    console.log('💾 Error reading save data:', e);
                }
            };            // Debug command to add test datapackets
            window.addTestDatapackets = (amount = 100) => {
                console.log(`🧪 Adding ${amount} test datapackets...`);
                const before = this.upgradeSystem.getDataPackets();
                this.upgradeSystem.addDataPackets(amount);
                const after = this.upgradeSystem.getDataPackets();
                console.log(`💾 DataPackets: ${before} -> ${after}`);
                this.triggerManualSave();
                console.log('💾 Manual save triggered after adding datapackets');
            };
            
            // Debug command to test shop purchase
            window.testShopPurchase = (upgradeId = 'datapack-multiplier') => {
                console.log(`🛒 Testing shop purchase: ${upgradeId}`);
                const before = this.upgradeSystem.getDataPackets();
                const ownedBefore = this.shopSystem.isOwned(upgradeId);
                console.log(`📊 Before: DataPackets=${before}, Owned=${ownedBefore}`);
                
                const success = this.shopSystem.buyUpgrade(upgradeId);
                
                const after = this.upgradeSystem.getDataPackets();
                const ownedAfter = this.shopSystem.isOwned(upgradeId);                console.log(`📊 After: DataPackets=${after}, Owned=${ownedAfter}, Success=${success}`);
                
                if (success) {
                    console.log('✅ Purchase successful! Force refreshing shop display...');
                    this.shopHitAreas = []; // Force shop refresh
                }
            };
              // Debug command to open canvas shop
            window.openCanvasShop = () => {
                console.log('🛒 Opening canvas-based shop...');
                if (this.gameState !== GAME_STATES.SHOP) {
                    this.handleShopToggle();
                    console.log('✅ Canvas shop opened! Use Q key to toggle in the future.');
                } else {
                    console.log('ℹ️ Canvas shop is already open!');
                }
            };
            
            // Test both problematic upgrades
            window.testBothUpgrades = () => {
                console.log('🧪 Testing both score collection upgrades...');
                
                // Add enough datapackets
                console.log('💰 Adding datapackets for testing...');
                this.upgradeSystem.addDataPackets(500);
                
                console.log('\n📊 Testing Score Multiplier:');
                const scoreSuccess = this.shopSystem.buyUpgrade('score-multiplier');
                console.log(`   Result: ${scoreSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
                
                console.log('\n💾 Testing Datapack Multiplier:');
                const datapackSuccess = this.shopSystem.buyUpgrade('datapack-multiplier');
                console.log(`   Result: ${datapackSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
                
                console.log('\n📋 Current owned upgrades:');
                console.log(`   Score Multiplier: ${this.shopSystem.isOwned('score-multiplier') ? '✅ OWNED' : '❌ NOT OWNED'}`);
                console.log(`   Datapack Multiplier: ${this.shopSystem.isOwned('datapack-multiplier') ? '✅ OWNED' : '❌ NOT OWNED'}`);
                
                console.log('\n💡 To see upgrades in shop, run: openCanvasShop()');
            };
            
            // Debug command to test save/load cycle
            window.testSaveLoadCycle = () => {
                console.log('🔄 Testing complete save/load cycle...');
                const originalDataPackets = this.upgradeSystem.getDataPackets();
                console.log(`📊 Original datapackets: ${originalDataPackets}`);
                
                // Force save current state
                console.log('💾 Force saving current state...');
                const saveResult = this.forceSave();
                console.log(`💾 Save result: ${saveResult}`);
                
                // Read back the saved data to verify
                try {
                    const savedData = localStorage.getItem('coderunner_save_data');
                    if (savedData) {
                        const data = JSON.parse(savedData);
                        console.log(`📂 Saved datapackets in localStorage: ${data.dataPackets}`);
                        console.log('📂 Full save data:', data);
                    } else {
                        console.error('❌ No save data found in localStorage!');
                    }
                } catch (e) {
                    console.error('❌ Error reading save data:', e);
                }
            };
            
            console.log('🔧 Debug commands added: toggleDebug(), testSave(), checkDatapackets(), addTestDatapackets(amount), testSaveLoadCycle()');
        }
    }

    /**
     * Handle text input - delegate to leaderboard system
     */
    handleTextInput(character) {
        if (this.leaderboardSystem && this.leaderboardSystem.handleTextInput) {
           
            this.leaderboardSystem.handleTextInput(character);
        }
    }

    /**
     * Handle backspace - delegate to leaderboard system
     */
    handleBackspace() {
        if (this.leaderboardSystem && this.leaderboardSystem.handleBackspace) {
            this.leaderboardSystem.handleBackspace();
        }
    }

    /**
     * Handle delete entry - delegate to leaderboard system
     */
    handleDeleteEntry() {
        if (this.leaderboardSystem && this.leaderboardSystem.deletePlayerEntry) {
            this.leaderboardSystem.deletePlayerEntry();
        }
    }



    /**
     * Handle change name - delegate to leaderboard system
     */
    handleChangeName() {
        if (this.leaderboardSystem && this.leaderboardSystem.initiateNameChange) {
            this.leaderboardSystem.initiateNameChange();
        }
    }

    /**
     * Handle upload score - delegate to leaderboard system
     */
    handleUploadScore() {
        if (this.leaderboardSystem && this.leaderboardSystem.initiateUpload) {
            this.leaderboardSystem.initiateUpload(this.selectedDifficulty, this.score, 
                Math.floor((this.gameOverStartTime - this.startTime) / 1000));
        }
    }

    /**
     * Handle continue action
     */
    handleContinue() {
        // This can be used for continue prompts or tutorial advancement
        // Currently no specific implementation needed
    }    /**
     * Determine initial navigation based on authentication state and user settings
     */
    async determineInitialNavigation() {
        console.log('🔑 Determining initial navigation...');
        
        // Wait for Firebase auth state to be determined (if Firebase is available)
        if (this.loginSystem && this.loginSystem.auth) {
            console.log('🔑 Waiting for Firebase auth state...');
            try {
                const hasPersistedAuth = await this.loginSystem.waitForAuthState(2000);
                console.log('🔑 Firebase auth state determined:', hasPersistedAuth);
            } catch (error) {
                console.warn('🔑 Firebase auth state check failed:', error);
            }
        }
        
        // Check current authentication state
        const isUserAuthenticated = this.loginSystem && this.loginSystem.isUserAuthenticated();
        const currentUser = this.loginSystem?.getCurrentUser();
        
        console.log('🔑 Authentication state check:');
        console.log('🔑 - User authenticated:', isUserAuthenticated);
        console.log('🔑 - Current user:', currentUser?.email || 'None');
        console.log('🔑 - Is guest:', this.loginSystem?.isGuest || false);
        console.log('🔑 - Login system exists:', !!this.loginSystem);
          // First, always check if the opening animation should be shown (regardless of auth state)
        const shouldShowAnimation = window.generalSettings ? window.generalSettings.isOpeningAnimationEnabled() : false;
        
        console.log('🔑 - Animation enabled in settings:', shouldShowAnimation);
        console.log('🔑 - Animation system exists:', !!this.openingAnimation);
        console.log('🔑 - Animation shouldPlay():', this.openingAnimation ? this.openingAnimation.shouldPlay() : false);
        
        if (shouldShowAnimation && this.openingAnimation && this.openingAnimation.shouldPlay()) {
            // Show opening animation first, it will handle login/home transition internally
            console.log('🔑 → Going to opening animation (will handle auth flow)');
            this.gameState = GAME_STATES.OPENING_ANIMATION;
            this.openingAnimation.start();
        } else {
            // Skip animation, determine navigation based on authentication state
            if (isUserAuthenticated) {
                // User is already authenticated, go directly to home
                console.log('🔑 → Going directly to home screen (user authenticated, no animation)');
                this.gameState = GAME_STATES.HOME;
            } else {
                // User is not authenticated, check if login should be shown
                if (this.loginSystem && this.loginSystem.shouldShow()) {
                    console.log('🔑 → Showing login prompt (no animation)');
                    this.gameState = GAME_STATES.LOGIN_PROMPT;
                    this.loginSystem.start();
                } else {
                    // Login already shown this session, go to home
                    console.log('🔑 → Going to home screen (no animation, login already shown)');
                    this.gameState = GAME_STATES.HOME;
                }
            }
        }
    }

    /**
     * Return an effect object to the appropriate pool for reuse
     */
    returnEffectToPool(type, effect) {
        if (!effect) return;
        
        const pool = this.effectPool[type];
        if (pool && pool.length < this.maxPoolSize) {
            // Reset properties to avoid memory leaks
            effect.timer = 0;
            effect.alpha = 1;
            pool.push(effect);
        }
    }

    /**
     * Clear all effect pools to prevent memory leaks
     */
    clearEffectPools() {
        Object.keys(this.effectPool).forEach(key => {
            this.effectPool[key].length = 0;
        });
    }

    /**
     * Clean up resources to free memory
     */
    cleanupResources() {
        // Clear effect pools
        this.clearEffectPools();
        
        // Clear renderer caches
        if (this.renderer) {
            this.renderer.clearCaches();
        }
        
        // Clear tile renderer caches
        if (this.world?.tileRenderer) {
            this.world.tileRenderer.animationCache.clear();
        }
        
        // Clear world chunk cache
        if (this.world?.chunkRenderCache) {
            this.world.chunkRenderCache.clear();
        }
        
        // Clear performance metrics cache
        this.cachedMetrics = null;
        
        console.log('🧹 Resources cleaned up for memory optimization');
    }

    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        const metrics = this.getPerformanceMetrics();
        const tileStats = this.world?.tileRenderer?.getPerformanceStats?.() || {};
        const renderStats = this.renderer?.getRenderStats?.() || {};
        
        return {
            fps: {
                current: metrics.fps,
                average: metrics.avgFps,
                status: metrics.fps >= 50 ? 'excellent' : metrics.fps >= 30 ? 'good' : 'poor'
            },
            timing: {
                frame: metrics.frameTime,
                update: metrics.updateTime,
                render: metrics.renderTime
            },
            memory: {
                estimate: metrics.memory,
                pools: metrics.poolStats
            },
            world: {
                chunks: metrics.chunks,
                entities: metrics.entities
            },
            rendering: {
                tileCache: tileStats.cacheSize || 0,
                gradientCache: renderStats.gradientCacheSize || 0,
                highPerformanceMode: tileStats.highPerformanceMode || false
            },
            optimizations: {
                adaptive: this.lastAdaptiveOptimization ? 'active' : 'inactive',
                graphicsQuality: this.graphicsQuality
            }
        };
    }

    /**
     * Get memory usage estimate for performance monitoring
     */
    getMemoryUsageEstimate() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            return `${used}/${total}MB`;
        }
        return 'N/A';
    }    /**
     * Get object pool statistics for performance monitoring
     */
    getPoolStats() {
        const stats = {};
        if (this.effectPool) {
            Object.keys(this.effectPool).forEach(key => {
                stats[key] = this.effectPool[key].length;
            });
        }
        return stats;
    }

    /**
     * Apply adaptive performance optimizations based on current FPS
     */
    applyAdaptivePerformanceOptimizations() {
        if (!this.adaptiveOptimization) {
            this.adaptiveOptimization = {
                enabled: true,
                lastFpsCheck: 0,
                lowFpsFrameCount: 0,
                optimizationLevel: 0
            };
        }

        const now = performance.now();
        
        // Only check every 2 seconds to avoid frequent changes
        if (now - this.adaptiveOptimization.lastFpsCheck < 2000) {
            return;
        }

        this.adaptiveOptimization.lastFpsCheck = now;

        // Count low FPS frames
        if (this.fps < 30) {
            this.adaptiveOptimization.lowFpsFrameCount++;
        } else {
            this.adaptiveOptimization.lowFpsFrameCount = Math.max(0, this.adaptiveOptimization.lowFpsFrameCount - 1);
        }

        // Apply optimizations if performance is poor
        if (this.adaptiveOptimization.lowFpsFrameCount > 5 && this.adaptiveOptimization.optimizationLevel < 3) {
            this.adaptiveOptimization.optimizationLevel++;
            this.applyOptimizationLevel(this.adaptiveOptimization.optimizationLevel);
        }
        // Remove optimizations if performance improves
        else if (this.fps > 50 && this.adaptiveOptimization.optimizationLevel > 0) {
            this.adaptiveOptimization.optimizationLevel = Math.max(0, this.adaptiveOptimization.optimizationLevel - 1);
            this.applyOptimizationLevel(this.adaptiveOptimization.optimizationLevel);
        }
    }

    /**
     * Apply specific optimization level
     */
    applyOptimizationLevel(level) {
        switch (level) {
            case 0:
                // No optimizations - full quality
                this.highPerformanceMode = false;
                if (this.tileRenderer) {
                    this.tileRenderer.highPerformanceMode = false;
                }
                break;
            case 1:
                // Light optimizations
                if (this.tileRenderer) {
                    this.tileRenderer.renderSkipFrames = 1;
                }
                break;
            case 2:
                // Medium optimizations
                if (this.tileRenderer) {
                    this.tileRenderer.renderSkipFrames = 2;
                    this.tileRenderer.highPerformanceMode = true;
                }
                break;
            case 3:
                // Heavy optimizations
                this.highPerformanceMode = true;
                if (this.tileRenderer) {
                    this.tileRenderer.renderSkipFrames = 3;
                    this.tileRenderer.highPerformanceMode = true;
                }
                if (this.world) {
                    this.world.particleQuality = 0.3;
                }
                break;
        }
    }

    /**
     * Check if there's saved game data available
     */
    hasSavedGame() {
        try {
            const savedData = localStorage.getItem('coderunner_save_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                // Check if the saved data has meaningful progress (more than default starting values)
                return data.dataPackets > 0 || data.score > 0 || data.bestScore > 0;
            }
        } catch (error) {
            console.warn('❌ Error checking saved game data:', error);
        }
        return false;
    }

    /**
     * Check if the game is in a state where the back button should be handled
     */
    shouldHandleBackButton() {
        // Handle back button in login prompt (to choose guest mode)
        if (this.gameState === GAME_STATES.LOGIN_PROMPT) {
            return true;
        }
        
        // Handle back button in profile system (to go back)
        if (this.gameState === GAME_STATES.PROFILE) {
            return true;
        }
        
        // In other states, ignore back button by default
        return false;
    }
}
