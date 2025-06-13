/**
 * Global Leaderboard System
 * Manages score uploads and leaderboard data for each difficulty level
 */

import { DIFFICULTY_LEVELS } from '../utils/constants.js';

export class LeaderboardSystem {    constructor() {
        this.leaderboards = {
            EASY: [],
            MEDIUM: [],
            HARD: [],
            EXTREME: []
        };
        
        this.uploadedDifficulties = new Set(); // Track which difficulties player has uploaded to
        this.selectedDifficulty = 'EASY';
        this.isUploading = false;
        this.uploadResult = null;
        this.showUploadPrompt = false;
        this.playerName = '';
        this.nameInputActive = false;
        this.playerEntries = new Map(); // Track player's entries by difficulty
        this.savedPlayerName = '';
        
        // Server configuration
        this.serverUrl = 'http://localhost:3001';
        this.isOnline = false;
        
        // Initialize system
        this.initializeSystem();
    }
    
    /**
     * Initialize the leaderboard system (online or offline mode)
     */
    async initializeSystem() {
        // Check if server is available
        await this.checkServerConnection();
        
        if (this.isOnline) {
            console.log('🌐 Connected to online leaderboard server');
            await this.loadOnlineLeaderboards();
        } else {
            console.log('💾 Using offline leaderboard mode');
            this.clearFakeSubmissions();
            this.loadLeaderboards();
        }
        
        // Always load local user preferences
        this.loadUploadHistory();
        this.loadPlayerName();
        this.loadPlayerEntries();
    }
    
    /**
     * Check if server is available
     */
    async checkServerConnection() {
        try {
            const response = await fetch(`${this.serverUrl}/api/health`, {
                method: 'GET',
                timeout: 3000
            });
            this.isOnline = response.ok;
        } catch (error) {
            this.isOnline = false;
            console.log('Server not available, using offline mode');
        }
    }
    
    /**
     * Load leaderboards from server
     */
    async loadOnlineLeaderboards() {
        try {
            const response = await fetch(`${this.serverUrl}/api/leaderboards`);
            if (response.ok) {
                const data = await response.json();
                this.leaderboards = data;
            }
        } catch (error) {
            console.warn('Failed to load online leaderboards:', error);
            this.isOnline = false;
        }
    }
    
    /**
     * Check if player can upload for a specific difficulty
     */
    canUploadForDifficulty(difficulty) {
        return !this.uploadedDifficulties.has(difficulty);
    }
      /**
     * Initiate score upload process
     */
    initiateUpload(difficulty, score, survivalTime) {
        if (!this.canUploadForDifficulty(difficulty)) {
            this.uploadResult = {
                success: false,
                message: `You have already uploaded a score for ${DIFFICULTY_LEVELS[difficulty].name} difficulty!`
            };
            return false;
        }
        
        if (score < 100) {
            this.uploadResult = {
                success: false,
                message: 'Minimum score of 100m required for leaderboard!'
            };
            return false;
        }
        
        this.showUploadPrompt = true;
        this.currentUpload = { difficulty, score, survivalTime };
        
        // Use saved player name if available
        if (!this.playerName) {
            this.playerName = this.getSavedPlayerName();
        }
        
        this.nameInputActive = true;
        return true;
    }
      /**
     * Submit score to leaderboard (online or offline)
     */
    async submitScore(playerName) {
        if (!this.currentUpload || !playerName.trim()) {
            return false;
        }
        
        this.isUploading = true;
        this.nameInputActive = false;
        
        try {
            const { difficulty, score, survivalTime } = this.currentUpload;
            
            if (this.isOnline) {
                // Submit to server
                const success = await this.submitScoreOnline(playerName, difficulty, score, survivalTime);
                if (success) {
                    // Refresh leaderboards from server
                    await this.loadOnlineLeaderboards();
                }
                return success;
            } else {
                // Submit locally
                return await this.submitScoreOffline(playerName, difficulty, score, survivalTime);
            }
            
        } catch (error) {
            console.error('Error submitting score:', error);
            this.uploadResult = {
                success: false,
                message: 'Upload failed! Please try again later.'
            };
            return false;
        } finally {
            this.isUploading = false;
        }
    }
    
    /**
     * Submit score to online server
     */
    async submitScoreOnline(playerName, difficulty, score, survivalTime) {
        try {
            const response = await fetch(`${this.serverUrl}/api/leaderboards/${difficulty}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playerName.trim(),
                    score,
                    survivalTime
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Mark this difficulty as uploaded
                this.uploadedDifficulties.add(difficulty);
                
                // Track player's entry
                this.playerEntries.set(difficulty, result.entry.id);
                
                // Save player name for future use
                this.savePlayerName(playerName.trim());
                
                // Save local data
                this.saveUploadHistory();
                this.savePlayerEntries();
                
                this.uploadResult = {
                    success: true,
                    message: `Score uploaded successfully to ${DIFFICULTY_LEVELS[difficulty].name} leaderboard!`,
                    rank: result.rank,
                    entryId: result.entry.id
                };
                
                this.currentUpload = null;
                this.showUploadPrompt = false;
                
                return true;
            } else {
                this.uploadResult = {
                    success: false,
                    message: result.error || 'Upload failed!'
                };
                return false;
            }
            
        } catch (error) {
            console.error('Online submit error:', error);
            // Fallback to offline mode
            this.isOnline = false;
            return await this.submitScoreOffline(playerName, difficulty, score, survivalTime);
        }
    }
    
    /**
     * Submit score offline (original local method)
     */
    async submitScoreOffline(playerName, difficulty, score, survivalTime) {
        }
        
        this.isUploading = true;
        this.nameInputActive = false;
        
        try {
            // Simulate API upload delay
            await this.simulateUpload();
            
            const { difficulty, score, survivalTime } = this.currentUpload;
            
            const entry = {
                name: playerName.trim().substring(0, 20), // Limit name length
                score: score,
                survivalTime: survivalTime,
                timestamp: Date.now(),
                id: this.generateId()
            };
            
            // Add to leaderboard
            this.leaderboards[difficulty].push(entry);
            
            // Sort by score (descending)
            this.leaderboards[difficulty].sort((a, b) => b.score - a.score);
            
            // Keep only top 10
            this.leaderboards[difficulty] = this.leaderboards[difficulty].slice(0, 10);
              // Mark this difficulty as uploaded
            this.uploadedDifficulties.add(difficulty);
            
            // Track player's entry for potential deletion
            this.playerEntries.set(difficulty, entry.id);
            
            // Save player name for future use
            this.savePlayerName(playerName.trim());
            
            // Save data
            this.saveLeaderboards();
            this.saveUploadHistory();
            this.savePlayerEntries();
            
            this.uploadResult = {
                success: true,
                message: `Score uploaded successfully to ${DIFFICULTY_LEVELS[difficulty].name} leaderboard!`,
                rank: this.leaderboards[difficulty].findIndex(e => e.id === entry.id) + 1
            };
            
            this.currentUpload = null;
            this.showUploadPrompt = false;
            
        } catch (error) {
            this.uploadResult = {
                success: false,
                message: 'Upload failed! Please try again later.'
            };
        } finally {
            this.isUploading = false;
        }
        
        return this.uploadResult.success;
    }
    
    /**
     * Simulate upload delay
     */
    async simulateUpload() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.random() * 2000); // 1-3 second delay
        });
    }
    
    /**
     * Generate unique ID for leaderboard entry
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Get leaderboard for specific difficulty
     */
    getLeaderboard(difficulty) {
        return this.leaderboards[difficulty] || [];
    }
    
    /**
     * Navigate between difficulties in leaderboard view
     */
    navigateUp() {
        const difficulties = Object.keys(DIFFICULTY_LEVELS);
        const currentIndex = difficulties.indexOf(this.selectedDifficulty);
        this.selectedDifficulty = difficulties[Math.max(0, currentIndex - 1)];
    }
    
    navigateDown() {
        const difficulties = Object.keys(DIFFICULTY_LEVELS);
        const currentIndex = difficulties.indexOf(this.selectedDifficulty);
        this.selectedDifficulty = difficulties[Math.min(difficulties.length - 1, currentIndex + 1)];
    }
    
    /**
     * Cancel upload process
     */
    cancelUpload() {
        this.showUploadPrompt = false;
        this.currentUpload = null;
        this.playerName = '';
        this.nameInputActive = false;
        this.uploadResult = null;
    }
    
    /**
     * Clear upload result message
     */
    clearResult() {
        this.uploadResult = null;
    }
    
    /**
     * Save leaderboards to localStorage
     */
    saveLeaderboards() {
        try {
            localStorage.setItem('coderunner_leaderboards', JSON.stringify(this.leaderboards));
        } catch (error) {
            console.warn('Failed to save leaderboards:', error);
        }
    }
    
    /**
     * Load leaderboards from localStorage
     */    loadLeaderboards() {
        try {
            const saved = localStorage.getItem('coderunner_leaderboards');
            if (saved) {
                const data = JSON.parse(saved);
                // Merge with defaults to ensure all difficulties exist
                Object.keys(this.leaderboards).forEach(difficulty => {
                    if (data[difficulty]) {
                        this.leaderboards[difficulty] = data[difficulty];
                    }
                });
            }
            
            // No example data - per requirements
        } catch (error) {
            console.warn('Failed to load leaderboards:', error);
            // Do not populate example data
        }
    }
    
    /**
     * Save upload history to localStorage
     */
    saveUploadHistory() {
        try {
            localStorage.setItem('coderunner_uploads', JSON.stringify([...this.uploadedDifficulties]));
        } catch (error) {
            console.warn('Failed to save upload history:', error);
        }
    }
    
    /**
     * Load upload history from localStorage
     */
    loadUploadHistory() {
        try {
            const saved = localStorage.getItem('coderunner_uploads');
            if (saved) {
                const data = JSON.parse(saved);
                this.uploadedDifficulties = new Set(data);
            }
        } catch (error) {
            console.warn('Failed to load upload history:', error);
        }
    }
      /**
     * Populate example leaderboard data
     * (Now disabled as per requirements)
     */
    populateExampleData() {
        // Clean existing data to ensure no fake submissions persist
        Object.keys(this.leaderboards).forEach(difficulty => {
            this.leaderboards[difficulty] = [];
        });
        
        // Clear localStorage to remove any example data that might be cached
        try {
            localStorage.removeItem('coderunner_leaderboards');
        } catch (error) {
            console.warn('Failed to clear leaderboards from localStorage:', error);
        }
    }
    
    /**
     * Clear any fake submissions from localStorage
     */
    clearFakeSubmissions() {
        // Check if this is the first time running with the new version
        const noFakeDataFlag = localStorage.getItem('coderunner_no_fake_data');
        
        if (!noFakeDataFlag) {
            // First time with the new version, clear all leaderboard data
            try {
                localStorage.removeItem('coderunner_leaderboards');
                localStorage.setItem('coderunner_no_fake_data', 'true');
                console.log('Cleared all leaderboard data to remove fake submissions');
            } catch (error) {
                console.warn('Failed to clear legacy data:', error);
            }
            
            // Initialize empty leaderboards
            Object.keys(this.leaderboards).forEach(difficulty => {
                this.leaderboards[difficulty] = [];
            });
        }
    }
    
    /**
     * Handle text input for player name
     */
    handleTextInput(character) {
        if (this.nameInputActive && this.playerName.length < 20) {
            this.playerName += character;
        }
    }
    
    /**
     * Handle backspace for player name
     */
    handleBackspace() {
        if (this.nameInputActive && this.playerName.length > 0) {
            this.playerName = this.playerName.slice(0, -1);
        }
    }
    
    /**
     * Check if a particular tab is the currently selected one
     */
    isTabSelected(difficulty) {
        return this.selectedDifficulty === difficulty;
    }
    
    /**
     * Select a tab for difficulty
     */
    selectTab(difficulty) {
        if (DIFFICULTY_LEVELS[difficulty]) {
            this.selectedDifficulty = difficulty;
        }
    }
      /**
     * Get all difficulty tabs
     */
    getDifficultyTabs() {
        return Object.keys(DIFFICULTY_LEVELS);
    }
    
    /**
     * Save player name to localStorage
     */
    savePlayerName(name) {
        try {
            localStorage.setItem('coderunner_player_name', name);
        } catch (error) {
            console.warn('Failed to save player name:', error);
        }
    }
    
    /**
     * Load player name from localStorage
     */
    loadPlayerName() {
        try {
            const saved = localStorage.getItem('coderunner_player_name');
            if (saved) {
                this.savedPlayerName = saved;
            }
        } catch (error) {
            console.warn('Failed to load player name:', error);
        }
    }
    
    /**
     * Get saved player name
     */
    getSavedPlayerName() {
        return this.savedPlayerName || '';
    }
    
    /**
     * Save player entries to localStorage
     */
    savePlayerEntries() {
        try {
            const entriesObj = Object.fromEntries(this.playerEntries);
            localStorage.setItem('coderunner_player_entries', JSON.stringify(entriesObj));
        } catch (error) {
            console.warn('Failed to save player entries:', error);
        }
    }
    
    /**
     * Load player entries from localStorage
     */
    loadPlayerEntries() {
        try {
            const saved = localStorage.getItem('coderunner_player_entries');
            if (saved) {
                const entriesObj = JSON.parse(saved);
                this.playerEntries = new Map(Object.entries(entriesObj));
            }
        } catch (error) {
            console.warn('Failed to load player entries:', error);
        }
    }
    
    /**
     * Delete player's entry from current difficulty
     */
    deletePlayerEntry() {
        const difficulty = this.selectedDifficulty;
        const entryId = this.playerEntries.get(difficulty);
        
        if (entryId) {
            // Remove from leaderboard
            this.leaderboards[difficulty] = this.leaderboards[difficulty].filter(entry => entry.id !== entryId);
            
            // Remove from player entries
            this.playerEntries.delete(difficulty);
            
            // Remove from uploaded difficulties (allow re-upload)
            this.uploadedDifficulties.delete(difficulty);
            
            // Save changes
            this.saveLeaderboards();
            this.saveUploadHistory();
            this.savePlayerEntries();
            
            this.uploadResult = {
                success: true,
                message: `Your ${DIFFICULTY_LEVELS[difficulty].name} entry has been deleted.`
            };
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if player has an entry in current difficulty
     */
    hasPlayerEntryInCurrentDifficulty() {
        return this.playerEntries.has(this.selectedDifficulty);
    }
    
    /**
     * Update player name (for name change functionality)
     */
    updatePlayerName(newName) {
        if (newName && newName.trim()) {
            this.savePlayerName(newName.trim());
            this.savedPlayerName = newName.trim();
            
            // Update all player entries with the new name
            Object.keys(this.leaderboards).forEach(difficulty => {
                const entryId = this.playerEntries.get(difficulty);
                if (entryId) {
                    const entry = this.leaderboards[difficulty].find(e => e.id === entryId);
                    if (entry) {
                        entry.name = newName.trim();
                    }
                }
            });
            
            this.saveLeaderboards();
            
            this.uploadResult = {
                success: true,
                message: `Player name updated to "${newName.trim()}"`
            };
            
            return true;
        }
        
        return false;
    }
}
