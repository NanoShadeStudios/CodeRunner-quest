/**
 * Enhanced Settings System - Streamlined with only functional settings
 * Provides a modern, beautiful, and functional settings interface
 * 
 * Features:
 * - Modern glassmorphism UI with animated particles
 * - Category-based organization
 * - Live previews and tooltips
 * - Import/export functionality
 * - Only includes settings that are actually implemented in the game
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
        
        // Settings categories - streamlined with only functional settings
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
                        type: 'toggle', 
                        key: 'muteWhenUnfocused', 
                        label: 'Mute When Unfocused', 
                        description: 'Automatically mute when window loses focus',
                        value: true 
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
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' }
                        ]
                    },
                    { 
                        type: 'toggle', 
                        key: 'showParticles', 
                        label: 'Particle Effects', 
                        description: 'Visual particle effects',
                        value: true 
                    },
                    { 
                        type: 'toggle', 
                        key: 'screenShake', 
                        label: 'Screen Shake', 
                        description: 'Camera shake effects',
                        value: true 
                    },
                    { 
                        type: 'toggle', 
                        key: 'showFPS', 
                        label: 'Show FPS Counter', 
                        description: 'Display frames per second in-game',
                        value: false 
                    }
                ]
            },
            {
                title: 'Gameplay',
                icon: '🎮',
                color: '#8b5cf6',
                description: 'Game mechanics and features',
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
                            { value: 'nightmare', label: 'Nightmare' }
                        ]
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
                        type: 'toggle', 
                        key: 'pauseOnFocusLoss', 
                        label: 'Pause on Focus Loss', 
                        description: 'Automatically pause when window loses focus',
                        value: true 
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
                        type: 'slider', 
                        key: 'uiScale', 
                        label: 'UI Scale', 
                        description: 'Scale of user interface elements',
                        value: 1.0, 
                        min: 0.75, 
                        max: 1.5, 
                        step: 0.25,
                        showMultiplier: true
                    },
                    { 
                        type: 'toggle', 
                        key: 'reduceMotion', 
                        label: 'Reduce Motion', 
                        description: 'Minimize animations and effects',
                        value: false 
                    }
                ]
            },
            {
                title: 'Advanced',
                icon: '⚙️',
                color: '#ef4444',
                description: 'Debug and advanced options',
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
                color: ['#22c55e', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'][Math.floor(Math.random() * 5)],
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
            const saved = localStorage.getItem('coderunner_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settingsCategories.forEach(category => {
                    category.settings.forEach(setting => {
                        if (settings.hasOwnProperty(setting.key)) {
                            setting.value = settings[setting.key];
                        }
                    });
                });
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
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
            this.showSaveConfirmation();
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }
    
    /**
     * Show save confirmation animation
     */
    showSaveConfirmation() {
        this.saveConfirmation = true;
        setTimeout(() => {
            this.saveConfirmation = false;
        }, 2000);
    }
    
    /**
     * Export settings to clipboard
     */
    exportSettings() {
        const settings = {};
        this.settingsCategories.forEach(category => {
            category.settings.forEach(setting => {
                settings[setting.key] = setting.value;
            });
        });
        
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            settings: settings
        };
        
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
            .then(() => console.log('Settings exported to clipboard'))
            .catch(e => console.warn('Failed to export settings:', e));
    }
    
    /**
     * Import settings from clipboard
     */
    async importSettings() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const importData = JSON.parse(clipboardText);
            
            if (importData.settings) {
                this.settingsCategories.forEach(category => {
                    category.settings.forEach(setting => {
                        if (importData.settings.hasOwnProperty(setting.key)) {
                            setting.value = importData.settings[setting.key];
                        }
                    });
                });
                this.saveSettings();
                console.log('Settings imported successfully');
            }
        } catch (e) {
            console.warn('Failed to import settings:', e);
        }
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
                    case 'uiScale': setting.value = 1.0; break;
                    default:
                        // Reset boolean values
                        if (typeof setting.value === 'boolean') {
                            setting.value = ['muteWhenUnfocused', 'showParticles', 'screenShake', 
                                           'showTutorialHints', 'autoSave', 'pauseOnFocusLoss'].includes(setting.key);
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
        this.gameInstance.showFPS = this.getSettingValue('showFPS');
        
        // Apply gameplay settings
        this.gameInstance.defaultDifficulty = this.getSettingValue('difficulty');
        this.gameInstance.showTutorialHints = this.getSettingValue('showTutorialHints');
        this.gameInstance.autoSave = this.getSettingValue('autoSave');
        this.gameInstance.pauseOnFocusLoss = this.getSettingValue('pauseOnFocusLoss');
        
        // Apply accessibility settings
        this.gameInstance.highContrast = this.getSettingValue('highContrast');
        this.gameInstance.uiScale = this.getSettingValue('uiScale');
        this.gameInstance.reduceMotion = this.getSettingValue('reduceMotion');
        
        // Apply advanced settings
        this.gameInstance.debugMode = this.getSettingValue('debugMode');
        this.gameInstance.showHitboxes = this.getSettingValue('showHitboxes');
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
                    
                    // Apply live setting if needed
                    if (setting.live) {
                        this.applyLiveSetting(setting);
                    }
                    
                    this.saveSettings();
                    return;
                }
            }
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
        }
    }
    
    /**
     * Modern glassmorphism UI rendering
     */
    render(ctx, canvas, hitAreas = []) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Update animations
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.animationTime += deltaTime * 0.001;
        this.slideInProgress = Math.min(1, this.slideInProgress + deltaTime * 0.003);
        this.sectionsAnimationProgress = Math.min(1, this.sectionsAnimationProgress + deltaTime * 0.002);
        this.headerAnimationProgress = Math.min(1, this.headerAnimationProgress + deltaTime * 0.004);
        
        // Update particles
        this.updateParticles();
        
        // Clear hit areas
        hitAreas.length = 0;
        
        ctx.save();
        
        // Background with animated gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `rgba(13, 17, 23, ${0.85 + 0.1 * Math.sin(this.animationTime * 0.5)})`);
        gradient.addColorStop(1, `rgba(21, 32, 43, ${0.9 + 0.05 * Math.cos(this.animationTime * 0.3)})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Animated particles background
        ctx.globalAlpha = 0.6;
        this.particles.forEach(particle => {
            const pulse = Math.sin(particle.pulsePhase) * 0.5 + 0.5;
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity * pulse * 0.4;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * (0.5 + pulse * 0.5), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Main container with glassmorphism effect
        const containerPadding = 60;
        const containerX = containerPadding;
        const containerY = containerPadding;
        const containerWidth = width - containerPadding * 2;
        const containerHeight = height - containerPadding * 2;
        
        // Glassmorphism container
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.filter = 'blur(0px)';
        this.roundRect(ctx, containerX, containerY, containerWidth, containerHeight, 20);
        ctx.fill();
        
        // Container border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Header with slide-in animation
        const headerY = containerY + 20 + (1 - this.headerAnimationProgress) * -50;
        ctx.globalAlpha = this.headerAnimationProgress;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Settings', width / 2, headerY + 36);
        
        ctx.font = '16px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Configure your game experience', width / 2, headerY + 60);
        
        ctx.globalAlpha = 1;
        
        // Category tabs
        const tabsY = headerY + 100;
        const tabWidth = Math.min(150, containerWidth / this.settingsCategories.length - 20);
        const tabHeight = 50;
        const tabSpacing = 10;
        const totalTabsWidth = this.settingsCategories.length * tabWidth + (this.settingsCategories.length - 1) * tabSpacing;
        const tabsStartX = width / 2 - totalTabsWidth / 2;
        
        this.settingsCategories.forEach((category, index) => {
            const tabX = tabsStartX + index * (tabWidth + tabSpacing);
            const isActive = this.activeTab === index;
            const isHovered = this.hoveredItem === `tab_${index}`;
            
            // Tab background with enhanced animations
            ctx.fillStyle = isActive 
                ? `${category.color}AA` 
                : isHovered 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)';
            
            this.roundRect(ctx, tabX, tabsY, tabWidth, tabHeight, 12);
            ctx.fill();
            
            // Tab border
            if (isActive) {
                ctx.strokeStyle = category.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // Tab content
            ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px "SF Pro Display", -apple-system, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(category.icon, tabX + tabWidth / 2, tabsY + 20);
            ctx.font = '12px "SF Pro Display", -apple-system, system-ui, sans-serif';
            ctx.fillText(category.title, tabX + tabWidth / 2, tabsY + 36);
            
            // Add hit area
            hitAreas.push({
                x: tabX,
                y: tabsY,
                width: tabWidth,
                height: tabHeight,
                action: 'tab',
                tab: index
            });
        });
        
        // Settings content area
        const contentY = tabsY + tabHeight + 30;
        const contentHeight = containerY + containerHeight - contentY - 80;
        
        if (this.activeTab < this.settingsCategories.length) {
            this.renderSettingsContent(ctx, containerX + 20, contentY, containerWidth - 40, contentHeight, hitAreas);
        }
        
        // Control buttons
        this.renderControlButtons(ctx, containerX, containerY + containerHeight - 60, containerWidth, hitAreas);
        
        // Tooltip
        if (this.showTooltip) {
            this.renderTooltip(ctx, this.showTooltip);
        }
        
        // Save confirmation
        if (this.saveConfirmation) {
            this.renderSaveConfirmation(ctx, width, height);
        }
        
        ctx.restore();
    }
    
    /**
     * Render settings content for active category
     */
    renderSettingsContent(ctx, x, y, width, height, hitAreas) {
        const category = this.settingsCategories[this.activeTab];
        if (!category) return;
        
        ctx.save();
        
        // Category header
        ctx.fillStyle = category.color;
        ctx.font = 'bold 24px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${category.icon} ${category.title}`, x, y + 24);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.fillText(category.description, x, y + 48);
        
        // Settings list
        let currentY = y + 80;
        const settingHeight = 80;
        const settingSpacing = 20;
        
        category.settings.forEach((setting, index) => {
            if (currentY + settingHeight > y + height) return; // Skip if outside bounds
            
            const animationProgress = Math.min(1, (this.sectionsAnimationProgress - index * 0.1));
            if (animationProgress <= 0) return;
            
            ctx.globalAlpha = animationProgress;
            
            const settingX = x + (1 - animationProgress) * 30;
            const isHovered = this.hoveredItem === `setting_${this.activeTab}_${index}`;
            
            // Setting background
            ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)';
            this.roundRect(ctx, settingX, currentY, width - (settingX - x), settingHeight - 10, 12);
            ctx.fill();
            
            // Setting label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px "SF Pro Display", -apple-system, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(setting.label, settingX + 20, currentY + 25);
            
            // Setting description
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px "SF Pro Display", -apple-system, system-ui, sans-serif';
            ctx.fillText(setting.description, settingX + 20, currentY + 44);
            
            // Setting control
            this.renderSettingControl(ctx, setting, settingX + width - 250, currentY + 15, 200, 50, hitAreas);
            
            // Add hit area for hover detection
            hitAreas.push({
                x: settingX,
                y: currentY,
                width: width - (settingX - x),
                height: settingHeight - 10,
                action: 'hover',
                settingId: `setting_${this.activeTab}_${index}`,
                setting: setting
            });
            
            currentY += settingHeight + settingSpacing;
        });
        
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    
    /**
     * Render individual setting controls
     */
    renderSettingControl(ctx, setting, x, y, width, height, hitAreas) {
        switch (setting.type) {
            case 'slider':
                this.renderSlider(ctx, setting, x, y, width, height, hitAreas);
                break;
            case 'toggle':
                this.renderToggle(ctx, setting, x + width - 60, y + 10, 50, 30, hitAreas);
                break;
            case 'dropdown':
                this.renderDropdown(ctx, setting, x, y + 10, width, 30, hitAreas);
                break;
            case 'key':
                this.renderKeyCapture(ctx, setting, x, y + 10, width, 30, hitAreas);
                break;
        }
    }
    
    /**
     * Render slider control
     */
    renderSlider(ctx, setting, x, y, width, height, hitAreas) {
        const sliderWidth = width - 80;
        const sliderHeight = 6;
        const sliderY = y + height / 2 - sliderHeight / 2;
        
        // Slider track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.roundRect(ctx, x, sliderY, sliderWidth, sliderHeight, sliderHeight / 2);
        ctx.fill();
        
        // Slider fill
        const progress = (setting.value - setting.min) / (setting.max - setting.min);
        ctx.fillStyle = this.settingsCategories[this.activeTab].color;
        this.roundRect(ctx, x, sliderY, sliderWidth * progress, sliderHeight, sliderHeight / 2);
        ctx.fill();
        
        // Slider handle
        const handleX = x + sliderWidth * progress - 8;
        const handleY = sliderY - 4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(handleX + 8, handleY + 7, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Value display
        let displayValue = setting.value;
        if (setting.showPercentage) {
            displayValue = Math.round(setting.value * 100) + '%';
        } else if (setting.showMultiplier) {
            displayValue = setting.value.toFixed(2) + 'x';
        } else if (setting.showValue) {
            displayValue = setting.value.toString();
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(displayValue, x + sliderWidth + 10, sliderY + 10);
        
        // Add hit area
        hitAreas.push({
            x: x,
            y: sliderY - 10,
            width: sliderWidth,
            height: sliderHeight + 20,
            action: 'slider',
            setting: setting
        });
    }
    
    /**
     * Render toggle control
     */
    renderToggle(ctx, setting, x, y, width, height, hitAreas) {
        const isOn = setting.value;
        
        // Toggle background
        ctx.fillStyle = isOn ? this.settingsCategories[this.activeTab].color : 'rgba(255, 255, 255, 0.2)';
        this.roundRect(ctx, x, y, width, height, height / 2);
        ctx.fill();
        
        // Toggle circle
        const circleRadius = height / 2 - 4;
        const circleX = isOn ? x + width - height / 2 : x + height / 2;
        const circleY = y + height / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add hit area
        hitAreas.push({
            x: x,
            y: y,
            width: width,
            height: height,
            action: 'toggle',
            setting: setting
        });
    }
    
    /**
     * Render dropdown control
     */
    renderDropdown(ctx, setting, x, y, width, height, hitAreas) {
        // Dropdown background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Current value
        const currentOption = setting.options.find(opt => opt.value === setting.value);
        const displayText = currentOption ? currentOption.label : setting.value;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(displayText, x + 12, y + height / 2 + 5);
        
        // Dropdown arrow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼', x + width - 15, y + height / 2 + 4);
        
        // Add hit area
        hitAreas.push({
            x: x,
            y: y,
            width: width,
            height: height,
            action: 'dropdown',
            setting: setting
        });
    }
    
    /**
     * Render key capture control
     */
    renderKeyCapture(ctx, setting, x, y, width, height, hitAreas) {
        const isCapturing = this.keyCaptureSetting === setting;
        
        // Key background
        ctx.fillStyle = isCapturing ? 'rgba(255, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        this.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();
        
        ctx.strokeStyle = isCapturing ? '#ffff00' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Key text
        const keyText = isCapturing ? 'Press a key...' : setting.value;
        ctx.fillStyle = isCapturing ? '#ffff00' : '#ffffff';
        ctx.font = '14px "SF Pro Display", -apple-system, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(keyText, x + width / 2, y + height / 2 + 5);
        
        // Add hit area
        hitAreas.push({
            x: x,
            y: y,
            width: width,
            height: height,
            action: 'key',
            setting: setting
        });
    }
    
    /**
     * Render control buttons
     */
    renderControlButtons(ctx, x, y, width, hitAreas) {
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 20;
        const totalButtonWidth = buttonWidth * 4 + buttonSpacing * 3;
        const buttonsStartX = x + width / 2 - totalButtonWidth / 2;
        
        const buttons = [
            { label: 'Reset', action: 'reset', color: '#ef4444' },
            { label: 'Export', action: 'export', color: '#3b82f6' },
            { label: 'Import', action: 'import', color: '#10b981' },
            { label: 'Back', action: 'back', color: '#6b7280' }
        ];
        
        buttons.forEach((button, index) => {
            const buttonX = buttonsStartX + index * (buttonWidth + buttonSpacing);
            const isHovered = this.hoveredItem === `button_${button.action}`;
            
            // Button background
            ctx.fillStyle = isHovered ? `${button.color}CC` : `${button.color}88`;
            this.roundRect(ctx, buttonX, y, buttonWidth, buttonHeight, 12);
            ctx.fill();
            
            // Button text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px "SF Pro Display", -apple-system, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(button.label, buttonX + buttonWidth / 2, y + buttonHeight / 2 + 5);
            
            // Add hit area
            hitAreas.push({
                x: buttonX,
                y: y,
                width: buttonWidth,
                height: buttonHeight,
                action: button.action
            });
        });
    }
    
    /**
     * Render tooltip
     */
    renderTooltip(ctx, tooltip) {
        const padding = 12;
        const maxWidth = 300;
        
        // Measure text
        ctx.font = '12px "SF Pro Display", -apple-system, system-ui, sans-serif';
        const lines = this.wrapText(ctx, tooltip.description, maxWidth - padding * 2);
        const lineHeight = 16;
        const tooltipHeight = lines.length * lineHeight + padding * 2;
        
        // Position tooltip
        let tooltipX = tooltip.x + tooltip.width + 10;
        let tooltipY = tooltip.y;
        
        // Adjust if tooltip goes off screen
        if (tooltipX + maxWidth > 1920) {
            tooltipX = tooltip.x - maxWidth - 10;
        }
        if (tooltipY + tooltipHeight > 1080) {
            tooltipY = 1080 - tooltipHeight - 10;
        }
        
        // Tooltip background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.roundRect(ctx, tooltipX, tooltipY, maxWidth, tooltipHeight, 8);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Tooltip text
        ctx.fillStyle = '#ffffff';
        lines.forEach((line, index) => {
            ctx.fillText(line, tooltipX + padding, tooltipY + padding + (index + 1) * lineHeight);
        });
    }
    
    /**
     * Render save confirmation
     */
    renderSaveConfirmation(ctx, width, height) {
        const message = 'Settings Saved!';
        const padding = 20;
        
        ctx.font = 'bold 16px "SF Pro Display", -apple-system, system-ui, sans-serif';
        const textWidth = ctx.measureText(message).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 50;
        
        const x = width / 2 - boxWidth / 2;
        const y = height - 100;
        
        // Confirmation background
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        this.roundRect(ctx, x, y, boxWidth, boxHeight, 12);
        ctx.fill();
        
        // Confirmation text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(message, width / 2, y + boxHeight / 2 + 6);
    }
    
    /**
     * Helper function to draw rounded rectangles
     */
    roundRect(ctx, x, y, width, height, radius) {
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
     * Helper function to wrap text
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
        
        // Handle tooltip timing
        if (newTooltip) {
            if (!this.showTooltip || this.showTooltip.description !== newTooltip.description) {
                this.tooltipTimer = Date.now();
            }
            if (Date.now() - this.tooltipTimer > 800) { // Show tooltip after 800ms
                this.showTooltip = newTooltip;
            }
        } else {
            this.showTooltip = null;
            this.tooltipTimer = 0;
        }
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
                
                // Handle tab switching
                if (area.action === 'tab') {
                    this.activeTab = area.tab;
                    this.sectionsAnimationProgress = 0; // Reset animation
                    return null;
                }
                
                // Handle setting controls
                if (area.setting) {
                    this.handleEnhancedSettingClick(area.setting, area.action, x - area.x);
                    return null;
                }
                
                break;
            }
        }
        return null;
    }
    
    /**
     * Handle enhanced setting interactions
     */
    handleEnhancedSettingClick(setting, action, relativeX) {
        switch (action) {
            case 'slider':
                const sliderWidth = 200 - 80; // Adjust based on your slider width
                const progress = Math.max(0, Math.min(1, relativeX / sliderWidth));
                const newValue = setting.min + progress * (setting.max - setting.min);
                
                // Round to step
                const steppedValue = Math.round(newValue / setting.step) * setting.step;
                this.setSettingValue(setting.key, steppedValue);
                break;
                
            case 'toggle':
                this.setSettingValue(setting.key, !setting.value);
                break;
                
            case 'dropdown':
                // Cycle through options
                const currentIndex = setting.options.findIndex(opt => opt.value === setting.value);
                const nextIndex = (currentIndex + 1) % setting.options.length;
                this.setSettingValue(setting.key, setting.options[nextIndex].value);
                break;
                
            case 'key':
                this.startKeyCapture(setting);
                break;
        }
    }
    
    /**
     * Start key capture for key binding settings
     */
    startKeyCapture(setting) {
        this.isKeyCapturing = true;
        this.keyCaptureSetting = setting;
    }
    
    /**
     * Handle key press during key capture
     */
    handleKeyPress(event) {
        if (this.isKeyCapturing && this.keyCaptureSetting) {
            let keyName = event.key;
            
            // Convert some key names to more readable format
            const keyNameMap = {
                ' ': 'Space',
                'ArrowUp': 'Up',
                'ArrowDown': 'Down',
                'ArrowLeft': 'Left',
                'ArrowRight': 'Right'
            };
            
            if (keyNameMap[keyName]) {
                keyName = keyNameMap[keyName];
            }
            
            this.setSettingValue(this.keyCaptureSetting.key, keyName);
            this.isKeyCapturing = false;
            this.keyCaptureSetting = null;
            
            event.preventDefault();
            return true;
        }
        return false;
    }
}
