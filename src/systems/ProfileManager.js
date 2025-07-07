/**
 * ProfileManager - Handles user profile data including selected sprites and other preferences
 */

export class ProfileManager {
    constructor() {
        this.profileData = {
            name: '',
            selectedSprite: 'player-sprite.png', // Default sprite
            preferences: {}
        };
        
        // Load saved profile data
        this.loadProfile();
        
        console.log('🎭 ProfileManager initialized');
    }

    /**
     * Load profile data from localStorage
     */
    loadProfile() {
        try {
            const saved = localStorage.getItem('coderunner_profile');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.profileData = { ...this.profileData, ...parsed };
                console.log('📄 Profile loaded from localStorage', this.profileData);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load profile data:', error);
        }
    }

    /**
     * Save profile data to localStorage
     */
    saveProfile() {
        try {
            localStorage.setItem('coderunner_profile', JSON.stringify(this.profileData));
            console.log('💾 Profile saved to localStorage', this.profileData);
        } catch (error) {
            console.warn('⚠️ Failed to save profile data:', error);
        }
    }

    /**
     * Get the currently selected sprite
     */
    getSelectedSprite() {
        return this.profileData.selectedSprite || 'player-sprite.png';
    }

    /**
     * Set the selected sprite
     */
    setSelectedSprite(spriteId) {
        this.profileData.selectedSprite = spriteId;
        this.saveProfile();
        console.log(`🎮 Selected sprite updated: ${spriteId}`);
    }

    /**
     * Get player name
     */
    getPlayerName() {
        return this.profileData.name || '';
    }

    /**
     * Set player name
     */
    setPlayerName(name) {
        this.profileData.name = name;
        this.saveProfile();
        console.log(`👤 Player name updated: ${name}`);
    }

    /**
     * Refresh sprite selector (compatibility method for existing code)
     */
    refreshSpriteSelector() {
        // This method is called by other systems for compatibility
        // In a more complex system, this would update UI elements
        console.log('🔄 Sprite selector refreshed');
    }

    /**
     * Reset profile to defaults
     */
    resetProfile() {
        this.profileData = {
            name: '',
            selectedSprite: 'player-sprite.png',
            preferences: {}
        };
        this.saveProfile();
        console.log('🔄 Profile reset to defaults');
    }
}

// Auto-initialize ProfileManager and make it globally available
if (typeof window !== 'undefined') {
    window.profileManager = new ProfileManager();
    console.log('🌐 ProfileManager available globally as window.profileManager');
}
