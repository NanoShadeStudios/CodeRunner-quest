/**
 * Enhanced Settings System for CodeRunner
 * Modern, glassmorphism UI with advanced features and beautiful animations
 */

export class SettingsSystem {
    constructor(gameInstance = null) {
        this.gameInstance = gameInstance;
        
        // Animation state
        this.animationTime = 0;
        this.slideInProgress = 0;
        this.sectionsAnimationProgress = 0;
        this.headerAnimationProgress = 0;
        this.lastFrameTime = Date.now();
        
        // UI state
        this.hoveredItem = null;
        this.selectedItem = null;
        this.scrollOffset = 0;
        this.searchFilter = '';
        this.activeTab = 0;
        this.showTooltip = null;
        this.tooltipTimer = 0;
        this.isKeyCapturing = false;
        this.keyCaptureSetting = null;
        
        // Particle system for background effects
        this.particles = [];
        this.initializeParticles();
        
        // Settings categories with enhanced options
        this.settingsCategories = [
            {
                title: 'Audio',
                icon: '🔊',
                color: '#22c55e',
                description: 'Sound and music settings',
                settings: [
                    { 
                        type: 'slider', 
                        key: 'masterVolume', 
                        label: 'Master Volume', 
                        description: 'Overall game volume',
                        value: 1.0, 
                        min: 0, 
                        max: 1, 
                        step: 0.05,
                        showPercentage: true,
                        live: true
                    },
                    { 
                        type: 'slider', 
                        key: 'musicVolume', 
                        label: 'Music Volume', 
                        description: 'Background music volume',
                        value: 0.7, 
                        min: 0, 
                        max: 1, 
                        step: 0.05,
                        showPercentage: true,
                        live: true
                    },
                    { 
                        type: 'slider', 
                        key: 'sfxVolume', 
                        label: 'Sound Effects', 
                        description: 'Sound effects volume',
                        value: 0.8, 
                        min: 0, 
                        max: 1, 
                        step: 0.05,
                        showPercentage: true,
                        live: true
                    },
                    { 
                        type: 'dropdown', 
                        key: 'audioQuality', 
                        label: 'Audio Quality', 
                        description: 'Sound processing quality',
                        value: 'high', 
                        options: [
                            { value: 'low', label: 'Low (Better Performance)' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High (Better Quality)' }
                        ]
                    },
                    { 
                        type: 'toggle', 
                        key: 'muteWhenUnfocused', 
                        label: 'Mute When Unfocused', 
                        description: 'Automatically mute when window loses focus',
                        value: true 
                    },
                    { 
                        type: 'toggle', 
                        key: 'spatialAudio', 
                        label: 'Spatial Audio', 
                        description: 'Enhanced 3D audio effects',
                        value: false 
                    }
                ]
            },
            {
                title: 'Graphics',
                icon: '🎨',
                color: '#3b82f6',
                description: 'Visual quality and performance',
                settings: [
                    { 
                        type: 'dropdown', 
                        key: 'graphicsQuality', 
                        label: 'Graphics Quality', 
                        description: 'Overall graphics quality preset',
                        value: 'high', 
                        options: [
                            { value: 'potato', label: 'Potato (Minimum)' },
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
                            { value: 'ultra', label: 'Ultra (Maximum)' },
                            { value: 'custom', label: 'Custom' }
                        ]
                    },
                    { 
                        type: 'slider', 
                        key: 'targetFPS', 
                        label: 'Target FPS', 
                        description: 'Target frames per second',
                        value: 60, 
                        min: 30, 
                        max: 144, 
                        step: 1,
                        showValue: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'vsync', 
                        label: 'V-Sync', 
                        description: 'Vertical synchronization to prevent screen tearing',
                        value: true 
                    },
                    { 
                        type: 'toggle', 
                        key: 'showParticles', 
                        label: 'Particle Effects', 
                        description: 'Visual particle effects',
                        value: true 
                    },
                    { 
                        type: 'slider', 
                        key: 'particleDensity', 
                        label: 'Particle Density', 
                        description: 'Amount of particle effects',
                        value: 1.0, 
                        min: 0.25, 
                        max: 2.0, 
                        step: 0.25,
                        showMultiplier: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'screenShake', 
                        label: 'Screen Shake', 
                        description: 'Camera shake effects',
                        value: true 
                    },
                    { 
                        type: 'slider', 
                        key: 'shakeIntensity', 
                        label: 'Shake Intensity', 
                        description: 'Strength of screen shake effects',
                        value: 1.0, 
                        min: 0.1, 
                        max: 2.0, 
                        step: 0.1,
                        showMultiplier: true
                    },
                    { 
                        type: 'slider', 
                        key: 'brightness', 
                        label: 'Brightness', 
                        description: 'Screen brightness adjustment',
                        value: 1.0, 
                        min: 0.5, 
                        max: 2.0, 
                        step: 0.1,
                        showMultiplier: true,
                        live: true
                    },
                    { 
                        type: 'slider', 
                        key: 'contrast', 
                        label: 'Contrast', 
                        description: 'Color contrast adjustment',
                        value: 1.0, 
                        min: 0.5, 
                        max: 2.0, 
                        step: 0.1,
                        showMultiplier: true,
                        live: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'bloomEffect', 
                        label: 'Bloom Effect', 
                        description: 'Glowing light effects',
                        value: true 
                    }
                ]
            },
            {
                title: 'Gameplay',
                icon: '🎮',
                color: '#8b5cf6',
                description: 'Game mechanics and difficulty',
                settings: [
                    { 
                        type: 'dropdown', 
                        key: 'difficulty', 
                        label: 'Default Difficulty', 
                        description: 'Starting difficulty for new games',
                        value: 'normal', 
                        options: [
                            { value: 'story', label: 'Story Mode (Easy)' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'hard', label: 'Hard' },
                            { value: 'nightmare', label: 'Nightmare' },
                            { value: 'insane', label: 'Insane' }
                        ]
                    },
                    { 
                        type: 'slider', 
                        key: 'gameSpeed', 
                        label: 'Game Speed', 
                        description: 'Overall game speed multiplier',
                        value: 1.0, 
                        min: 0.5, 
                        max: 2.0, 
                        step: 0.1,
                        showMultiplier: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'showTutorialHints', 
                        label: 'Tutorial Hints', 
                        description: 'Show helpful hints during gameplay',
                        value: true 
                    },
                    { 
                        type: 'toggle', 
                        key: 'autoSave', 
                        label: 'Auto Save Progress', 
                        description: 'Automatically save game progress',
                        value: true 
                    },
                    { 
                        type: 'slider', 
                        key: 'autoSaveInterval', 
                        label: 'Auto Save Interval', 
                        description: 'Time between automatic saves (seconds)',
                        value: 30, 
                        min: 10, 
                        max: 300, 
                        step: 10,
                        showValue: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'pauseOnFocusLoss', 
                        label: 'Pause on Focus Loss', 
                        description: 'Automatically pause when window loses focus',
                        value: true 
                    },
                    { 
                        type: 'toggle', 
                        key: 'showFPS', 
                        label: 'Show FPS Counter', 
                        description: 'Display frames per second in-game',
                        value: false 
                    },
                    { 
                        type: 'toggle', 
                        key: 'showPerformanceStats', 
                        label: 'Performance Stats', 
                        description: 'Show detailed performance information',
                        value: false 
                    }
                ]
            },
            {
                title: 'Controls',
                icon: '⌨️',
                color: '#f59e0b',
                description: 'Input and control settings',
                settings: [
                    { 
                        type: 'key', 
                        key: 'jumpKey', 
                        label: 'Jump', 
                        description: 'Primary jump key',
                        value: 'Space' 
                    },
                    { 
                        type: 'key', 
                        key: 'dashKey', 
                        label: 'Dash', 
                        description: 'Dash/speed boost key',
                        value: 'Shift' 
                    },
                    { 
                        type: 'key', 
                        key: 'pauseKey', 
                        label: 'Pause', 
                        description: 'Pause game key',
                        value: 'Escape' 
                    },
                    { 
                        type: 'key', 
                        key: 'interactKey', 
                        label: 'Interact', 
                        description: 'Interaction key',
                        value: 'E' 
                    },
                    { 
                        type: 'toggle', 
                        key: 'mouseControls', 
                        label: 'Mouse Controls', 
                        description: 'Enable mouse for movement',
                        value: false 
                    },
                    { 
                        type: 'slider', 
                        key: 'mouseSensitivity', 
                        label: 'Mouse Sensitivity', 
                        description: 'Mouse movement sensitivity',
                        value: 1.0, 
                        min: 0.1, 
                        max: 3.0, 
                        step: 0.1,
                        showMultiplier: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'invertMouse', 
                        label: 'Invert Mouse', 
                        description: 'Invert mouse Y-axis',
                        value: false 
                    },
                    { 
                        type: 'slider', 
                        key: 'keyRepeatDelay', 
                        label: 'Key Repeat Delay', 
                        description: 'Delay before key starts repeating (ms)',
                        value: 200, 
                        min: 50, 
                        max: 500, 
                        step: 25,
                        showValue: true
                    }
                ]
            },
            {
                title: 'Accessibility',
                icon: '♿',
                color: '#10b981',
                description: 'Accessibility and inclusion options',
                settings: [
                    { 
                        type: 'toggle', 
                        key: 'highContrast', 
                        label: 'High Contrast Mode', 
                        description: 'Enhanced contrast for better visibility',
                        value: false 
                    },
                    { 
                        type: 'toggle', 
                        key: 'colorBlindSupport', 
                        label: 'Color Blind Support', 
                        description: 'Alternative color schemes',
                        value: false 
                    },
                    { 
                        type: 'dropdown', 
                        key: 'colorBlindType', 
                        label: 'Color Blind Type', 
                        description: 'Specific color blindness type',
                        value: 'none', 
                        options: [
                            { value: 'none', label: 'None' },
                            { value: 'protanopia', label: 'Protanopia (Red-blind)' },
                            { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
                            { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
                        ]
                    },
                    { 
                        type: 'slider', 
                        key: 'uiScale', 
                        label: 'UI Scale', 
                        description: 'Scale of user interface elements',
                        value: 1.0, 
                        min: 0.75, 
                        max: 2.0, 
                        step: 0.25,
                        showMultiplier: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'reduceMotion', 
                        label: 'Reduce Motion', 
                        description: 'Minimize animations and effects',
                        value: false 
                    },
                    { 
                        type: 'toggle', 
                        key: 'screenReader', 
                        label: 'Screen Reader Support', 
                        description: 'Enhanced support for screen readers',
                        value: false 
                    },
                    { 
                        type: 'slider', 
                        key: 'fontSize', 
                        label: 'Font Size', 
                        description: 'Text size multiplier',
                        value: 1.0, 
                        min: 0.75, 
                        max: 2.0, 
                        step: 0.25,
                        showMultiplier: true
                    }
                ]
            },
            {
                title: 'Advanced',
                icon: '⚙️',
                color: '#ef4444',
                description: 'Advanced settings and development options',
                settings: [
                    { 
                        type: 'toggle', 
                        key: 'debugMode', 
                        label: 'Debug Mode', 
                        description: 'Enable debug information',
                        value: false 
                    },
                    { 
                        type: 'toggle', 
                        key: 'showHitboxes', 
                        label: 'Show Hitboxes', 
                        description: 'Display collision boundaries',
                        value: false 
                    },
                    { 
                        type: 'toggle', 
                        key: 'showGrid', 
                        label: 'Show Grid', 
                        description: 'Display development grid',
                        value: false 
                    },
                    { 
                        type: 'dropdown', 
                        key: 'logLevel', 
                        label: 'Log Level', 
                        description: 'Console logging verbosity',
                        value: 'info', 
                        options: [
                            { value: 'none', label: 'None' },
                            { value: 'error', label: 'Errors Only' },
                            { value: 'warn', label: 'Warnings & Errors' },
                            { value: 'info', label: 'Info & Above' },
                            { value: 'debug', label: 'Debug (All)' }
                        ]
                    },
                    { 
                        type: 'slider', 
                        key: 'maxMemoryUsage', 
                        label: 'Max Memory Usage', 
                        description: 'Maximum memory usage (MB)',
                        value: 512, 
                        min: 256, 
                        max: 2048, 
                        step: 128,
                        showValue: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'enableTelemetry', 
                        label: 'Anonymous Telemetry', 
                        description: 'Help improve the game with usage data',
                        value: true 
                    }
                ]
            }
        ];
        
        // Load saved settings
        this.loadSettings();
    }
    
    /**
     * Initialize particle system for background effects
     */
    initializeParticles() {
        this.particles = [];
        
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * 1920,
                y: Math.random() * 1080,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.3 + 0.1,
                color: ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][Math.floor(Math.random() * 6)],
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    /**
     * Update particle system
     */
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.pulsePhase += particle.pulseSpeed;
            
            // Wrap around screen
            if (particle.x < -10) particle.x = 1930;
            if (particle.x > 1930) particle.x = -10;
            if (particle.y < -10) particle.y = 1090;
            if (particle.y > 1090) particle.y = -10;
        });
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('coderunner_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                // Apply saved settings to categories
                this.settingsCategories.forEach(category => {
                    category.settings.forEach(setting => {
                        if (settings.hasOwnProperty(setting.key)) {
                            setting.value = settings[setting.key];
                        }
                    });
                });
                
                // Apply settings to game
                this.applySettingsToGame();
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            const settings = {};
            this.settingsCategories.forEach(category => {
                category.settings.forEach(setting => {
                    settings[setting.key] = setting.value;
                });
            });
            
            localStorage.setItem('coderunner_settings', JSON.stringify(settings));
            this.applySettingsToGame();
            
            // Show save confirmation
            this.showSaveConfirmation();
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }
    
    /**
     * Show save confirmation animation
     */
    showSaveConfirmation() {
        // This will be handled by the UI animation system
        this.saveConfirmationTime = Date.now();
    }
    
    /**
     * Export settings to clipboard
     */
    exportSettings() {
        try {
            const settings = {};
            this.settingsCategories.forEach(category => {
                category.settings.forEach(setting => {
                    settings[setting.key] = setting.value;
                });
            });
            
            const exportData = {
                version: '1.0',
                timestamp: Date.now(),
                settings: settings
            };
            
            navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
            return true;
        } catch (error) {
            console.warn('Failed to export settings:', error);
            return false;
        }
    }
    
    /**
     * Import settings from clipboard
     */
    async importSettings() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const importData = JSON.parse(clipboardText);
            
            if (importData.version && importData.settings) {
                // Apply imported settings
                this.settingsCategories.forEach(category => {
                    category.settings.forEach(setting => {
                        if (importData.settings.hasOwnProperty(setting.key)) {
                            setting.value = importData.settings[setting.key];
                        }
                    });
                });
                
                this.saveSettings();
                return true;
            }
        } catch (error) {
            console.warn('Failed to import settings:', error);
        }
        return false;
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        this.settingsCategories.forEach(category => {
            category.settings.forEach(setting => {
                // Reset to original default values
                switch (setting.key) {
                    case 'masterVolume': setting.value = 1.0; break;
                    case 'musicVolume': setting.value = 0.7; break;
                    case 'sfxVolume': setting.value = 0.8; break;
                    case 'graphicsQuality': setting.value = 'high'; break;
                    case 'difficulty': setting.value = 'normal'; break;
                    case 'gameSpeed': setting.value = 1.0; break;
                    case 'brightness': setting.value = 1.0; break;
                    case 'contrast': setting.value = 1.0; break;
                    case 'targetFPS': setting.value = 60; break;
                    case 'particleDensity': setting.value = 1.0; break;
                    case 'shakeIntensity': setting.value = 1.0; break;
                    case 'mouseSensitivity': setting.value = 1.0; break;
                    case 'keyRepeatDelay': setting.value = 200; break;
                    case 'autoSaveInterval': setting.value = 30; break;
                    case 'uiScale': setting.value = 1.0; break;
                    case 'fontSize': setting.value = 1.0; break;
                    case 'maxMemoryUsage': setting.value = 512; break;
                    default:
                        // Reset boolean values
                        if (typeof setting.value === 'boolean') {
                            setting.value = ['muteWhenUnfocused', 'showParticles', 'screenShake', 
                                           'showTutorialHints', 'autoSave', 'pauseOnFocusLoss', 
                                           'vsync', 'bloomEffect', 'enableTelemetry'].includes(setting.key);
                        }
                        break;
                }
            });
        });
        
        this.saveSettings();
    }
    
    /**
     * Apply settings to the game instance
     */
    applySettingsToGame() {
        if (!this.gameInstance) return;
        
        // Apply audio settings
        if (this.gameInstance.audioSystem) {
            const masterVol = this.getSettingValue('masterVolume');
            const musicVol = this.getSettingValue('musicVolume');
            const sfxVol = this.getSettingValue('sfxVolume');
            
            this.gameInstance.audioSystem.setMasterVolume(masterVol);
            this.gameInstance.audioSystem.setMusicVolume(musicVol);
            this.gameInstance.audioSystem.setSfxVolume(sfxVol);
        }
        
        // Apply graphics settings
        this.gameInstance.graphicsQuality = this.getSettingValue('graphicsQuality');
        this.gameInstance.showParticles = this.getSettingValue('showParticles');
        this.gameInstance.screenShake = this.getSettingValue('screenShake');
        this.gameInstance.brightness = this.getSettingValue('brightness');
        this.gameInstance.contrast = this.getSettingValue('contrast');
        this.gameInstance.targetFPS = this.getSettingValue('targetFPS');
        this.gameInstance.vsync = this.getSettingValue('vsync');
        this.gameInstance.particleDensity = this.getSettingValue('particleDensity');
        this.gameInstance.shakeIntensity = this.getSettingValue('shakeIntensity');
        this.gameInstance.bloomEffect = this.getSettingValue('bloomEffect');
        
        // Apply gameplay settings
        this.gameInstance.defaultDifficulty = this.getSettingValue('difficulty');
        this.gameInstance.gameSpeed = this.getSettingValue('gameSpeed');
        this.gameInstance.showTutorialHints = this.getSettingValue('showTutorialHints');
        this.gameInstance.autoSave = this.getSettingValue('autoSave');
        this.gameInstance.autoSaveInterval = this.getSettingValue('autoSaveInterval');
        this.gameInstance.pauseOnFocusLoss = this.getSettingValue('pauseOnFocusLoss');
        this.gameInstance.showFPS = this.getSettingValue('showFPS');
        this.gameInstance.showPerformanceStats = this.getSettingValue('showPerformanceStats');
        
        // Apply control settings
        this.gameInstance.mouseControls = this.getSettingValue('mouseControls');
        this.gameInstance.mouseSensitivity = this.getSettingValue('mouseSensitivity');
        this.gameInstance.invertMouse = this.getSettingValue('invertMouse');
        this.gameInstance.keyRepeatDelay = this.getSettingValue('keyRepeatDelay');
        
        // Apply accessibility settings
        this.gameInstance.highContrast = this.getSettingValue('highContrast');
        this.gameInstance.colorBlindSupport = this.getSettingValue('colorBlindSupport');
        this.gameInstance.colorBlindType = this.getSettingValue('colorBlindType');
        this.gameInstance.uiScale = this.getSettingValue('uiScale');
        this.gameInstance.reduceMotion = this.getSettingValue('reduceMotion');
        this.gameInstance.screenReader = this.getSettingValue('screenReader');
        this.gameInstance.fontSize = this.getSettingValue('fontSize');
        
        // Apply advanced settings
        this.gameInstance.debugMode = this.getSettingValue('debugMode');
        this.gameInstance.showHitboxes = this.getSettingValue('showHitboxes');
        this.gameInstance.showGrid = this.getSettingValue('showGrid');
        this.gameInstance.logLevel = this.getSettingValue('logLevel');
        this.gameInstance.maxMemoryUsage = this.getSettingValue('maxMemoryUsage');
        this.gameInstance.enableTelemetry = this.getSettingValue('enableTelemetry');
    }
    
    /**
     * Get setting value by key
     */
    getSettingValue(key) {
        for (const category of this.settingsCategories) {
            for (const setting of category.settings) {
                if (setting.key === key) {
                    return setting.value;
                }
            }
        }
        return null;
    }
    
    /**
     * Set setting value by key
     */
    setSettingValue(key, value) {
        for (const category of this.settingsCategories) {
            for (const setting of category.settings) {
                if (setting.key === key) {
                    setting.value = value;
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Filter settings by search term
     */
    filterSettings(searchTerm) {
        if (!searchTerm) return this.settingsCategories;
        
        const filtered = [];
        searchTerm = searchTerm.toLowerCase();
        
        this.settingsCategories.forEach(category => {
            const matchingSettings = category.settings.filter(setting => 
                setting.label.toLowerCase().includes(searchTerm) ||
                setting.description?.toLowerCase().includes(searchTerm) ||
                category.title.toLowerCase().includes(searchTerm)
            );
            
            if (matchingSettings.length > 0) {
                filtered.push({
                    ...category,
                    settings: matchingSettings
                });
            }
        });
        
        return filtered;
    }
    
    /**
     * Update animation state
     */
    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.animationTime += deltaTime * 0.001;
        
        if (this.slideInProgress < 1) {
            this.slideInProgress = Math.min(1, this.slideInProgress + deltaTime * 0.003);
        }
        
        if (this.sectionsAnimationProgress < 1) {
            this.sectionsAnimationProgress = Math.min(1, this.sectionsAnimationProgress + deltaTime * 0.002);
        }
        
        if (this.headerAnimationProgress < 1) {
            this.headerAnimationProgress = Math.min(1, this.headerAnimationProgress + deltaTime * 0.004);
        }
        
        // Update tooltip timer
        if (this.showTooltip) {
            this.tooltipTimer += deltaTime;
        } else {
            this.tooltipTimer = 0;
        }
        
        // Update particles
        this.updateParticles();
    }
    
    /**
     * Render the complete settings menu
     */
    render(ctx, width, height) {
        this.update();
        
        // Background with glassmorphism
        this.drawBackground(ctx, width, height);
        
        // Particles
        this.drawParticles(ctx, width, height);
        
        // Header with search and tabs
        this.drawHeader(ctx, width, height);
        
        // Settings sections
        const hitAreas = this.drawSettingsSection(ctx, width, height);
        
        // Control buttons (back, reset, import/export)
        hitAreas.push(...this.drawControlButtons(ctx, width, height));
        
        // Tooltip
        if (this.showTooltip && this.tooltipTimer > 500) {
            this.drawTooltip(ctx, width, height);
        }
        
        // Save confirmation
        if (this.saveConfirmationTime && Date.now() - this.saveConfirmationTime < 2000) {
            this.drawSaveConfirmation(ctx, width, height);
        }
        
        return hitAreas;
    }
    
    /**
     * Draw glassmorphism background
     */
    drawBackground(ctx, width, height) {
        const time = this.animationTime;
        
        // Base dark background
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
        gradient.addColorStop(0, `rgba(15, 23, 42, ${0.95 + Math.sin(time * 0.5) * 0.05})`);
        gradient.addColorStop(0.5, `rgba(30, 41, 59, ${0.9 + Math.cos(time * 0.3) * 0.1})`);
        gradient.addColorStop(1, `rgba(51, 65, 85, ${0.85 + Math.sin(time * 0.2) * 0.15})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Animated overlay gradients
        const overlay1 = ctx.createLinearGradient(0, 0, width, height);
        overlay1.addColorStop(0, `rgba(59, 130, 246, ${0.1 + Math.sin(time * 0.8) * 0.05})`);
        overlay1.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
        overlay1.addColorStop(1, `rgba(16, 185, 129, ${0.1 + Math.cos(time * 0.6) * 0.05})`);
        
        ctx.fillStyle = overlay1;
        ctx.fillRect(0, 0, width, height);
        
        // Moving light effects
        const lightX = width/2 + Math.sin(time * 0.3) * 200;
        const lightY = height/2 + Math.cos(time * 0.4) * 150;
        
        const lightGradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 300);
        lightGradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
        lightGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        lightGradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
        
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    /**
     * Draw floating particles
     */
    drawParticles(ctx, width, height) {
        this.particles.forEach(particle => {
            ctx.save();
            
            const pulseAlpha = particle.opacity + Math.sin(particle.pulsePhase) * 0.1;
            ctx.globalAlpha = pulseAlpha;
            
            // Draw particle with glow
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.size * 3;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    /**
     * Draw enhanced header with search and navigation
     */
    drawHeader(ctx, width, height) {
        const progress = this.headerAnimationProgress;
        const headerHeight = 120;
        
        ctx.save();
        ctx.globalAlpha = progress;
        
        // Header background with glassmorphism
        const headerGradient = ctx.createLinearGradient(0, 0, width, headerHeight);
        headerGradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
        headerGradient.addColorStop(1, 'rgba(30, 41, 59, 0.6)');
        
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, width, headerHeight);
        
        // Header border
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, headerHeight);
        ctx.lineTo(width, headerHeight);
        ctx.stroke();
        
        // Title with enhanced styling
        const titleY = 35 + (1 - progress) * -20;
        
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText('⚙️ Settings', width / 2, titleY);
        
        // Subtitle
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
        ctx.shadowBlur = 10;
        ctx.fillText('Customize your CodeRunner experience', width / 2, titleY + 35);
        
        // Category tabs
        this.drawCategoryTabs(ctx, width, headerHeight);
        
        ctx.restore();
    }
    
    
    /**
     * Draw category tabs
     */
    drawCategoryTabs(ctx, width, headerHeight) {
        const tabY = headerHeight - 35;
        const tabHeight = 30;
        const tabSpacing = 10;
        const totalTabWidth = this.settingsCategories.length * 120 + (this.settingsCategories.length - 1) * tabSpacing;
        let tabX = (width - totalTabWidth) / 2;
        
        this.settingsCategories.forEach((category, index) => {
            const isActive = this.activeTab === index;
            const tabWidth = 120;
            
            // Tab background
            if (isActive) {
                ctx.fillStyle = category.color + '40';
                ctx.strokeStyle = category.color;
                ctx.lineWidth = 2;
            } else {
                ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
                ctx.lineWidth = 1;
            }
            
            this.drawRoundedRect(ctx, tabX, tabY, tabWidth, tabHeight, 15);
            ctx.stroke();
            
            // Tab text
            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'center';
            ctx.fillText(category.icon + ' ' + category.title, tabX + tabWidth / 2, tabY + 20);
            
            tabX += tabWidth + tabSpacing;
        });
    }
    
    /**
     * Draw enhanced settings sections with glassmorphism
     */
    drawSettingsSection(ctx, width, height) {
        const hitAreas = [];
        const sectionWidth = Math.min(800, width * 0.9);
        const sectionX = (width - sectionWidth) / 2;
        let currentY = 150;
        
        const progress = this.sectionsAnimationProgress;
        const categoriesToShow = this.activeTab !== undefined ? 
            [this.settingsCategories[this.activeTab]] : 
            this.filterSettings(this.searchFilter);
        
        categoriesToShow.forEach((category, categoryIndex) => {
            const categoryProgress = Math.max(0, Math.min(1, (progress - categoryIndex * 0.1) / 0.9));
            if (categoryProgress <= 0) return;
            
            ctx.save();
            ctx.globalAlpha = categoryProgress;
            
            // Category container with glassmorphism
            const containerHeight = 60 + category.settings.length * 70 + 20;
            const containerY = currentY + (1 - categoryProgress) * 30;
            
            // Container background
            const containerGradient = ctx.createLinearGradient(sectionX, containerY, sectionX + sectionWidth, containerY + containerHeight);
            containerGradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
            containerGradient.addColorStop(1, 'rgba(30, 41, 59, 0.2)');
            
            ctx.fillStyle = containerGradient;
            this.drawRoundedRect(ctx, sectionX, containerY, sectionWidth, containerHeight, 16);
            
            // Container border with category color
            ctx.strokeStyle = category.color + '60';
            ctx.lineWidth = 2;
            this.strokeRoundedRect(ctx, sectionX, containerY, sectionWidth, containerHeight, 16);
            
            // Category header
            const headerHeight = 60;
            const headerY = containerY;
            
            // Header background
            const headerGradient = ctx.createLinearGradient(sectionX, headerY, sectionX + sectionWidth, headerY + headerHeight);
            headerGradient.addColorStop(0, category.color + '30');
            headerGradient.addColorStop(1, category.color + '10');
            
            ctx.fillStyle = headerGradient;
            this.drawRoundedRect(ctx, sectionX, headerY, sectionWidth, headerHeight, 16);
            
            // Header text
            ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.shadowColor = category.color;
            ctx.shadowBlur = 10;
            ctx.fillText(category.icon + ' ' + category.title, sectionX + 25, headerY + 35);
            
            // Category description
            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 5;
            ctx.fillText(category.description || '', sectionX + 25, headerY + 52);
            
            let settingY = headerY + headerHeight + 10;
            
            // Category settings
            category.settings.forEach((setting, settingIndex) => {
                const settingHeight = 60;
                
                // Setting container
                const isHovered = this.hoveredItem === `${categoryIndex}-${settingIndex}`;
                const settingBg = isHovered ? 'rgba(71, 85, 105, 0.6)' : 'rgba(51, 65, 85, 0.3)';
                
                ctx.fillStyle = settingBg;
                this.drawRoundedRect(ctx, sectionX + 15, settingY, sectionWidth - 30, settingHeight, 12);
                
                if (isHovered) {
                    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                    ctx.lineWidth = 1;
                    this.strokeRoundedRect(ctx, sectionX + 15, settingY, sectionWidth - 30, settingHeight, 12);
                }
                
                // Setting label
                ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 0;
                ctx.fillText(setting.label, sectionX + 30, settingY + 25);
                
                // Setting description
                if (setting.description) {
                    ctx.font = '12px "Segoe UI", Arial, sans-serif';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.fillText(setting.description, sectionX + 30, settingY + 43);
                }
                
                // Setting control
                const controlX = sectionX + sectionWidth - 250;
                const controlArea = this.drawEnhancedSettingControl(ctx, setting, controlX, settingY, 220, settingHeight);
                
                if (controlArea) {
                    controlArea.settingId = `${categoryIndex}-${settingIndex}`;
                    controlArea.setting = setting;
                    controlArea.category = category;
                    hitAreas.push(controlArea);
                }
                
                settingY += settingHeight + 10;
            });
            
            currentY = settingY + 30;
            ctx.restore();
        });
        
        return hitAreas;
    }
    
    
    /**
     * Draw enhanced setting control with improved visuals
     */
    drawEnhancedSettingControl(ctx, setting, x, y, width, height) {
        const controlY = y + height / 2;
        
        switch (setting.type) {
            case 'toggle':
                return this.drawEnhancedToggle(ctx, setting, x + width - 80, controlY, setting.value);
                
            case 'slider':
                return this.drawEnhancedSlider(ctx, setting, x, controlY, width - 20, setting.value, setting.min, setting.max);
                
            case 'dropdown':
                return this.drawEnhancedDropdown(ctx, setting, x, y + 10, width - 20, height - 20, setting.value, setting.options);
                
            case 'key':
                return this.drawEnhancedKeyBind(ctx, setting, x, y + 10, width - 20, height - 20, setting.value);
        }
        
        return null;
    }
    
    /**
     * Draw enhanced toggle switch with animations
     */
    drawEnhancedToggle(ctx, setting, x, y, value) {
        const toggleWidth = 60;
        const toggleHeight = 30;
        const toggleY = y - toggleHeight / 2;
        
        // Background with glassmorphism
        const bgColor = value ? '#22c55e' : '#6b7280';
        const gradient = ctx.createLinearGradient(x, toggleY, x, toggleY + toggleHeight);
        gradient.addColorStop(0, bgColor + 'CC');
        gradient.addColorStop(1, bgColor + '88');
        
        ctx.fillStyle = gradient;
        this.drawRoundedRect(ctx, x, toggleY, toggleWidth, toggleHeight, toggleHeight / 2);
        
        // Border glow
        ctx.strokeStyle = value ? '#22c55e' : '#6b7280';
        ctx.lineWidth = 2;
        ctx.shadowColor = value ? '#22c55e' : '#6b7280';
        ctx.shadowBlur = 8;
        this.strokeRoundedRect(ctx, x, toggleY, toggleWidth, toggleHeight, toggleHeight / 2);
        ctx.shadowBlur = 0;
        
        // Switch knob
        const switchSize = toggleHeight - 6;
        const switchX = value ? x + toggleWidth - switchSize - 3 : x + 3;
        const switchY = toggleY + 3;
        
        // Knob gradient
        const knobGradient = ctx.createRadialGradient(
            switchX + switchSize/2, switchY + switchSize/2, 0,
            switchX + switchSize/2, switchY + switchSize/2, switchSize/2
        );
        knobGradient.addColorStop(0, '#ffffff');
        knobGradient.addColorStop(1, '#f1f5f9');
        
        ctx.fillStyle = knobGradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.arc(switchX + switchSize / 2, switchY + switchSize / 2, switchSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        return {
            x: x,
            y: toggleY,
            width: toggleWidth,
            height: toggleHeight,
            action: 'toggle'
        };
    }
    
    /**
     * Draw enhanced slider with real-time value display
     */
    drawEnhancedSlider(ctx, setting, x, y, width, value, min, max) {
        const sliderHeight = 6;
        const sliderY = y - sliderHeight / 2;
        const handleSize = 20;
        
        // Track background
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        this.drawRoundedRect(ctx, x, sliderY, width, sliderHeight, sliderHeight / 2);
        
        // Progress track
        const progress = (value - min) / (max - min);
        const progressWidth = width * progress;
        
        const progressGradient = ctx.createLinearGradient(x, sliderY, x + progressWidth, sliderY);
        progressGradient.addColorStop(0, '#3b82f6');
        progressGradient.addColorStop(1, '#1d4ed8');
        
        ctx.fillStyle = progressGradient;
        this.drawRoundedRect(ctx, x, sliderY, progressWidth, sliderHeight, sliderHeight / 2);
        
        // Handle
        const handleX = x + progressWidth - handleSize / 2;
        const handleY = y - handleSize / 2;
        
        // Handle glow
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        
        // Handle background
        const handleGradient = ctx.createRadialGradient(
            x + progressWidth, y, 0,
            x + progressWidth, y, handleSize / 2
        );
        handleGradient.addColorStop(0, '#ffffff');
        handleGradient.addColorStop(1, '#e2e8f0');
        
        ctx.fillStyle = handleGradient;
        ctx.beginPath();
        ctx.arc(x + progressWidth, y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Value display
        let displayValue = value;
        let suffix = '';
        
        if (setting.showPercentage) {
            displayValue = Math.round(value * 100);
            suffix = '%';
        } else if (setting.showMultiplier) {
            displayValue = value.toFixed(1);
            suffix = 'x';
        } else if (setting.showValue) {
            displayValue = Math.round(value);
        } else {
            displayValue = Math.round(value * 100) / 100;
        }
        
        ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(displayValue + suffix, x + progressWidth, y - 25);
        
        return {
            x: x,
            y: sliderY,
            width: width,
            height: handleSize,
            action: 'slider'
        };
    }
    
    
    /**
     * Draw enhanced dropdown with better styling
     */
    drawEnhancedDropdown(ctx, setting, x, y, width, height, value, options) {
        // Background with glassmorphism
        const bgGradient = ctx.createLinearGradient(x, y, x, y + height);
        bgGradient.addColorStop(0, 'rgba(51, 65, 85, 0.9)');
        bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.7)');
        
        ctx.fillStyle = bgGradient;
        this.drawRoundedRect(ctx, x, y, width, height, 8);
        
        // Border with glow
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = 4;
        this.strokeRoundedRect(ctx, x, y, width, height, 8);
        ctx.shadowBlur = 0;
        
        // Text
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        
        // Find option label
        let displayText = value;
        if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object') {
            const option = options.find(opt => opt.value === value);
            displayText = option ? option.label : value;
        } else {
            displayText = value.charAt(0).toUpperCase() + value.slice(1);
        }
        
        ctx.fillText(displayText, x + 12, y + height / 2 + 5);
        
        // Arrow with animation
        const arrowX = x + width - 20;
        const arrowY = y + height / 2;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrowX - 4, arrowY - 2);
        ctx.lineTo(arrowX, arrowY + 2);
        ctx.lineTo(arrowX + 4, arrowY - 2);
        ctx.stroke();
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            action: 'dropdown'
        };
    }
    
    /**
     * Draw enhanced key binding control
     */
    drawEnhancedKeyBind(ctx, setting, x, y, width, height, value) {
        const isCapturing = this.isKeyCapturing && this.keyCaptureSetting === setting;
        
        // Background with special effect for capturing
        let bgGradient;
        if (isCapturing) {
            bgGradient = ctx.createLinearGradient(x, y, x, y + height);
            bgGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            bgGradient.addColorStop(1, 'rgba(185, 28, 28, 0.2)');
        } else {
            bgGradient = ctx.createLinearGradient(x, y, x, y + height);
            bgGradient.addColorStop(0, 'rgba(51, 65, 85, 0.9)');
            bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.7)');
        }
        
        ctx.fillStyle = bgGradient;
        this.drawRoundedRect(ctx, x, y, width, height, 8);
        
        // Border
        ctx.strokeStyle = isCapturing ? 'rgba(239, 68, 68, 0.8)' : 'rgba(100, 116, 139, 0.6)';
        ctx.lineWidth = isCapturing ? 2 : 1;
        if (isCapturing) {
            ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
            ctx.shadowBlur = 8;
        }
        this.strokeRoundedRect(ctx, x, y, width, height, 8);
        ctx.shadowBlur = 0;
        
        // Key text
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = isCapturing ? '#fef2f2' : '#ffffff';
        ctx.textAlign = 'center';
        
        const displayText = isCapturing ? 'Press key...' : value;
        ctx.fillText(displayText, x + width / 2, y + height / 2 + 5);
        
        return {
            x: x,
            y: y,
            width: width,
            height: height,
            action: 'keybind'
        };
    }
    
    /**
     * Draw control buttons (back, reset, import/export)
     */
    drawControlButtons(ctx, width, height) {
        const hitAreas = [];
        const buttonHeight = 45;
        const buttonSpacing = 15;
        const bottomMargin = 30;
        
        // Calculate positions
        const backButton = { x: 50, y: height - bottomMargin - buttonHeight, width: 120, text: '← Back', action: 'back', color: '#6b7280' };
        const resetButton = { x: 200, y: height - bottomMargin - buttonHeight, width: 140, text: '🔄 Reset All', action: 'reset', color: '#ef4444' };
        const exportButton = { x: width - 280, y: height - bottomMargin - buttonHeight, width: 120, text: '📤 Export', action: 'export', color: '#8b5cf6' };
        const importButton = { x: width - 140, y: height - bottomMargin - buttonHeight, width: 120, text: '📥 Import', action: 'import', color: '#10b981' };
        
        const buttons = [backButton, resetButton, exportButton, importButton];
        
        buttons.forEach(button => {
            const isHovered = this.hoveredItem === button.action;
            
            // Button background with glassmorphism
            const bgGradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + buttonHeight);
            if (isHovered) {
                bgGradient.addColorStop(0, button.color + 'CC');
                bgGradient.addColorStop(1, button.color + '88');
            } else {
                bgGradient.addColorStop(0, 'rgba(51, 65, 85, 0.8)');
                bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.6)');
            }
            
            ctx.fillStyle = bgGradient;
            this.drawRoundedRect(ctx, button.x, button.y, button.width, buttonHeight, 12);
            
            // Button border
            ctx.strokeStyle = isHovered ? button.color : 'rgba(100, 116, 139, 0.5)';
            ctx.lineWidth = isHovered ? 2 : 1;
            if (isHovered) {
                ctx.shadowColor = button.color;
                ctx.shadowBlur = 8;
            }
            this.strokeRoundedRect(ctx, button.x, button.y, button.width, buttonHeight, 12);
            ctx.shadowBlur = 0;
            
            // Button text
            ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
            ctx.textAlign = 'center';
            ctx.fillText(button.text, button.x + button.width / 2, button.y + buttonHeight / 2 + 5);
            
            hitAreas.push({
                x: button.x,
                y: button.y,
                width: button.width,
                height: buttonHeight,
                action: button.action
            });
        });
        
        return hitAreas;
    }
    
    /**
     * Draw tooltip for hovered setting
     */
    drawTooltip(ctx, width, height) {
        if (!this.showTooltip || !this.showTooltip.description) return;
        
        const tooltip = this.showTooltip;
        const maxWidth = 300;
        const padding = 15;
        const cornerRadius = 8;
        
        // Measure text
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        const lines = this.wrapText(ctx, tooltip.description, maxWidth - padding * 2);
        const lineHeight = 18;
        const tooltipHeight = lines.length * lineHeight + padding * 2;
        
        // Position tooltip (avoid edges)
        let tooltipX = tooltip.x + tooltip.width + 15;
        let tooltipY = tooltip.y;
        
        if (tooltipX + maxWidth > width - 20) {
            tooltipX = tooltip.x - maxWidth - 15;
        }
        if (tooltipY + tooltipHeight > height - 20) {
            tooltipY = height - tooltipHeight - 20;
        }
        
        // Background with glassmorphism
        const bgGradient = ctx.createLinearGradient(tooltipX, tooltipY, tooltipX, tooltipY + tooltipHeight);
        bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
        
        ctx.fillStyle = bgGradient;
        this.drawRoundedRect(ctx, tooltipX, tooltipY, maxWidth, tooltipHeight, cornerRadius);
        
        // Border
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = 8;
        this.strokeRoundedRect(ctx, tooltipX, tooltipY, maxWidth, tooltipHeight, cornerRadius);
        ctx.shadowBlur = 0;
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        lines.forEach((line, index) => {
            ctx.fillText(line, tooltipX + padding, tooltipY + padding + (index + 1) * lineHeight);
        });
    }
    
    /**
     * Draw save confirmation animation
     */
    drawSaveConfirmation(ctx, width, height) {
        const elapsed = Date.now() - this.saveConfirmationTime;
        const duration = 2000;
        const progress = elapsed / duration;
        
        if (progress >= 1) return;
        
        // Fade animation
        const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Notification background
        const notifWidth = 250;
        const notifHeight = 60;
        const notifX = width - notifWidth - 30;
        const notifY = 30;
        
        const bgGradient = ctx.createLinearGradient(notifX, notifY, notifX, notifY + notifHeight);
        bgGradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
        bgGradient.addColorStop(1, 'rgba(21, 128, 61, 0.8)');
        
        ctx.fillStyle = bgGradient;
        this.drawRoundedRect(ctx, notifX, notifY, notifWidth, notifHeight, 12);
        
        // Border
        ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
        ctx.shadowBlur = 10;
        this.strokeRoundedRect(ctx, notifX, notifY, notifWidth, notifHeight, 12);
        ctx.shadowBlur = 0;
        
        // Text
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('✅ Settings Saved!', notifX + notifWidth / 2, notifY + notifHeight / 2 + 5);
        
        ctx.restore();
    }
    
    
    /**
     * Utility: Wrap text to fit within specified width
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
    
    /**
     * Enhanced mouse movement handling with tooltip system
     */
    handleMouseMove(x, y, hitAreas) {
        let newHoveredItem = null;
        let newTooltip = null;
        
        for (const area of hitAreas) {
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                newHoveredItem = area.settingId || area.action;
                
                // Set tooltip for settings
                if (area.setting && area.setting.description) {
                    newTooltip = {
                        description: area.setting.description,
                        x: area.x,
                        y: area.y,
                        width: area.width,
                        height: area.height
                    };
                }
                break;
            }
        }
        
        // Play hover sound on new hover
        if (newHoveredItem !== this.hoveredItem && newHoveredItem !== null) {
            if (this.gameInstance?.audioSystem) {
                this.gameInstance.audioSystem.onMenuHover();
            }
        }
        
        this.hoveredItem = newHoveredItem;
        this.showTooltip = newTooltip;
    }
    
    /**
     * Enhanced click handling with support for all new features
     */
    handleClick(x, y, hitAreas) {
        for (const area of hitAreas) {
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                
                if (this.gameInstance?.audioSystem) {
                    this.gameInstance.audioSystem.onMenuClick();
                }
                
                // Handle control buttons
                if (area.action === 'back') {
                    return 'back';
                } else if (area.action === 'reset') {
                    this.resetSettings();
                    return null;
                } else if (area.action === 'export') {
                    this.exportSettings();
                    return null;
                } else if (area.action === 'import') {
                    this.importSettings();
                    return null;
                }
                
                // Handle setting controls
                if (area.setting) {
                    this.handleEnhancedSettingClick(area.setting, area.action, x - area.x);
                    this.saveSettings();
                }
                
                return null;
            }
        }
        return null;
    }
    
    /**
     * Enhanced setting click handling with live preview
     */
    handleEnhancedSettingClick(setting, action, relativeX) {
        const oldValue = setting.value;
        
        switch (action) {
            case 'toggle':
                setting.value = !setting.value;
                break;
                
            case 'slider':
                const progress = Math.max(0, Math.min(1, relativeX / 200)); // Assuming slider width of 200
                setting.value = setting.min + (setting.max - setting.min) * progress;
                setting.value = Math.round(setting.value / (setting.step || 0.1)) * (setting.step || 0.1);
                break;
                
            case 'dropdown':
                const options = setting.options;
                if (Array.isArray(options) && options.length > 0) {
                    if (typeof options[0] === 'object') {
                        const currentIndex = options.findIndex(opt => opt.value === setting.value);
                        const nextIndex = (currentIndex + 1) % options.length;
                        setting.value = options[nextIndex].value;
                    } else {
                        const currentIndex = options.indexOf(setting.value);
                        const nextIndex = (currentIndex + 1) % options.length;
                        setting.value = options[nextIndex];
                    }
                }
                break;
                
            case 'keybind':
                this.startKeyCapture(setting);
                break;
        }
        
        // Apply live preview for certain settings
        if (setting.live && this.gameInstance) {
            this.applyLiveSetting(setting);
        }
    }
    
    /**
     * Apply live setting changes for immediate feedback
     */
    applyLiveSetting(setting) {
        if (!this.gameInstance) return;
        
        switch (setting.key) {
            case 'masterVolume':
            case 'musicVolume':
            case 'sfxVolume':
                if (this.gameInstance.audioSystem) {
                    this.gameInstance.audioSystem.setMasterVolume(this.getSettingValue('masterVolume'));
                    this.gameInstance.audioSystem.setMusicVolume(this.getSettingValue('musicVolume'));
                    this.gameInstance.audioSystem.setSfxVolume(this.getSettingValue('sfxVolume'));
                }
                break;
            case 'brightness':
                this.gameInstance.brightness = setting.value;
                break;
            case 'contrast':
                this.gameInstance.contrast = setting.value;
                break;
        }
    }
    
    /**
     * Start key capture for key binding
     */
    startKeyCapture(setting) {
        this.isKeyCapturing = true;
        this.keyCaptureSetting = setting;
        
        // Add event listener for key capture
        const handleKeyCapture = (event) => {
            event.preventDefault();
            
            let keyName = event.key;
            
            // Handle special keys
            if (event.key === ' ') keyName = 'Space';
            else if (event.key === 'Escape') keyName = 'Escape';
            else if (event.key === 'Enter') keyName = 'Enter';
            else if (event.key === 'Tab') keyName = 'Tab';
            else if (event.key === 'Shift') keyName = 'Shift';
            else if (event.key === 'Control') keyName = 'Ctrl';
            else if (event.key === 'Alt') keyName = 'Alt';
            else if (event.key.startsWith('Arrow')) keyName = event.key;
            else if (event.key.startsWith('F') && event.key.length <= 3) keyName = event.key;
            
            setting.value = keyName;
            this.isKeyCapturing = false;
            this.keyCaptureSetting = null;
            
            // Remove event listener
            document.removeEventListener('keydown', handleKeyCapture);
            
            this.saveSettings();
        };
        
        document.addEventListener('keydown', handleKeyCapture);
    }
    
    /**
     * Handle scroll for navigating through settings
     */
    handleScroll(deltaY) {
        this.scrollOffset = Math.max(0, this.scrollOffset + deltaY);
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyDown(key) {
        if (this.isKeyCapturing) return; // Don't handle navigation during key capture
        
        switch (key) {
            case 'Escape':
                return 'back';
            case 'Tab':
                // Navigate between tabs
                this.activeTab = (this.activeTab + 1) % this.settingsCategories.length;
                break;
            case 'F5':
                // Reset current category
                this.resetCategory(this.activeTab);
                break;
        }
        
        return null;
    }
    
    /**
     * Reset specific category to defaults
     */
    resetCategory(categoryIndex) {
        if (categoryIndex < 0 || categoryIndex >= this.settingsCategories.length) return;
        
        const category = this.settingsCategories[categoryIndex];
        category.settings.forEach(setting => {
            // Reset to defaults based on setting key
            this.resetSingleSetting(setting);
        });
        
        this.saveSettings();
    }
    
    /**
     * Reset single setting to default
     */
    resetSingleSetting(setting) {
        switch (setting.key) {
            case 'masterVolume': setting.value = 1.0; break;
            case 'musicVolume': setting.value = 0.7; break;
            case 'sfxVolume': setting.value = 0.8; break;
            // Add more defaults as needed
            default:
                if (typeof setting.value === 'boolean') {
                    setting.value = ['muteWhenUnfocused', 'showParticles', 'screenShake', 
                                   'showTutorialHints', 'autoSave', 'pauseOnFocusLoss'].includes(setting.key);
                }
                break;
        }
    }
    
    /**
     * Search settings
     */
    searchSettings(searchTerm) {
        this.searchFilter = searchTerm;
        this.activeTab = undefined; // Show all when searching
    }
    
    /**
     * Reset animations for smooth transitions
     */
    resetAnimations() {
        this.animationTime = 0;
        this.slideInProgress = 0;
        this.sectionsAnimationProgress = 0;
        this.headerAnimationProgress = 0;
        this.hoveredItem = null;
        this.showTooltip = null;
        this.tooltipTimer = 0;
        this.lastFrameTime = Date.now();
        this.activeTab = 0;
        this.searchFilter = '';
        this.isKeyCapturing = false;
        this.keyCaptureSetting = null;
    }
    
    /**
     * Helper: Draw rounded rectangle
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
        ctx.fill();
    }
    
    /**
     * Helper: Stroke rounded rectangle
     */
    strokeRoundedRect(ctx, x, y, width, height, radius) {
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
        ctx.stroke();
    }
}
