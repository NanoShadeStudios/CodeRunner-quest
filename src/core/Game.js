// filepath: c:\Users\lutaa\OneDrive\Desktop\CodeRunner\src\core\Game.js
/**
 * Game Engine - Main game loop and coordination
 */

import { GAME_CONFIG, GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';
import { InputManager } from '../systems/inputmanager.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { LeaderboardSystem } from '../systems/LeaderboardSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { OpeningAnimationSystem } from '../systems/OpeningAnimationSystem.js';
import { PopupSystem } from '../systems/PopupSystem.js';
import { CloudSaveSystem } from '../systems/CloudSaveSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { LifeBoxSystem } from '../systems/LifeBoxSystem.js';
import { QuantumDashAnimationSystem } from '../systems/QuantumDashAnimationSystem.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { HomeScreenSystem } from '../systems/HomeScreenSystem.js';
import { OptionsSystem } from '../systems/OptionsSystem.js';
import { SettingsSystem } from '../systems/SettingsSystem.js';
import { CreditsSystem } from '../systems/CreditsSystem.js';
import { LoadingScreenSystem } from '../systems/LoadingScreenSystem.js';

import { LoginSystem } from '../systems/LoginSystem.js';
// import { UserProfileSystem } from '../systems/UserProfileSystem.js'; // TODO: Implement UserProfileSystem
import { WorldGenerator } from './WorldGenerator.js';
import { Player } from './player.js';
import { PhysicsEngine } from '../physics/physicsengine.js';
import { GameRenderer } from '../rendering/GameRenderer.js';
import { GameUI } from '../rendering/GameUI.js';
import { GameDialogs } from '../rendering/GameDialogs.js';

// Debug helper
import { UpgradeTestHelper } from '../debug/UpgradeTestHelper.js';

// Module integration helper
import { connectRenderingModules } from './game-module-bridge.js';

// Creative death messages for game over screen
const DEATH_MESSAGES = [
    "Disconnected from reality.",
    "NullPointerException: Skill not found.",
    "You ran into a bug. The bug won.",
    "Next time, try dodging... just a thought.",
    "404: Survival not found.",
    "Too slow for the code flow.",
    "You glitched so hard, even the error log gave up.",
    "Firewall 1, You 0.",
    "Oops. You tried to divide by zero.",
    "Memory overflow. Game crashed. You included.",
    "Timeline corrupted. Reboot necessary.",
    "You have been soft-deleted.",
    "Speed: fast. Reflexes: not so much.",
    "Nice try. Still trash though.",
    "That trap had your IP address.",
    "That's not a bug... you're just bad.",
    "Sent to the recycle bin."
];

export class Game {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById(GAME_CONFIG.CANVAS_ID);        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
          // Initialize performance metrics
        this.performanceMetrics = {
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            fpsHistory: [],
            lowFpsCounter: 0,
            adaptiveOptimizationLevel: 0,
            lastOptimizationCheck: 0
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
        this.gameState = GAME_STATES.LOADING;
        this.previousGameState = null;
        this.pendingGameState = null; // State to transition to after loading screen
        this.initializationComplete = false;
        this.isPaused = false;
        this.wasPlayingBeforeDropdown = false; // Track if game was playing before dropdown opened
        this.wasAutoPaused = false; // Track if game was auto-paused due to focus loss
        this.lastTime = 0;        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFrameCount = 0;
        this.lastFpsUpdate = 0;
        this.lastRenderTime = 0;
        this.lastMetricsUpdate = 0;
        this.lastAdaptiveOptimization = 0;
        
        // Game objects
        this.player = null;
        this.world = null;
        this.physics = null;
        this.camera = { x: 0, y: 0 };
        
        // Screen shake system
        this.screenShake = true;
        this.shakeIntensity = 1.0;
        this.currentShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        
        // Game systems
        this.inputManager = null;
        this.upgradeSystem = null;
        this.leaderboardSystem = null;
        this.audioSystem = null;
        
        // Graphics settings
        this.graphicsQuality = 'medium'; // Will be updated from settings
        this.showParticles = true;
        this.screenShake = true;
        this.showFpsCounter = false;
        this.backgroundParticles = true;
        
        // Gameplay settings
        this.autoSave = true;
        this.pauseOnFocusLoss = true;
        this.skipDeathAnimation = false;
        this.showLoadingScreen = true; // Setting to control loading screen display
        this.showOpeningAnimation = true; // Setting to control opening animation display
          // Difficulty level settings
        this.selectedDifficulty = 'EASY';
        this.difficultyKeys = Object.keys(DIFFICULTY_LEVELS);
        
        // Adaptive difficulty system
        this.adaptiveDifficulty = false;
        this.adaptiveDifficultyMultiplier = 1.0;
        this.playerPerformanceHistory = [];
        this.lastPerformanceCheck = 0;
        this.consecutiveSuccesses = 0;
        this.consecutiveFailures = 0;
        
        // Score and game state
        this.score = 0;
        this.bonusScore = 0;
        this.bestScores = {
            EASY: 0,
            MEDIUM: 0,
            HARD: 0,
            EXTREME: 0,
            IMPOSSIBLE: 0
        };          // Game timing
        this.startTime = 0;
        this.gameOverReason = null;
        this.gameOverMessage = null;
        this.gameOverStartTime = null;
        this.isNewHighScore = false;
        
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
        };        // UI state
        this.tabHitAreas = [];
        this.difficultyHitAreas = [];        this.shopHitAreas = [];        this.homeHitAreas = [];
        this.optionsHitAreas = [];
        this.creditsHitAreas = [];        this.achievementsHitAreas = [];        this.gameOverHitAreas = [];
        this.pauseHitAreas = [];
        this.settingsHitAreas = [];        this.mousePos = { x: 0, y: 0 };
        this.hoveredDifficulty = -1;        this.hoveredHomeButton = -1;
        this.hoveredOptionsButton = -1;
        this.hoveredGameOverButton = -1;
        this.hoveredPauseButton = -1;        this.hoveredSettingsButton = null;
        this.achievementsScrollOffset = 0;
        this.shopScrollOffset = 0;
        
        // Slider drag state
        this.isDraggingSlider = false;
        this.dragSliderData = null;
        
        // Navigation history for back button functionality
        this.navigationHistory = [];
        this.previousGameState = null;
        
        // Check if loading screen should be shown (from settings)
        const shouldShowLoadingScreen = this.getShouldShowLoadingScreen();
        
        if (shouldShowLoadingScreen) {
            // Initialize loading screen system immediately
            this.loadingScreenSystem = new LoadingScreenSystem(this);
            
            // Start the game loop immediately to show loading screen
            requestAnimationFrame((ts) => this.gameLoop(ts));
            
            // Initialize the game asynchronously after a brief delay to show loading screen
            setTimeout(() => this.initAsync(), 100);
        } else {
            // Skip loading screen and go directly to initialization
            this.gameState = GAME_STATES.INITIALIZING;
            
            // Start game loop for normal game states
            requestAnimationFrame((ts) => this.gameLoop(ts));
            
            // Start initialization immediately
            this.initAsync();
        }
    }
    
    /**
     * Check if loading screen should be shown based on settings
     */
    getShouldShowLoadingScreen() {
        try {
            const saved = localStorage.getItem('coderunner_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                // Default to true if setting doesn't exist
                return settings.showLoadingScreen !== false;
            }
            return true; // Default to showing loading screen
        } catch (error) {
            console.warn('Could not load showLoadingScreen setting:', error);
            return true; // Default to showing loading screen
        }
    }
    
    /**
     * Check if opening animation should be shown based on settings
     */
    getShouldShowOpeningAnimation() {
        try {
            const saved = localStorage.getItem('coderunner_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                // Default to true if setting doesn't exist
                return settings.showOpeningAnimation !== false;
            }
            return true; // Default to showing opening animation
        } catch (error) {
            console.warn('Could not load showOpeningAnimation setting:', error);
            return true; // Default to showing opening animation
        }
    }    async initAsync() {
        try {
            console.log('🔄 Starting game initialization...');
            await this.init();
            
            // Mark initialization as complete
            this.initializationComplete = true;
            console.log('🔄 Game initialization completed');
        } catch (error) {
            console.error('🎮 Game initialization failed:', error);
            // Fallback to basic initialization
            this.gameState = GAME_STATES.HOME;
            // Mark as complete even if failed
            this.initializationComplete = true;
        }
    }    async init() {console.log('🎮 Game.init() started');
        
        // Make game instance available globally for HTML UI
        window.gameInstance = this;
        
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
        await this.loadGameData();
        console.log('🎮 Game.init() finished loadGameData()');
          // Start continuous autosave system (runs regardless of game state)
        this.startAutosave();        // Connect rendering modules (after systems are created)
        connectRenderingModules(this);        // Check authentication state and determine initial navigation
        console.log('🔑 Checking authentication state for automatic navigation...');
        await this.determineInitialNavigation();
        
        // Update HTML UI with initial login status
        if (window.updateLoginStatus) {
            console.log('🔑 Calling initial updateLoginStatus');
            window.updateLoginStatus();
        }
        
        console.log('🎮 Game initialization completed');
    }    createSystems() {
        this.inputManager = new InputManager();
        this.shopSystem = new ShopSystem(this);        this.upgradeSystem = new UpgradeSystem(this);
        this.leaderboardSystem = new LeaderboardSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.audioSystem = new AudioSystem();
        
        // Make audio system globally available for HTML UI
        window.audioSystem = this.audioSystem;
        
        this.popupSystem = new PopupSystem(this.canvas, this.ctx);
        this.cloudSaveSystem = new CloudSaveSystem(this);
        this.homeScreenSystem = new HomeScreenSystem(this);
        this.optionsSystem = new OptionsSystem(this);
        this.settingsSystem = new SettingsSystem(this);
        this.creditsSystem = new CreditsSystem(this);
        // this.audioVideoPrompt = new AudioVideoPromptSystem(this); // Removed - going directly to login        
        this.loginSystem = new LoginSystem(this);
        // this.userProfileSystem = new UserProfileSystem(this); // TODO: Implement UserProfileSystem
        this.openingAnimation = new OpeningAnimationSystem(this); // Create after loginSystem
        
        try {
            this.powerUpSystem = new PowerUpSystem(this);
            console.log('✅ PowerUpSystem initialized successfully');
        } catch (error) {
            console.error('❌ PowerUpSystem initialization failed:', error);
            this.powerUpSystem = null;
        }
        this.lifeBoxSystem = new LifeBoxSystem(this);
        this.quantumDashAnimation = new QuantumDashAnimationSystem(this);        this.tutorialSystem = new TutorialSystem(this);
        
        this.renderer = new GameRenderer(this);
        this.gameDialogs = new GameDialogs(this);
        
        // Set up name input checker for InputManager
        this.inputManager.setNameInputChecker(() => {
            // Check if leaderboard name input is active
            const leaderboardInputActive = this.leaderboardSystem && this.leaderboardSystem.nameInputActive;
              // Check if login system has focused input fields
            const loginInputActive = this.loginSystem && this.loginSystem.hasActiveFocusedField();
            
            // Check if user profile system has focused input fields (TODO: Re-enable when UserProfileSystem is implemented)
            // const profileInputActive = this.userProfileSystem && this.userProfileSystem.isActive && 
            //                          Object.values(this.userProfileSystem.inputFields || {}).some(field => field.focused);
            
            return leaderboardInputActive || loginInputActive; // || profileInputActive;
        });        // Add mouse click listener for leaderboard tabs and menus
        this.tabHitAreas = [];
        this.difficultyHitAreas = [];
        this.shopHitAreas = [];
        this.homeHitAreas = [];
        this.optionsHitAreas = [];
        this.creditsHitAreas = [];
        
        // Mouse state tracking
        this.mousePos = { x: 0, y: 0 };
        this.hoveredDifficulty = -1;
        this.hoveredHomeButton = -1;        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        
        // Add focus/blur listeners to manage scrolling prevention
        this.canvas.addEventListener('focus', () => {
            document.body.classList.add('game-focused');
            console.log('🎮 Canvas focused - preventing page scroll');
        });
        
        this.canvas.addEventListener('blur', () => {
            document.body.classList.remove('game-focused');
            console.log('🎮 Canvas blurred - allowing page scroll');
        });

        // Add window focus/blur listeners for settings functionality
        window.addEventListener('focus', () => {
            this.handleWindowFocus();
        });
        
        window.addEventListener('blur', () => {
            this.handleWindowBlur();
        });
    }
      /**
     * Ensure the canvas has focus for keyboard input
     */
    ensureCanvasFocus() {
        try {
            // Make sure canvas is focusable
            if (!this.canvas.hasAttribute('tabindex')) {
                this.canvas.setAttribute('tabindex', '0');
            }
            
            // Add body class to prevent scrolling
            document.body.classList.add('game-focused');
            
            // Focus the canvas to ensure keyboard events are captured
            this.canvas.focus({ preventScroll: true });
            
            console.log('🎮 Canvas focused for keyboard input');
        } catch (error) {
            console.warn('⚠️ Could not focus canvas:', error);
        }
    }

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
        this.inputManager.setCallback('changeName', () => this.handleChangeName());        // Shop functionality
        this.inputManager.setCallback('shop', () => this.handleShopToggle());        this.inputManager.setCallback('shopScrollUp', () => this.handleShopScroll(-1)); // Up arrow = scroll up (decrease offset)        this.inputManager.setCallback('shopScrollDown', () => this.handleShopScroll(1)); // Down arrow = scroll down (increase offset)
        
        // Achievements scrolling functionality
        this.inputManager.setCallback('achievementsScrollUp', () => this.handleAchievementsScroll(-30)); // Up arrow = scroll up
        this.inputManager.setCallback('achievementsScrollDown', () => this.handleAchievementsScroll(30)); // Down arrow = scroll down          // System controls
        this.inputManager.setCallback('togglePerformance', () => this.togglePerformanceDisplay());
        this.inputManager.setCallback('tutorial', () => this.handleTutorialToggle());
        this.inputManager.setCallback('fullscreen', () => this.toggleFullscreen());
        this.inputManager.setCallback('home', () => this.handleHomeKey());
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
        console.log('🎨 Applying graphics quality:', this.graphicsQuality);
        
        // Apply settings based on quality level
        switch (this.graphicsQuality) {
            case 'low':
                // Reduce particle effects and visual quality
                this.particleQuality = 0.2;
                this.particleCount = 0.3; // Reduce particle count
                this.tileDetailLevel = 'low';
                this.lightingQuality = 'low';
                this.shadowQuality = 'off';
                this.screenShakeIntensity = 0.5;
                this.gradientComplexity = 'low';
                this.backgroundAnimations = false;
                break;
            case 'medium':
                // Default settings
                this.particleQuality = 0.7;
                this.particleCount = 0.7;
                this.tileDetailLevel = 'medium';
                this.lightingQuality = 'medium';
                this.shadowQuality = 'low';
                this.screenShakeIntensity = 0.75;
                this.gradientComplexity = 'medium';
                this.backgroundAnimations = true;
                break;
            case 'high':
                // Maximum quality
                this.particleQuality = 1.0;
                this.particleCount = 1.0;
                this.tileDetailLevel = 'high';
                this.lightingQuality = 'high';
                this.shadowQuality = 'high';
                this.screenShakeIntensity = 1.0;
                this.gradientComplexity = 'high';
                this.backgroundAnimations = true;
                break;
        }
        
        // Apply to existing world if available
        if (this.world) {
            this.world.particleQuality = this.particleQuality;
            this.world.particleCount = this.particleCount;
            this.world.tileDetailLevel = this.tileDetailLevel;
            this.world.backgroundAnimations = this.backgroundAnimations;
        }
        
        // Apply renderer optimizations based on quality
        if (this.renderer) {
            this.renderer.setRenderOptimizations({
                skipBackgroundParticles: this.graphicsQuality === 'low',
                reduceGradientComplexity: this.graphicsQuality === 'low',
                cacheGradients: this.graphicsQuality !== 'low',
                particleQuality: this.particleQuality,
                shadowQuality: this.shadowQuality,
                lightingQuality: this.lightingQuality
            });
        }
        
        // Apply tile renderer optimizations
        if (this.world?.tileRenderer) {
            this.world.tileRenderer.setHighPerformanceMode(this.graphicsQuality === 'low');
            this.world.tileRenderer.setDetailLevel(this.tileDetailLevel);
        }
        
        // Apply to particle systems
        if (this.player) {
            this.player.particleQuality = this.particleQuality;
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
                
            case GAME_STATES.OPTIONS:
                this.handleOptionsHover(x, y);
                break;
                
            case GAME_STATES.CREDITS:
                this.handleCreditsHover(x, y);
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
                  case GAME_STATES.GAME_OVER:
                this.handleGameOverHover(x, y);
                break;
                
            case GAME_STATES.SETTINGS:
                this.handleSettingsHover(x, y);
                break;
                  case GAME_STATES.PAUSED:
                this.handlePauseHover(x, y);
                break;
                  default:
                // Reset hover states for other game states
                this.hoveredDifficulty = -1;
                this.hoveredHomeButton = -1;
                this.hoveredOptionsButton = -1;
                this.hoveredGameOverButton = -1;
                this.hoveredPauseButton = -1;
                break;        }
        
        // Handle slider dragging in settings
        if (this.gameState === GAME_STATES.SETTINGS && this.gameDialogs) {
            this.gameDialogs.handleMouseMove(x, y);
        }
        
        // Handle slider dragging (legacy - may be removed)
        if (this.isDraggingSlider && this.dragSliderData) {
            this.updateSliderValue(this.dragSliderData, x);
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
        if (this.homeScreenSystem && this.homeHitAreas) {
            this.homeScreenSystem.handleMouseMove(x, y, this.homeHitAreas);
        }
    }

    /**
     * Handle mouse hover effects for options menu
     */
    handleOptionsHover(x, y) {
        if (this.optionsSystem && this.optionsHitAreas) {
            this.optionsSystem.handleMouseMove(x, y, this.optionsHitAreas);
        }
    }

    /**
     * Handle mouse hover effects for credits screen
     */
    handleCreditsHover(x, y) {
        if (this.creditsSystem && this.creditsHitAreas) {
            this.creditsSystem.handleMouseMove(x, y, this.creditsHitAreas);
        }
    }    /**
     * Navigate to a new game state and track previous state for back navigation
     */
    navigateToState(newState) {        
        // Don't track navigation to/from certain states
        const skipTracking = [
            GAME_STATES.LOGIN_PROMPT,
            GAME_STATES.VIDEO_INTRO,
            GAME_STATES.OPENING_ANIMATION,
            GAME_STATES.POST_ANIMATION_POPUP,
            GAME_STATES.PLAYING
            // Note: PAUSED removed from skipTracking so pause menu navigation works properly
            // Note: GAME_OVER removed from skipTracking so death menu navigation works properly
        ];
        
        // Store previous state if current state should be tracked
        if (this.gameState && !skipTracking.includes(this.gameState) && !skipTracking.includes(newState)) {
            this.previousGameState = this.gameState;
            console.log(`🔄 Navigation: ${this.gameState} → ${newState} (previous: ${this.previousGameState})`);
        }
        
        this.gameState = newState;
        
        // Reset animations for menu systems when entering them
        if (newState === GAME_STATES.OPTIONS && this.optionsSystem) {
            this.optionsSystem.resetAnimations();
        } else if (newState === GAME_STATES.SETTINGS && this.settingsSystem) {
            this.settingsSystem.resetAnimations();
        } else if (newState === GAME_STATES.CREDITS && this.creditsSystem) {
            this.creditsSystem.resetAnimations();
        } else if (newState === GAME_STATES.HOME && this.homeScreenSystem) {
            this.homeScreenSystem.resetAnimations();
        }
    }

    /**
     * Show leaderboard screen
     */
    showLeaderboard() {
        this.navigateToState(GAME_STATES.LEADERBOARD);
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
                }                // Handle different button actions
                if (area.action === 'play') {
                    this.navigateToState(GAME_STATES.DIFFICULTY_SELECT);
                } else if (area.action === 'options') {
                    this.navigateToState(GAME_STATES.OPTIONS);
                } else if (area.action === 'tutorial') {
                    this.navigateToState(GAME_STATES.TUTORIAL);
                    if (this.tutorialSystem) {
                        this.tutorialSystem.startTutorial('welcome');
                    }
                } else if (area.action === 'achievements') {
                    this.achievementsScrollOffset = 0; // Reset scroll to top when opening achievements
                    this.navigateToState(GAME_STATES.ACHIEVEMENTS);                } else if (area.action === 'settings') {
                    this.navigateToState(GAME_STATES.SETTINGS);
                    // Check if settings tutorial should be shown
                    setTimeout(() => this.checkSettingsTutorial(), 100);
                } else if (area.action === 'credits') {
                    this.navigateToState(GAME_STATES.CREDITS);
                } else if (area.action === 'profile') {
                    this.showProfile();
                }
                break;
            }
        }
    }

    /**
     * Handle clicks in options menu
     */
    handleOptionsClick(x, y) {
        if (this.optionsSystem && this.optionsHitAreas) {
            const action = this.optionsSystem.handleClick(x, y, this.optionsHitAreas);
            
            if (action) {
                if (action === 'tutorial') {
                    this.navigateToState(GAME_STATES.TUTORIAL);
                    if (this.tutorialSystem) {
                        this.tutorialSystem.startTutorial('welcome');
                    }
                } else if (action === 'achievements') {
                    this.achievementsScrollOffset = 0;
                    this.navigateToState(GAME_STATES.ACHIEVEMENTS);
                } else if (action === 'shop') {
                    this.navigateToState(GAME_STATES.SHOP);
                } else if (action === 'settings') {
                    this.navigateToState(GAME_STATES.SETTINGS);
                    if (this.settingsSystem) {
                        this.settingsSystem.resetAnimations();
                    }
                } else if (action === 'back') {
                    this.navigateToState(GAME_STATES.HOME);
                }
            }
        }
    }

    /**
     * Handle clicks in credits screen
     */
    handleCreditsClick(x, y) {
        if (this.creditsSystem && this.creditsHitAreas) {
            const action = this.creditsSystem.handleClick(x, y, this.creditsHitAreas);
            
            if (action === 'back') {
                this.navigateToState(GAME_STATES.HOME);
            }
        }
    }    /**
     * Handle mouse hover effects for difficulty selection
     */
    handleDifficultyHover(x, y) {
        this.hoveredDifficulty = -1;
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
     * Handle mouse hover effects for game over screen
     */
    handleGameOverHover(x, y) {
        this.hoveredGameOverButton = -1;
        
        // Check if there are game over hit areas to hover over
        if (this.gameOverHitAreas) {
            for (let i = 0; i < this.gameOverHitAreas.length; i++) {
                const area = this.gameOverHitAreas[i];
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    this.hoveredGameOverButton = i;
                    break;
                }
            }
        }
    }

    /**
     * Handle mouse hover effects for pause screen
     */
    handlePauseHover(x, y) {
        this.hoveredPauseButton = -1;
        
        // Check if there are pause hit areas to hover over
        if (this.pauseHitAreas) {
            for (let i = 0; i < this.pauseHitAreas.length; i++) {
                const area = this.pauseHitAreas[i];
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    this.hoveredPauseButton = i;
                    break;
                }
            }
        }
    }

    /**
     * Handle mouse hover effects for settings screen
     */
    handleSettingsHover(x, y) {
        if (this.settingsSystem && this.settingsHitAreas) {
            this.settingsSystem.handleMouseMove(x, y, this.settingsHitAreas);
        }
    }

    /**
     * Handle clicks in settings screen
     */
    handleSettingsClick(x, y) {
        console.log('🎯 Settings click at:', x, y);
        if (this.settingsSystem && this.settingsHitAreas) {
            const action = this.settingsSystem.handleClick(x, y, this.settingsHitAreas);
            console.log('⚡ Settings action:', action);
            
            if (action === 'back') {
                console.log('🏠 Navigating back to OPTIONS');
                this.navigateToState(GAME_STATES.OPTIONS);
            }
        }
        
        // Close any expanded dropdowns if clicking outside them
        if (this.settingsSystem && this.settingsSystem.expandedDropdown) {
            let clickedOnDropdown = false;
            
            // Check if the click was on a dropdown or its options
            for (const area of this.settingsHitAreas || []) {
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    if (area.action === 'dropdown' || area.action === 'dropdown-option') {
                        clickedOnDropdown = true;
                        break;
                    }
                }
            }
            
            // Close dropdown if not clicked on dropdown
            if (!clickedOnDropdown) {
                this.settingsSystem.expandedDropdown = null;
            }
        }
    }

    /**
     * Handle clicks in game over screen
     */
    handleGameOverClick(x, y) {
        if (!this.gameOverHitAreas) return;
        
        // Check if any game over button was clicked
        for (let i = 0; i < this.gameOverHitAreas.length; i++) {
            const area = this.gameOverHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Handle different button actions
                switch (area.action) {
                    case 'restart':
                        this.startNewGame();
                        break;
                    case 'difficulty':
                        this.navigateToState(GAME_STATES.DIFFICULTY_SELECT);
                        break;
                    case 'home':
                        this.navigateToState(GAME_STATES.HOME);
                        break;
                    case 'leaderboard':
                        this.navigateToState(GAME_STATES.LEADERBOARD);
                        break;
                    case 'shop':
                        this.navigateToState(GAME_STATES.SHOP);
                        break;
                    case 'settings':
                        this.navigateToState(GAME_STATES.SETTINGS);
                        break;
                    default:
                        console.warn(`Unknown game over action: ${area.action}`);
                        break;
                }
                
                break; // Stop checking other areas once we find a match
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
        const y = (e.clientY - rect.top) * scaleY;

        // Check for popup clicks first (popups should work in any state)
        if (this.popupSystem && this.popupSystem.activePopup) {
            const handled = this.popupSystem.handleClick(x, y);
            if (handled) {
                return; // Popup handled the click, don't process other handlers
            }
        }

        // Handle different game states
        switch (this.gameState) {case GAME_STATES.VIDEO_INTRO:
                // Video intro system removed - skipping video intro state
                break;            case GAME_STATES.LOGIN_PROMPT:
                // Handle login prompt clicks (delegate to login system)
                if (this.loginSystem) {
                    this.loginSystem.handleClick(x, y);
                }
                break;

            case GAME_STATES.TUTORIAL:
                // Handle tutorial clicks (delegate to tutorial system)
                if (this.tutorialSystem) {
                    this.tutorialSystem.handleClick({ clientX: e.clientX, clientY: e.clientY });
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
                
            case GAME_STATES.OPTIONS:
                this.handleOptionsClick(x, y);
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
                
            case GAME_STATES.ACHIEVEMENTS:
                this.handleAchievementsClick(x, y);
                break;            case GAME_STATES.SHOP:
                this.handleShopClick(x, y);
                break;
                
            case GAME_STATES.SETTINGS:
                this.handleSettingsClick(x, y);
                break;
                  case GAME_STATES.RESET_CONFIRM:
                this.handleResetConfirmClick(x, y);
                break;
                  case GAME_STATES.GAME_OVER:
                this.handleGameOverClick(x, y);
                break;
                
            case GAME_STATES.PAUSED:
                this.handlePauseClick(x, y);
                break;default:
                // No specific handling for this state
                break;
        }
    }    /**
     * Handle escape key presses to go back to previous screen
     */
    handleEscape() {
        // Play menu click sound
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }

        // Navigate back based on current state
        switch (this.gameState) {
            case GAME_STATES.PLAYING:
                // Pause the game
                this.togglePause();
                break;
                
            case GAME_STATES.SETTINGS:
            case GAME_STATES.OPTIONS:
            case GAME_STATES.CREDITS:
            case GAME_STATES.ACHIEVEMENTS:
            case GAME_STATES.LEADERBOARD:
            case GAME_STATES.SHOP:
            case GAME_STATES.DIFFICULTY_SELECT:
                // Go back to previous state, or home if no previous state
                const backState = this.previousGameState || GAME_STATES.HOME;
                console.log(`🔙 Escape pressed: Going from ${this.gameState} back to ${backState}`);
                this.navigateToState(backState);
                break;
                
            case GAME_STATES.PAUSED:
                // Resume game
                this.togglePause();
                break;
                
            case GAME_STATES.GAME_OVER:
                // Go to home screen
                this.navigateToState(GAME_STATES.HOME);
                break;
                
            case GAME_STATES.POST_ANIMATION_POPUP:
                // Close popup and go to home
                this.gameState = GAME_STATES.HOME;
                break;
                
            case GAME_STATES.HOME:
                // Don't do anything when already at home screen
                console.log(`🏠 Already at home screen, ignoring escape`);
                break;
                
            default:
                // For other states, try to go to home
                if (this.gameState !== GAME_STATES.HOME && this.gameState !== GAME_STATES.PLAYING) {
                    this.navigateToState(GAME_STATES.HOME);
                }
                break;
        }
    }

    /**
     * Handle clicks in difficulty selection screen
     */
    handleDifficultyClick(x, y) {
        console.log('🎯 Difficulty click at:', x, y);
        console.log('🎯 Hit areas:', this.difficultyHitAreas);
        
        if (!this.difficultyHitAreas) return;
        
        // Check if any difficulty button was clicked
        for (let i = 0; i < this.difficultyHitAreas.length; i++) {
            const area = this.difficultyHitAreas[i];
            console.log(`🎯 Checking area ${i}:`, area);
            
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                console.log(`✅ Hit detected on area ${i}:`, area);
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }

                // Handle different button actions
                if (area.action === 'back') {
                    console.log('🔙 Back button clicked');
                    this.navigateToState(GAME_STATES.HOME);
                } else if (area.action === 'difficulty') {
                    // Set selected difficulty and start game
                    this.selectedDifficulty = area.difficulty;
                    console.log(`🎮 Selected difficulty: ${this.selectedDifficulty}`);
                    this.startGame();
                }
                break;
            }
        }
    }
    /**
     * Main game loop - handles updating and rendering
     */
    gameLoop(timestamp) {
        try {
            const frameStartTime = performance.now();
            
            // Calculate delta time with frame limiting
            const currentTime = timestamp || performance.now();
            this.deltaTime = Math.min(currentTime - this.lastTime, 16.67); // Cap at ~60fps
            this.lastTime = currentTime;
            
            // Track frame timing for performance metrics
            const updateStartTime = performance.now();
            
            // Update FPS counter
            this.updateFPS(currentTime);
            
            // Update game state
            this.update();
            
            // Track update time
            this.performanceMetrics.updateTime = performance.now() - updateStartTime;
            
            // Track render start time
            const renderStartTime = performance.now();
            
            // Render everything
            this.render();
            
            // Track render time
            this.performanceMetrics.renderTime = performance.now() - renderStartTime;
            
            // Track total frame time
            this.performanceMetrics.frameTime = performance.now() - frameStartTime;
            
            // Adaptive performance optimization
            this.checkAndApplyAdaptiveOptimizations();
            
            // Continue the game loop
            requestAnimationFrame((ts) => this.gameLoop(ts));
        } catch (error) {
            console.error('🎮 Game loop error:', error);
            // Continue the loop even if there's an error to prevent the game from completely freezing
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    /**
     * Update FPS counter and performance metrics
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount - this.lastFrameCount) * 1000 / (currentTime - this.lastFpsUpdate));
            this.lastFrameCount = this.frameCount;
            this.lastFpsUpdate = currentTime;
            
            // Store FPS history for performance monitoring
            if (this.performanceMetrics) {
                this.performanceMetrics.fpsHistory.push(this.fps);
                if (this.performanceMetrics.fpsHistory.length > 60) {
                    this.performanceMetrics.fpsHistory.shift();
                }
            }
        }
    }

    /**
     * Get performance metrics for UI display
     */
    getPerformanceMetrics() {
        return {
            fps: this.fps || 0,
            frameTime: this.performanceMetrics.frameTime || 0,
            updateTime: this.performanceMetrics.updateTime || 0,
            renderTime: this.performanceMetrics.renderTime || 0,
            fpsHistory: this.performanceMetrics.fpsHistory || []
        };
    }

    /**
     * Update game logic
     */
    update() {
        // Input manager uses event listeners, no update needed
        
        // Update systems based on game state
        switch (this.gameState) {
            case GAME_STATES.LOADING:
                if (this.loadingScreenSystem) {
                    this.loadingScreenSystem.update(this.deltaTime);
                }
                break;
                
            case GAME_STATES.PLAYING:
                this.updateGameplay();
                break;
                
            case GAME_STATES.OPENING_ANIMATION:
                if (this.openingAnimation) {
                    this.openingAnimation.update(this.deltaTime);
                }
                break;
                
            case GAME_STATES.TUTORIAL:
                if (this.tutorialSystem) {
                    this.tutorialSystem.update(this.deltaTime);
                }
                break;
                
            default:
                // Update background systems that should always run
                if (this.popupSystem) {
                    this.popupSystem.update(this.deltaTime);
                }
                break;        }
        
        // Audio system doesn't need per-frame updates (event-driven)
    }

    /**
     * Update gameplay logic when in playing state
     */
    updateGameplay() {
        if (!this.player || !this.world) return;
        
        // Always update quantum dash animation (even when paused, since it controls the pause)
        if (this.quantumDashAnimation) {
            this.quantumDashAnimation.update(this.deltaTime);
        }
        
        // Skip other updates if paused
        if (this.isPaused) return;
        
        // Get input keys from input manager
        const inputKeys = this.inputManager ? this.inputManager.getKeys() : {};
        
        // Update player with all required parameters
        this.player.update(this.deltaTime, inputKeys, this.world, this.physics);
        
        // Update world
        this.world.update(this.deltaTime, this.camera);
        
        // Update physics
        if (this.physics) {
            this.physics.update(this.deltaTime);
        }
        
        // Update game systems
        if (this.powerUpSystem) {
            this.powerUpSystem.update(this.deltaTime);
        }
        
        if (this.lifeBoxSystem) {
            this.lifeBoxSystem.update(this.deltaTime);
        }
        
        // Update camera
        this.updateCamera();
        
        // Update screen shake
        this.updateScreenShake(this.deltaTime);
        
        // Update adaptive difficulty
        this.updateAdaptiveDifficulty();
        
        // Update score
        this.updateScore();
        
        // Update adaptive difficulty
        this.updateAdaptiveDifficulty();
    }

    /**
     * Update camera position to follow player
     */
    updateCamera() {
        if (this.player) {
            this.camera.x = this.player.x - this.canvas.width / 2;
            this.camera.y = this.player.y - this.canvas.height / 2;
            
            // Prevent camera from showing empty space to the left of the world
            // Keep camera.x at minimum 0 so the left edge of the world is always at screen edge
            this.camera.x = Math.max(0, this.camera.x);
        }
    }

    /**
     * Update game score
     */
    updateScore() {
        if (this.player && this.gameState === GAME_STATES.PLAYING) {
            // Update score based on distance traveled
            const distanceScore = Math.floor(this.player.x / 10);
            this.score = distanceScore + this.bonusScore;
        }
    }

    /**
     * Update adaptive difficulty based on player performance
     */
    updateAdaptiveDifficulty() {
        if (!this.adaptiveDifficulty || !this.player) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastPerformanceCheck < 5000) return; // Check every 5 seconds
        
        this.lastPerformanceCheck = currentTime;
        
        // Analyze player performance
        const survivalTime = (currentTime - this.startTime) / 1000;
        const currentScore = this.score;
        const recentDamage = this.player.lastDamageTime && (currentTime - this.player.lastDamageTime) < 10000;
        
        // Performance metrics
        const scoreRate = survivalTime > 0 ? currentScore / survivalTime : 0;
        const expectedScoreRate = this.getExpectedScoreRate();
        const performanceRatio = scoreRate / expectedScoreRate;
        
        // Record performance
        this.playerPerformanceHistory.push(performanceRatio);
        if (this.playerPerformanceHistory.length > 10) {
            this.playerPerformanceHistory.shift(); // Keep only last 10 entries
        }
        
        // Calculate average performance
        const avgPerformance = this.playerPerformanceHistory.reduce((a, b) => a + b, 0) / this.playerPerformanceHistory.length;
        
        // Adjust difficulty based on performance
        if (avgPerformance > 1.2) { // Player performing well
            this.consecutiveSuccesses++;
            this.consecutiveFailures = 0;
            if (this.consecutiveSuccesses >= 3) {
                this.adaptiveDifficultyMultiplier = Math.min(1.5, this.adaptiveDifficultyMultiplier + 0.1);
                this.consecutiveSuccesses = 0;
                console.log(`🎮 Adaptive difficulty increased: ${this.adaptiveDifficultyMultiplier.toFixed(2)}x`);
            }
        } else if (avgPerformance < 0.8 || recentDamage) { // Player struggling
            this.consecutiveFailures++;
            this.consecutiveSuccesses = 0;
            if (this.consecutiveFailures >= 2) {
                this.adaptiveDifficultyMultiplier = Math.max(0.7, this.adaptiveDifficultyMultiplier - 0.1);
                this.consecutiveFailures = 0;
                console.log(`🎮 Adaptive difficulty decreased: ${this.adaptiveDifficultyMultiplier.toFixed(2)}x`);
            }
        }
    }

    /**
     * Get expected score rate for current difficulty
     */
    getExpectedScoreRate() {
        const difficultyConfig = DIFFICULTY_LEVELS[this.selectedDifficulty];
        if (!difficultyConfig) return 100; // Default expected rate
        
        // Base expected score rate varies by difficulty
        const baseRates = {
            'EASY': 150,
            'MEDIUM': 120,
            'HARD': 100,
            'EXTREME': 80,
            'IMPOSSIBLE': 60
        };
        
        return baseRates[this.selectedDifficulty] || 100;
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
                
            case GAME_STATES.OPTIONS:
                this.handleOptionsHover(x, y);
                break;
                
            case GAME_STATES.CREDITS:
                this.handleCreditsHover(x, y);
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
                  case GAME_STATES.GAME_OVER:
                this.handleGameOverHover(x, y);
                break;
                
            case GAME_STATES.SETTINGS:
                this.handleSettingsHover(x, y);
                break;
                  case GAME_STATES.PAUSED:
                this.handlePauseHover(x, y);
                break;
                  default:
                // Reset hover states for other game states
                this.hoveredDifficulty = -1;
                this.hoveredHomeButton = -1;
                this.hoveredOptionsButton = -1;
                this.hoveredGameOverButton = -1;
                this.hoveredPauseButton = -1;
                break;        }
        
        // Handle slider dragging in settings
        if (this.gameState === GAME_STATES.SETTINGS && this.gameDialogs) {
            this.gameDialogs.handleMouseMove(x, y);
        }
        
        // Handle slider dragging (legacy - may be removed)
        if (this.isDraggingSlider && this.dragSliderData) {
            this.updateSliderValue(this.dragSliderData, x);
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
        if (this.homeScreenSystem && this.homeHitAreas) {
            this.homeScreenSystem.handleMouseMove(x, y, this.homeHitAreas);
        }
    }

    /**
     * Handle mouse hover effects for options menu
     */
    handleOptionsHover(x, y) {
        if (this.optionsSystem && this.optionsHitAreas) {
            this.optionsSystem.handleMouseMove(x, y, this.optionsHitAreas);
        }
    }

    /**
     * Handle mouse hover effects for credits screen
     */
    handleCreditsHover(x, y) {
        if (this.creditsSystem && this.creditsHitAreas) {
            this.creditsSystem.handleMouseMove(x, y, this.creditsHitAreas);
        }
    }    /**
     * Navigate to a new game state and track previous state for back navigation
     */
    navigateToState(newState) {        
        // Don't track navigation to/from certain states
        const skipTracking = [
            GAME_STATES.LOGIN_PROMPT,
            GAME_STATES.VIDEO_INTRO,
            GAME_STATES.OPENING_ANIMATION,
            GAME_STATES.POST_ANIMATION_POPUP,
            GAME_STATES.PLAYING
            // Note: PAUSED removed from skipTracking so pause menu navigation works properly
            // Note: GAME_OVER removed from skipTracking so death menu navigation works properly
        ];
        
        // Store previous state if current state should be tracked
        if (this.gameState && !skipTracking.includes(this.gameState) && !skipTracking.includes(newState)) {
            this.previousGameState = this.gameState;
            console.log(`🔄 Navigation: ${this.gameState} → ${newState} (previous: ${this.previousGameState})`);
        }
        
        this.gameState = newState;
        
        // Reset animations for menu systems when entering them
        if (newState === GAME_STATES.OPTIONS && this.optionsSystem) {
            this.optionsSystem.resetAnimations();
        } else if (newState === GAME_STATES.SETTINGS && this.settingsSystem) {
            this.settingsSystem.resetAnimations();
        } else if (newState === GAME_STATES.CREDITS && this.creditsSystem) {
            this.creditsSystem.resetAnimations();
        } else if (newState === GAME_STATES.HOME && this.homeScreenSystem) {
            this.homeScreenSystem.resetAnimations();
        }
    }

    /**
     * Show leaderboard screen
     */
    showLeaderboard() {
        this.navigateToState(GAME_STATES.LEADERBOARD);
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
                }                // Handle different button actions
                if (area.action === 'play') {
                    this.navigateToState(GAME_STATES.DIFFICULTY_SELECT);
                } else if (area.action === 'options') {
                    this.navigateToState(GAME_STATES.OPTIONS);
                } else if (area.action === 'tutorial') {
                    this.navigateToState(GAME_STATES.TUTORIAL);
                    if (this.tutorialSystem) {
                        this.tutorialSystem.startTutorial('welcome');
                    }
                } else if (area.action === 'achievements') {
                    this.achievementsScrollOffset = 0; // Reset scroll to top when opening achievements
                    this.navigateToState(GAME_STATES.ACHIEVEMENTS);                } else if (area.action === 'settings') {
                    this.navigateToState(GAME_STATES.SETTINGS);
                    // Check if settings tutorial should be shown
                    setTimeout(() => this.checkSettingsTutorial(), 100);
                } else if (area.action === 'credits') {
                    this.navigateToState(GAME_STATES.CREDITS);
                } else if (area.action === 'profile') {
                    this.showProfile();
                }
                break;
            }
        }
    }

    /**
     * Handle clicks in options menu
     */
    handleOptionsClick(x, y) {
        if (this.optionsSystem && this.optionsHitAreas) {
            const action = this.optionsSystem.handleClick(x, y, this.optionsHitAreas);
            
            if (action) {
                if (action === 'tutorial') {
                    this.navigateToState(GAME_STATES.TUTORIAL);
                    if (this.tutorialSystem) {
                        this.tutorialSystem.startTutorial('welcome');
                    }
                } else if (action === 'achievements') {
                    this.achievementsScrollOffset = 0;
                    this.navigateToState(GAME_STATES.ACHIEVEMENTS);
                } else if (action === 'shop') {
                    this.navigateToState(GAME_STATES.SHOP);
                } else if (action === 'settings') {
                    this.navigateToState(GAME_STATES.SETTINGS);
                    if (this.settingsSystem) {
                        this.settingsSystem.resetAnimations();
                    }
                } else if (action === 'back') {
                    this.navigateToState(GAME_STATES.HOME);
                }
            }
        }
    }

    /**
     * Handle clicks in credits screen
     */
    handleCreditsClick(x, y) {
        if (this.creditsSystem && this.creditsHitAreas) {
            const action = this.creditsSystem.handleClick(x, y, this.creditsHitAreas);
            
            if (action === 'back') {
                this.navigateToState(GAME_STATES.HOME);
            }
        }
    }    /**
     * Handle mouse hover effects for difficulty selection
     */
    handleDifficultyHover(x, y) {
        this.hoveredDifficulty = -1;
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
     * Handle mouse hover effects for game over screen
     */
    handleGameOverHover(x, y) {
        this.hoveredGameOverButton = -1;
        
        // Check if there are game over hit areas to hover over
        if (this.gameOverHitAreas) {
            for (let i = 0; i < this.gameOverHitAreas.length; i++) {
                const area = this.gameOverHitAreas[i];
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    this.hoveredGameOverButton = i;
                    break;
                }
            }
        }
    }

    /**
     * Handle mouse hover effects for pause screen
     */
    handlePauseHover(x, y) {
        this.hoveredPauseButton = -1;
        
        // Check if there are pause hit areas to hover over
        if (this.pauseHitAreas) {
            for (let i = 0; i < this.pauseHitAreas.length; i++) {
                const area = this.pauseHitAreas[i];
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    this.hoveredPauseButton = i;
                    break;
                }
            }
        }
    }

    /**
     * Handle mouse hover effects for settings screen
     */
    handleSettingsHover(x, y) {
        if (this.settingsSystem && this.settingsHitAreas) {
            this.settingsSystem.handleMouseMove(x, y, this.settingsHitAreas);
        }
    }

    /**
     * Handle clicks in settings screen
     */
    handleSettingsClick(x, y) {
        console.log('🎯 Settings click at:', x, y);
        if (this.settingsSystem && this.settingsHitAreas) {
            const action = this.settingsSystem.handleClick(x, y, this.settingsHitAreas);
            console.log('⚡ Settings action:', action);
            
            if (action === 'back') {
                console.log('🏠 Navigating back to OPTIONS');
                this.navigateToState(GAME_STATES.OPTIONS);
            }
        }
        
        // Close any expanded dropdowns if clicking outside them
        if (this.settingsSystem && this.settingsSystem.expandedDropdown) {
            let clickedOnDropdown = false;
            
            // Check if the click was on a dropdown or its options
            for (const area of this.settingsHitAreas || []) {
                if (x >= area.x && x <= area.x + area.width && 
                    y >= area.y && y <= area.y + area.height) {
                    if (area.action === 'dropdown' || area.action === 'dropdown-option') {
                        clickedOnDropdown = true;
                        break;
                    }
                }
            }
            
            // Close dropdown if not clicked on dropdown
            if (!clickedOnDropdown) {
                this.settingsSystem.expandedDropdown = null;
            }
        }
    }

    /**
     * Handle clicks in game over screen
     */
    handleGameOverClick(x, y) {
        if (!this.gameOverHitAreas) return;
        
        // Check if any game over button was clicked
        for (let i = 0; i < this.gameOverHitAreas.length; i++) {
            const area = this.gameOverHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Handle different button actions
                switch (area.action) {
                    case 'restart':
                        this.startNewGame();
                        break;
                    case 'difficulty':
                        this.navigateToState(GAME_STATES.DIFFICULTY_SELECT);
                        break;
                    case 'home':
                        this.navigateToState(GAME_STATES.HOME);
                        break;
                    case 'leaderboard':
                        this.navigateToState(GAME_STATES.LEADERBOARD);
                        break;
                    case 'shop':
                        this.navigateToState(GAME_STATES.SHOP);
                        break;
                    case 'settings':
                        this.navigateToState(GAME_STATES.SETTINGS);
                        break;
                    default:
                        console.warn(`Unknown game over action: ${area.action}`);
                        break;
                }
                
                break; // Stop checking other areas once we find a match
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
        const y = (e.clientY - rect.top) * scaleY;

        // Check for popup clicks first (popups should work in any state)
        if (this.popupSystem && this.popupSystem.activePopup) {
            const handled = this.popupSystem.handleClick(x, y);
            if (handled) {
                return; // Popup handled the click, don't process other handlers
            }
        }

        // Handle different game states
        switch (this.gameState) {case GAME_STATES.VIDEO_INTRO:
                // Video intro system removed - skipping video intro state
                break;            case GAME_STATES.LOGIN_PROMPT:
                // Handle login prompt clicks (delegate to login system)
                if (this.loginSystem) {
                    this.loginSystem.handleClick(x, y);
                }
                break;

            case GAME_STATES.TUTORIAL:
                // Handle tutorial clicks (delegate to tutorial system)
                if (this.tutorialSystem) {
                    this.tutorialSystem.handleClick({ clientX: e.clientX, clientY: e.clientY });
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
                
            case GAME_STATES.OPTIONS:
                this.handleOptionsClick(x, y);
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
                
            case GAME_STATES.ACHIEVEMENTS:
                this.handleAchievementsClick(x, y);
                break;            case GAME_STATES.SHOP:
                this.handleShopClick(x, y);
                break;
                
            case GAME_STATES.SETTINGS:
                this.handleSettingsClick(x, y);
                break;
                  case GAME_STATES.RESET_CONFIRM:
                this.handleResetConfirmClick(x, y);
                break;
                  case GAME_STATES.GAME_OVER:
                this.handleGameOverClick(x, y);
                break;
                
            case GAME_STATES.PAUSED:
                this.handlePauseClick(x, y);
                break;default:
                // No specific handling for this state
                break;
        }
    }    /**
     * Handle escape key presses to go back to previous screen
     */
    handleEscape() {
        // Play menu click sound
        if (this.audioSystem) {
            this.audioSystem.onMenuClick();
        }

        // Navigate back based on current state
        switch (this.gameState) {
            case GAME_STATES.PLAYING:
                // Pause the game
                this.togglePause();
                break;
                
            case GAME_STATES.SETTINGS:
            case GAME_STATES.OPTIONS:
            case GAME_STATES.CREDITS:
            case GAME_STATES.ACHIEVEMENTS:
            case GAME_STATES.LEADERBOARD:
            case GAME_STATES.SHOP:
            case GAME_STATES.DIFFICULTY_SELECT:
                // Go back to previous state, or home if no previous state
                const backState = this.previousGameState || GAME_STATES.HOME;
                console.log(`🔙 Escape pressed: Going from ${this.gameState} back to ${backState}`);
                this.navigateToState(backState);
                break;
                
            case GAME_STATES.PAUSED:
                // Resume game
                this.togglePause();
                break;
                
            case GAME_STATES.GAME_OVER:
                // Go to home screen
                this.navigateToState(GAME_STATES.HOME);
                break;
                
            case GAME_STATES.POST_ANIMATION_POPUP:
                // Close popup and go to home
                this.gameState = GAME_STATES.HOME;
                break;
                
            case GAME_STATES.HOME:
                // Don't do anything when already at home screen
                console.log(`🏠 Already at home screen, ignoring escape`);
                break;
                
            default:
                // For other states, try to go to home
                if (this.gameState !== GAME_STATES.HOME && this.gameState !== GAME_STATES.PLAYING) {
                    this.navigateToState(GAME_STATES.HOME);
                }
                break;
        }
    }

    /**
     * Handle clicks in difficulty selection screen
     */
    handleDifficultyClick(x, y) {
        console.log('🎯 Difficulty click at:', x, y);
        console.log('🎯 Hit areas:', this.difficultyHitAreas);
        
        if (!this.difficultyHitAreas) return;
        
        // Check if any difficulty button was clicked
        for (let i = 0; i < this.difficultyHitAreas.length; i++) {
            const area = this.difficultyHitAreas[i];
            console.log(`🎯 Checking area ${i}:`, area);
            
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                console.log(`✅ Hit detected on area ${i}:`, area);
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }

                // Handle different button actions
                if (area.action === 'back') {
                    console.log('🔙 Back button clicked');
                    this.navigateToState(GAME_STATES.HOME);
                } else if (area.action === 'difficulty') {
                    // Set selected difficulty and start game
                    this.selectedDifficulty = area.difficulty;
                    console.log(`🎮 Selected difficulty: ${this.selectedDifficulty}`);
                    this.startGame();
                }
                break;
            }
        }
    }
    /**
     * Main game loop - handles updating and rendering
     */
    gameLoop(timestamp) {
        try {
            const frameStartTime = performance.now();
            
            // Calculate delta time with frame limiting
            const currentTime = timestamp || performance.now();
            this.deltaTime = Math.min(currentTime - this.lastTime, 16.67); // Cap at ~60fps
            this.lastTime = currentTime;
            
            // Track frame timing for performance metrics
            const updateStartTime = performance.now();
            
            // Update FPS counter
            this.updateFPS(currentTime);
            
            // Update game state
            this.update();
            
            // Track update time
            this.performanceMetrics.updateTime = performance.now() - updateStartTime;
            
            // Track render start time
            const renderStartTime = performance.now();
            
            // Render everything
            this.render();
            
            // Track render time
            this.performanceMetrics.renderTime = performance.now() - renderStartTime;
            
            // Track total frame time
            this.performanceMetrics.frameTime = performance.now() - frameStartTime;
            
            // Adaptive performance optimization
            this.checkAndApplyAdaptiveOptimizations();
            
            // Continue the game loop
            requestAnimationFrame((ts) => this.gameLoop(ts));
        } catch (error) {
            console.error('🎮 Game loop error:', error);
            // Continue the loop even if there's an error to prevent the game from completely freezing
            requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    /**
     * Update FPS counter and performance metrics
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount - this.lastFrameCount) * 1000 / (currentTime - this.lastFpsUpdate));
            this.lastFrameCount = this.frameCount;
            this.lastFpsUpdate = currentTime;
            
            // Store FPS history for performance monitoring
            if (this.performanceMetrics) {
                this.performanceMetrics.fpsHistory.push(this.fps);
                if (this.performanceMetrics.fpsHistory.length > 60) {
                    this.performanceMetrics.fpsHistory.shift();
                }
            }
        }
    }

    /**
     * Get performance metrics for UI display
     */
    getPerformanceMetrics() {
        return {
            fps: this.fps || 0,
            frameTime: this.performanceMetrics.frameTime || 0,
            updateTime: this.performanceMetrics.updateTime || 0,
            renderTime: this.performanceMetrics.renderTime || 0,
            fpsHistory: this.performanceMetrics.fpsHistory || []
        };
    }

    /**
     * Update game logic
     */
    update() {
        // Input manager uses event listeners, no update needed
        
        // Update systems based on game state
        switch (this.gameState) {
            case GAME_STATES.LOADING:
                if (this.loadingScreenSystem) {
                    this.loadingScreenSystem.update(this.deltaTime);
                }
                break;
                
            case GAME_STATES.PLAYING:
                this.updateGameplay();
                break;
                
            case GAME_STATES.OPENING_ANIMATION:
                if (this.openingAnimation) {
                    this.openingAnimation.update(this.deltaTime);
                }
                break;
                
            case GAME_STATES.TUTORIAL:
                if (this.tutorialSystem) {
                    this.tutorialSystem.update(this.deltaTime);
                }
                break;
                
            default:
                // Update background systems that should always run
                if (this.popupSystem) {
                    this.popupSystem.update(this.deltaTime);
                }
                break;        }
        
        // Audio system doesn't need per-frame updates (event-driven)
    }

    /**
     * Update gameplay logic when in playing state
     */
    updateGameplay() {
        if (!this.player || !this.world) return;
        
        // Always update quantum dash animation (even when paused, since it controls the pause)
        if (this.quantumDashAnimation) {
            this.quantumDashAnimation.update(this.deltaTime);
        }
        
        // Skip other updates if paused
        if (this.isPaused) return;
        
        // Get input keys from input manager
        const inputKeys = this.inputManager ? this.inputManager.getKeys() : {};
        
        // Update player with all required parameters
        this.player.update(this.deltaTime, inputKeys, this.world, this.physics);
        
        // Update world
        this.world.update(this.deltaTime, this.camera);
        
        // Update physics
        if (this.physics) {
            this.physics.update(this.deltaTime);
        }
        
        // Update game systems
        if (this.powerUpSystem) {
            this.powerUpSystem.update(this.deltaTime);
        }
        
        if (this.lifeBoxSystem) {
            this.lifeBoxSystem.update(this.deltaTime);
        }
        
        // Update camera
        this.updateCamera();
        
        // Update screen shake
        this.updateScreenShake(this.deltaTime);
        
        // Update adaptive difficulty
        this.updateAdaptiveDifficulty();
        
        // Update score
        this.updateScore();
        
        // Update adaptive difficulty
        this.updateAdaptiveDifficulty();
    }

    /**
     * Update camera position to follow player
     */
    updateCamera() {
        if (this.player) {
            this.camera.x = this.player.x - this.canvas.width / 2;
            this.camera.y = this.player.y - this.canvas.height / 2;
            
            // Prevent camera from showing empty space to the left of the world
            // Keep camera.x at minimum 0 so the left edge of the world is always at screen edge
            this.camera.x = Math.max(0, this.camera.x);
        }
    }

    /**
     * Update game score
     */
    updateScore() {
        if (this.player && this.gameState === GAME_STATES.PLAYING) {
            // Update score based on distance traveled
            const distanceScore = Math.floor(this.player.x / 10);
            this.score = distanceScore + this.bonusScore;
        }
    }

    /**
     * Update adaptive difficulty based on player performance
     */
    updateAdaptiveDifficulty() {
        if (!this.adaptiveDifficulty || !this.player) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastPerformanceCheck < 5000) return; // Check every 5 seconds
        
        this.lastPerformanceCheck = currentTime;
        
        // Analyze player performance
        const survivalTime = (currentTime - this.startTime) / 1000;
        const currentScore = this.score;
        const recentDamage = this.player.lastDamageTime && (currentTime - this.player.lastDamageTime) < 10000;
        
        // Performance metrics
        const scoreRate = survivalTime > 0 ? currentScore / survivalTime : 0;
        const expectedScoreRate = this.getExpectedScoreRate();
        const performanceRatio = scoreRate / expectedScoreRate;
        
        // Record performance
        this.playerPerformanceHistory.push(performanceRatio);
        if (this.playerPerformanceHistory.length > 10) {
            this.playerPerformanceHistory.shift(); // Keep only last 10 entries
        }
        
        // Calculate average performance
        const avgPerformance = this.playerPerformanceHistory.reduce((a, b) => a + b, 0) / this.playerPerformanceHistory.length;
        
        // Adjust difficulty based on performance
        if (avgPerformance > 1.2) { // Player performing well
            this.consecutiveSuccesses++;
            this.consecutiveFailures = 0;
            if (this.consecutiveSuccesses >= 3) {
                this.adaptiveDifficultyMultiplier = Math.min(1.5, this.adaptiveDifficultyMultiplier + 0.1);
                this.consecutiveSuccesses = 0;
                console.log(`🎮 Adaptive difficulty increased: ${this.adaptiveDifficultyMultiplier.toFixed(2)}x`);
            }
        } else if (avgPerformance < 0.8 || recentDamage) { // Player struggling
            this.consecutiveFailures++;
            this.consecutiveSuccesses = 0;
            if (this.consecutiveFailures >= 2) {
                this.adaptiveDifficultyMultiplier = Math.max(0.7, this.adaptiveDifficultyMultiplier - 0.1);
                this.consecutiveFailures = 0;
                console.log(`🎮 Adaptive difficulty decreased: ${this.adaptiveDifficultyMultiplier.toFixed(2)}x`);
            }
        }
    }

    /**
     * Get expected score rate for current difficulty
     */
    getExpectedScoreRate() {
        const difficultyConfig = DIFFICULTY_LEVELS[this.selectedDifficulty];
        if (!difficultyConfig) return 100; // Default expected rate
        
        // Base expected score rate varies by difficulty
        const baseRates = {
            'EASY': 150,
            'MEDIUM': 120,
            'HARD': 100,
            'EXTREME': 80,
            'IMPOSSIBLE': 60
        };
        
        return baseRates[this.selectedDifficulty] || 100;
    }

    /**
     * Check performance and apply adaptive optimizations if needed
     */
    checkAndApplyAdaptiveOptimizations() {
        const currentTime = Date.now();
        
        // Only check every 2 seconds to avoid overhead
        if (currentTime - this.performanceMetrics.lastOptimizationCheck < 2000) {
            return;
        }
        
        this.performanceMetrics.lastOptimizationCheck = currentTime;
        
        // Check if FPS is consistently low
        if (this.fps < 45) {
            this.performanceMetrics.lowFpsCounter++;
        } else if (this.fps > 55) {
            this.performanceMetrics.lowFpsCounter = Math.max(0, this.performanceMetrics.lowFpsCounter - 1);
        }
        
        // Apply optimizations based on performance
        if (this.performanceMetrics.lowFpsCounter >= 3 && this.performanceMetrics.adaptiveOptimizationLevel < 3) {
            this.applyNextOptimizationLevel();
        } else if (this.performanceMetrics.lowFpsCounter === 0 && this.performanceMetrics.adaptiveOptimizationLevel > 0) {
            this.reduceOptimizationLevel();
        }
    }

    /**
     * Apply the next level of performance optimization
     */
    applyNextOptimizationLevel() {
        this.performanceMetrics.adaptiveOptimizationLevel++;
        console.log(`🚀 Applying optimization level ${this.performanceMetrics.adaptiveOptimizationLevel}`);
        
        switch (this.performanceMetrics.adaptiveOptimizationLevel) {
            case 1:
                // Level 1: Reduce background particles
                if (this.renderer) {
                    this.renderer.setRenderOptimizations({
                        skipBackgroundParticles: true,
                        particleQuality: 0.5
                    });
                }
                break;
            case 2:
                // Level 2: Reduce graphics quality
                if (this.graphicsQuality !== 'low') {
                    this.graphicsQuality = 'low';
                    this.applyGraphicsQuality();
                }
                break;
            case 3:
                // Level 3: Enable high performance mode on tile renderer
                if (this.world?.tileRenderer) {
                    this.world.tileRenderer.setHighPerformanceMode(true);
                }
                break;
        }
        
        this.performanceMetrics.lowFpsCounter = 0;
    }

    /**
     * Reduce optimization level when performance improves
     */
    reduceOptimizationLevel() {
        if (this.performanceMetrics.adaptiveOptimizationLevel > 0) {
            this.performanceMetrics.adaptiveOptimizationLevel--;
            console.log(`🔄 Reducing optimization level to ${this.performanceMetrics.adaptiveOptimizationLevel}`);
            
            // Restore previous settings as performance improves
            // Note: This is a conservative approach - we don't immediately restore all settings
        }
    }

    /**
     * Render everything
     */
    render() {
        if (!this.ctx || !this.renderer) return;
        
        try {
            // Clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Delegate rendering to the renderer
            this.renderer.render();
            
            // Render popup system on top if active
            if (this.popupSystem && this.popupSystem.activePopup) {
                this.popupSystem.render();
            }
            
            // Render FPS counter if enabled
            if (this.showFpsCounter) {
                this.renderFPS();
            }
            
        } catch (error) {
            console.error('🎮 Render error:', error);
        }
    }    /**
     * Render FPS counter
     */
    renderFPS() {
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 30);
        this.ctx.restore();
    }

    /**
     * Render milestone effects (visual feedback for reaching score milestones)
     */
    renderMilestoneEffects(ctx) {
        // Placeholder for milestone visual effects
        // This could include particle effects, screen flashes, or other visual feedback
        // when the player reaches certain score milestones
        
        // For now, this is a stub to prevent runtime errors
        // TODO: Implement milestone visual effects if needed
    }

    /**
     * Add debug commands for testing
     */
    addDebugCommands() {
        // Add debug commands to window for testing
        if (typeof window !== 'undefined') {
            window.gameDebug = {
                upgradeTest: () => {
                    if (this.upgradeSystem && window.UpgradeTestHelper) {
                        window.UpgradeTestHelper.runUpgradeTests(this.upgradeSystem);
                    }
                },
                toggleAudio: () => {
                    if (this.audioSystem) {
                        this.audioSystem.toggleMute();
                        console.log('Audio muted:', this.audioSystem.getIsMuted());
                    }
                },
                setVolume: (volume) => {
                    if (this.audioSystem) {
                        this.audioSystem.setMasterVolume(volume);
                        console.log('Master volume set to:', volume);
                    }
                }
            };
            console.log('🐛 Debug commands added to window.gameDebug');
        }
    }

    /**
     * Load saved best scores from localStorage
     */
    loadBestScores() {
        try {
            const saved = localStorage.getItem('bestScores');
            if (saved) {
                this.bestScores = { ...this.bestScores, ...JSON.parse(saved) };
                console.log('✅ Best scores loaded:', this.bestScores);
            }
        } catch (error) {
            console.warn('⚠️ Could not load best scores:', error);
        }
    }

    /**
     * Load saved game data
     */
    async loadGameData() {
        try {            // Load upgrade system data
            if (this.upgradeSystem) {
                await this.upgradeSystem.loadUpgradeData();            }
            
            // Achievement system loads data in constructor
            // Shop system loads data in constructor
                        
            console.log('✅ Game data loaded successfully');
        } catch (error) {
            console.warn('⚠️ Could not load some game data:', error);
        }
    }

    /**
     * Start autosave system
     */
    startAutosave() {
        // Save game data every 30 seconds
        setInterval(() => {
            // Check if autosave is enabled
            if (!this.autoSave) {
                console.log('💾 Autosave skipped (disabled in settings)');
                return;
            }
            
            try {
                // Save best scores
                localStorage.setItem('bestScores', JSON.stringify(this.bestScores));
                
                // Save system data
                if (this.upgradeSystem) {
                    this.upgradeSystem.saveUpgradeData();
                }
                if (this.achievementSystem) {
                    this.achievementSystem.saveAchievementData();
                }
                if (this.shopSystem) {
                    this.shopSystem.saveOwnedUpgrades();
                }
                
                console.log('💾 Autosave completed');
            } catch (error) {
                console.warn('⚠️ Autosave failed:', error);
            }
        }, 30000); // Save every 30 seconds
        
        console.log('💾 Autosave system started');
    }

    /**
     * Determine initial navigation state
     */
    async determineInitialNavigation() {        
        try {
            // If loading screen is active, don't change the state yet
            if (this.loadingScreenSystem && this.loadingScreenSystem.isActiveLoading()) {
                console.log('🔑 Loading screen still active, deferring navigation...');
                // Store the intended state but don't set it yet
                const shouldShowOpeningAnimation = this.getShouldShowOpeningAnimation();
                
                if (shouldShowOpeningAnimation) {
                    this.pendingGameState = GAME_STATES.OPENING_ANIMATION;
                } else if (this.loginSystem && this.loginSystem.isUserAuthenticated()) {
                    this.pendingGameState = GAME_STATES.HOME;
                } else {
                    this.pendingGameState = GAME_STATES.HOME;
                }
                return;
            }
            
            // Check if opening animation should be shown
            const shouldShowOpeningAnimation = this.getShouldShowOpeningAnimation();
            
            if (shouldShowOpeningAnimation) {
                console.log('🎮 Showing opening animation');
                this.setGameState(GAME_STATES.OPENING_ANIMATION);
            } else if (this.loginSystem && this.loginSystem.isUserAuthenticated()) {
                console.log('🔑 Skipping opening animation, user is logged in, going to home screen');
                this.setGameState(GAME_STATES.HOME);
            } else {
                console.log('🔑 Skipping opening animation, going to home screen');
                this.setGameState(GAME_STATES.HOME);
            }
        } catch (error) {
            console.warn('⚠️ Could not determine navigation state:', error);
            this.setGameState(GAME_STATES.HOME);
        }
    }
    
    /**
     * Utility function to wrap text to fit within specified width
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} text - Text to wrap
     * @param {number} maxWidth - Maximum width in pixels
     * @param {number} lineHeight - Height between lines (optional)
     * @return {Array} Array of text lines
     */
    static wrapText(ctx, text, maxWidth, lineHeight = 16) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    /**
     * Draw wrapped text at specified position
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position (top of first line)
     * @param {number} maxWidth - Maximum width in pixels
     * @param {number} lineHeight - Height between lines
     */
    static drawWrappedText(ctx, text, x, y, maxWidth, lineHeight = 16) {
        const lines = Game.wrapText(ctx, text, maxWidth, lineHeight);
        
        lines.forEach((line, index) => {
            ctx.fillText(line, x, y + (index * lineHeight));
        });
        
        return lines.length * lineHeight; // Return total height used
    }

    /**
     * Handle achievements scrolling with proper bounds checking
     */
    handleAchievementsScroll(delta) {
        if (this.gameState !== GAME_STATES.ACHIEVEMENTS || !this.achievementSystem) {
            return;
        }

        // Get current filter from achievement system
        const currentFilter = this.achievementSystem.currentCategoryFilter || 'all';
        
        // Calculate max scroll offset based on current filter
        const maxScrollOffset = this.achievementSystem.getMaxScrollOffset(
            this.canvas.width, 
            this.canvas.height, 
            currentFilter
        );

        // Update scroll offset with bounds checking
        this.achievementsScrollOffset += delta;
        this.achievementsScrollOffset = Math.max(0, Math.min(this.achievementsScrollOffset, maxScrollOffset));
    }

    /**
     * Handle clicks in achievements screen
     */
    handleAchievementsClick(x, y) {
        if (!this.achievementsHitAreas || !this.achievementSystem) return;
        
        // Check if any achievements button was clicked
        for (let i = 0; i < this.achievementsHitAreas.length; i++) {
            const area = this.achievementsHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Handle different button actions
                if (area.action === 'back') {
                    this.navigateToState(this.previousGameState || GAME_STATES.OPTIONS);
                } else if (area.action === 'filter') {
                    // Set category filter and reset scroll
                    this.achievementSystem.currentCategoryFilter = area.category;
                    this.achievementsScrollOffset = 0;
                } else if (area.action === 'achievement') {
                    // Could show achievement details or play a sound
                    if (this.audioSystem) {
                        this.audioSystem.onMenuClick();
                    }
                }
                break;
            }
        }
    }

    /**
     * Handle mouse down events for slider dragging
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Only handle slider interactions in settings state
        if (this.gameState === GAME_STATES.SETTINGS) {
            if (this.gameDialogs) {
                this.gameDialogs.handleMouseDown(x, y);
            }
        }
    }    /**
     * Handle mouse up events for slider dragging
     */
    handleMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
          // Only handle slider interactions in settings state
        if (this.gameState === GAME_STATES.SETTINGS) {
            if (this.gameDialogs) {
                this.gameDialogs.handleMouseUp(x, y);
            }
        }
    }

    /**
     * Handle shop toggle functionality
     */
    handleShopToggle() {
        if (this.gameState === GAME_STATES.SHOP) {
            // Exit shop, return to previous state
            this.navigateToState(this.previousGameState || GAME_STATES.HOME);
        } else {
            // Enter shop from current state
            this.previousGameState = this.gameState;
            this.navigateToState(GAME_STATES.SHOP);
            this.shopScrollOffset = 0; // Reset scroll when entering shop
        }
    }

    /**
     * Handle shop scrolling with bounds checking
     */
    handleShopScroll(delta) {
        if (this.gameState !== GAME_STATES.SHOP || !this.shopSystem) {
            return;
        }

        // Update scroll offset with bounds checking
        const maxScrollOffset = this.getShopMaxScrollOffset();
        this.shopScrollOffset += delta * 30; // Scale factor for smoother scrolling
        this.shopScrollOffset = Math.max(0, Math.min(this.shopScrollOffset, maxScrollOffset));
    }

    /**
     * Handle mouse wheel events for shop and settings scrolling
     */
    handleMouseWheel(event) {
        // Prevent default scrolling behavior
        event.preventDefault();
        
        // Handle wheel events based on current state
        if (this.gameState === GAME_STATES.SHOP) {
            // Get wheel direction (positive = scroll down, negative = scroll up)
            const delta = Math.sign(event.deltaY);
            this.handleShopScroll(delta);
        } else if (this.gameState === GAME_STATES.SETTINGS && this.settingsSystem) {
            // Handle settings scrolling
            this.settingsSystem.handleWheel(event.deltaY);
        }
    }

    /**
     * Calculate maximum scroll offset for shop based on content
     */
    getShopMaxScrollOffset() {
        if (!this.shopSystem || !this.canvas) {
            return 0;
        }

        // Basic calculation - adjust based on your shop UI layout
        const upgrades = Object.keys(this.shopSystem.upgradeData);
        const itemHeight = 80; // Approximate height per shop item
        const visibleHeight = this.canvas.height - 200; // Account for UI margins
        const totalContentHeight = upgrades.length * itemHeight;
        
        return Math.max(0, totalContentHeight - visibleHeight);
    }

    /**
     * Start a new game with the selected difficulty
     */
    startGame() {
        try {
            console.log(`🎮 Starting new game with difficulty: ${this.selectedDifficulty}`);
            console.log('🔍 DEBUG: startGame() called');
            console.log('🔍 DEBUG: PowerUpSystem exists?', !!this.powerUpSystem);
            console.log('🔍 DEBUG: window.debugMode:', window.debugMode);
            
            // Initialize game world
            this.world = new WorldGenerator(this);
            
            // Initialize player at far left starting position (no empty space behind)
            this.player = new Player(32, 200, this); // Start at x=32 (one tile from left edge)
            
            // Reapply all owned shop upgrades to the new player instance
            if (this.shopSystem) {
                const ownedUpgrades = this.shopSystem.getOwnedUpgrades();
                for (const upgradeId of ownedUpgrades) {
                    const upgrade = this.shopSystem.upgradeData[upgradeId];
                    if (upgrade) {
                        this.shopSystem.applyUpgradeEffect(upgradeId, upgrade);
                    }
                }
                console.log(`🔄 Reapplied ${ownedUpgrades.length} shop upgrades to new player`);
            }
            
            // Initialize physics engine with world
            this.physics = new PhysicsEngine(this.world);
            
            // Reset game state
            this.score = 0;
            this.bonusScore = 0;
            this.startTime = Date.now();
            this.gameOverReason = null;
            this.gameOverMessage = null;
            this.gameOverStartTime = null;
            this.isNewHighScore = false;
            
            // Reset speed penalty system
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
            
            // Set game state to playing
            this.gameState = GAME_STATES.PLAYING;
            this.isPaused = false;
            
            // Reset camera
            this.camera = { x: 0, y: 0 };
            
            // Generate initial world chunks to ensure spawn area is ready
            this.world.generateChunksForCamera(this.camera);
            
            // 🧪 TESTING: Add guaranteed quantum dash powerup at spawn - ALWAYS!
            console.log('🧪 Adding guaranteed quantum dash powerup for testing');
            
            // Get the quantum dash definition
            const quantumDashDef = this.powerUpSystem.powerUpDefinitions['quantum-dash'];
            console.log('🔍 DEBUG: quantumDashDef:', quantumDashDef);
            
            // Create quantum dash powerup right near spawn
            const testPowerUp = {
                id: 'test-quantum-dash-' + Date.now(),
                x: this.player.x + 150, // Just ahead of player spawn
                y: this.player.y - 30,   // Slightly above player
                width: 32,
                height: 32,
                collected: false,
                definition: quantumDashDef,
                animationTime: 0,
                pulsePhase: Math.random() * Math.PI * 2,
                isTestPowerUp: true // Mark as test powerup
            };
            
            console.log('🔍 DEBUG: Created test powerup:', testPowerUp);
            console.log('🔍 DEBUG: Current spawned powerups count before:', this.powerUpSystem.spawnedPowerUps.length);
            
            // Add directly to PowerUpSystem's spawned powerups array
            this.powerUpSystem.spawnedPowerUps.push(testPowerUp);
            
            console.log('✨ Test quantum dash powerup added to spawned powerups at:', testPowerUp.x, testPowerUp.y);
            console.log('🚀 Spawned powerups count after:', this.powerUpSystem.spawnedPowerUps.length);
            
            // Play start game sound
            if (this.audioSystem) {
                this.audioSystem.onMenuClick(); // Use existing menu click sound for game start
            }
            
            console.log('✅ Game started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start game:', error);
            // Fallback to home screen if game start fails
            this.gameState = GAME_STATES.HOME;
        }
    }
    
    /**
     * Restart the current game
     */
    restart() {
        this.startGame();
    }

    /**
     * Start a new game (alias for restart)
     */
    startNewGame() {
        this.restart();
    }

    /**
     * Toggle game pause state
     */
    togglePause() {
        if (this.gameState !== GAME_STATES.PLAYING && this.gameState !== GAME_STATES.PAUSED) {
            return; // Can only pause/unpause during gameplay
        }
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.gameState = GAME_STATES.PAUSED;
            this.pauseStartTime = Date.now();
            console.log('⏸️ Game paused');
        } else {
            this.gameState = GAME_STATES.PLAYING;
            console.log('▶️ Game resumed');
        }
        
        // Play pause/resume sound
        if (this.audioSystem) {
            if (this.isPaused) {
                this.audioSystem.onPause();
            } else {
                this.audioSystem.onResume();
            }
        }
    }
    
    /**
     * Handle game over - set game state and reason
     */
    gameOver(reason) {
        console.log(`🎮 Game Over: ${reason}`);
        
        // Check if death animation should be skipped
        const shouldSkipDeathAnimation = this.getShouldSkipDeathAnimation();
        console.log('💨 Should skip death animation:', shouldSkipDeathAnimation);
        
        if (shouldSkipDeathAnimation) {
            console.log('💨 BYPASSING DEATH MENU - INSTANT RESTART');
            console.log('💨 Current game state before:', this.gameState);
            
            // Completely bypass death menu - set directly to playing
            this.gameState = GAME_STATES.PLAYING;
            console.log('💨 New game state set to:', this.gameState);
            
            // Reset everything for new game
            this.score = 0;
            this.isPaused = false;
            this.gameOverReason = null;
            this.gameOverMessage = null;
            this.gameOverStartTime = null;
            this.isNewHighScore = false;
            
            // Reset player completely
            if (this.player) {
                console.log('💨 Resetting player position and health');
                this.player.x = 32; // Same as startGame()
                this.player.y = 200; // Same as startGame()
                this.player.velocityX = 0;
                this.player.velocityY = 0;
                this.player.health = this.player.maxHealth;
                this.player.isJumping = false;
                this.player.onGround = false;
                this.player.isDead = false; // Make sure player isn't marked as dead
            }
            
            // Reset world
            if (this.world) {
                console.log('💨 Resetting world');
                this.world.reset();
            }
            
            console.log('💨 INSTANT RESTART COMPLETE');
            return; // COMPLETELY EXIT - don't execute any death menu code
        }
        
        // Set game over state
        this.gameState = GAME_STATES.GAME_OVER;
        this.gameOverReason = reason;
        this.gameOverStartTime = Date.now();
        
        // Stop the game
        this.isPaused = false; // Make sure we're not paused
        
        // Check for high score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.isNewHighScore = true;
            
            // Save new high score
            if (this.saveSystem) {
                this.saveSystem.saveHighScore(this.bestScore);
            }
        }
        
        // Play game over sound
        if (this.audioSystem) {
            this.audioSystem.onGameOver();
        }
        
        // Save game data
        if (this.saveSystem) {
            this.saveSystem.saveGameData();
        }
    }

    /**
     * Handle clicks in leaderboard screen
     */
    handleLeaderboardClick(x, y) {
        if (!this.tabHitAreas) return;
        
        // Check if any difficulty tab was clicked
        for (let i = 0; i < this.tabHitAreas.length; i++) {
            const area = this.tabHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Switch to the selected difficulty tab
                if (this.leaderboardSystem) {
                    this.leaderboardSystem.selectedDifficulty = area.difficulty;
                }
                
                return;
            }
        }
    }

    /**
     * Handle window gaining focus
     */
    handleWindowFocus() {
        console.log('🎮 Window gained focus');
        
        // Resume audio if mute when unfocused is enabled
        if (this.audioSystem && this.audioSystem.muteWhenUnfocused && this.audioSystem.wasMutedByFocus) {
            this.audioSystem.setMuted(false);
            this.audioSystem.wasMutedByFocus = false;
            console.log('🎮 Audio resumed due to window focus');
        }
        
        // Resume game if pause on focus loss is enabled and game was auto-paused
        if (this.pauseOnFocusLoss && this.wasAutoPaused && this.gameState === GAME_STATES.PAUSED) {
            this.togglePause();
            this.wasAutoPaused = false;
            console.log('🎮 Game resumed due to window focus');
        }
    }

    /**
     * Handle window losing focus
     */
    handleWindowBlur() {
        console.log('🎮 Window lost focus');
        
        // Mute audio if mute when unfocused is enabled
        if (this.audioSystem && this.audioSystem.muteWhenUnfocused && !this.audioSystem.isMuted) {
            this.audioSystem.setMuted(true);
            this.audioSystem.wasMutedByFocus = true;
            console.log('🎮 Audio muted due to window blur');
        }
        
        // Pause game if pause on focus loss is enabled and game is playing
        if (this.pauseOnFocusLoss && this.gameState === GAME_STATES.PLAYING) {
            this.togglePause();
            this.wasAutoPaused = true;
            console.log('🎮 Game auto-paused due to window blur');
        }
    }

    /**
     * Trigger screen shake effect
     */
    triggerScreenShake(intensity = 1.0, duration = 300) {
        if (!this.screenShake) return;
        
        this.currentShake.intensity = Math.max(this.currentShake.intensity, intensity * this.shakeIntensity);
        this.currentShake.duration = Math.max(this.currentShake.duration, duration);
        
        console.log(`🎮 Screen shake triggered: intensity=${this.currentShake.intensity}, duration=${this.currentShake.duration}ms`);
    }

    /**
     * Update screen shake effect
     */
    updateScreenShake(deltaTime) {
        if (this.currentShake.duration <= 0) {
            this.currentShake.x = 0;
            this.currentShake.y = 0;
            this.currentShake.intensity = 0;
            return;
        }
        
        // Reduce shake duration
        this.currentShake.duration -= deltaTime;
        
        // Calculate shake offset
        const progress = Math.max(0, this.currentShake.duration / 300); // Normalize to 0-1
        const currentIntensity = this.currentShake.intensity * progress;
        
        // Generate random shake offset
        this.currentShake.x = (Math.random() - 0.5) * currentIntensity * 20;
        this.currentShake.y = (Math.random() - 0.5) * currentIntensity * 20;
        
        // Fade out shake intensity
        if (this.currentShake.duration <= 0) {
            this.currentShake.intensity = 0;
        }
    }

    /**
     * Get camera position with screen shake applied
     */
    getCameraPosition() {
        return {
            x: this.camera.x + this.currentShake.x,
            y: this.camera.y + this.currentShake.y
        };
    }

    /**
     * Handle pause menu button clicks
     */
    handlePauseClick(x, y) {
        if (!this.pauseHitAreas) return;
        
        // Check if any pause menu button was clicked
        for (let i = 0; i < this.pauseHitAreas.length; i++) {
            const area = this.pauseHitAreas[i];
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                // Play menu click sound
                if (this.audioSystem) {
                    this.audioSystem.onMenuClick();
                }
                
                // Handle different button actions
                switch (area.action) {
                    case 'resume':
                        this.togglePause(); // Resume the game
                        break;
                    case 'restart':
                        this.startNewGame();
                        break;
                    case 'difficulty':
                        this.navigateToState(GAME_STATES.DIFFICULTY_SELECT);
                        break;
                    case 'home':
                        this.navigateToState(GAME_STATES.HOME);
                        break;
                    case 'leaderboard':
                        this.navigateToState(GAME_STATES.LEADERBOARD);
                        break;
                    case 'shop':
                        this.navigateToState(GAME_STATES.SHOP);
                        break;
                    case 'settings':
                        this.navigateToState(GAME_STATES.SETTINGS);
                        break;
                    default:
                        console.warn(`Unknown pause menu action: ${area.action}`);
                        break;
                }
                
                break; // Stop checking other areas once we find a match
            }
        }
    }

    /**
     * Debugging: Test function to trigger game over
     */
    testGameOver() {
        this.gameOver('Debug test - forced game over');
    }
    
    /**
     * Set game state and handle any necessary state transitions
     */
    setGameState(newState) {
        const oldState = this.gameState;
        this.gameState = newState;
        
        // Handle state change logic
        if (newState === GAME_STATES.OPENING_ANIMATION && this.openingAnimation) {
            console.log('🎬 Starting opening animation system');
            this.openingAnimation.start();
        }
        
        console.log(`🎮 Game state changed: ${oldState} → ${newState}`);
    }
    
    /**
     * Check if death animation should be skipped
     */
    getShouldSkipDeathAnimation() {
        try {
            const settings = JSON.parse(localStorage.getItem('coderunner_settings') || '{}');
            console.log('💨 All settings:', settings);
            console.log('💨 skipDeathAnimation setting:', settings.skipDeathAnimation);
            
            if (settings.skipDeathAnimation !== undefined) {
                return settings.skipDeathAnimation === true;
            } else {
                return false; // Default to showing death animation
            }
        } catch (error) {
            console.warn('Could not load skipDeathAnimation setting:', error);
            return false;
        }
    }
}
