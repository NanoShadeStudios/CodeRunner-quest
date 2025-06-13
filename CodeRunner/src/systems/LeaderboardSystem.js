/**
 * Firebase-enabled Leaderboard System
 * Implements the submitScore and showLeaderboard functions from LeaderBoard.MD
 */

import { DIFFICULTY_LEVELS } from '../utils/constants.js';

export class LeaderboardSystem {
    constructor() {
        this.leaderboards = {
            EASY: [],
            MEDIUM: [],
            HARD: [],
            EXTREME: []
        };
        
        this.uploadedDifficulties = new Set();
        this.selectedDifficulty = 'EASY';
        this.isUploading = false;
        this.uploadResult = null;
        this.showUploadPrompt = false;
        this.playerName = '';
        this.nameInputActive = false;
        this.playerEntries = new Map();
        this.savedPlayerName = '';
        
        // Firebase configuration
        this.firebaseDatabase = null;
        this.isOnline = false;
        this.currentUpload = null;
        
        // Content moderation system
        this.moderationData = {
            violations: 0,
            lastViolationTime: 0,
            banEndTime: 0,
            warningHistory: []
        };
        
        // List of inappropriate words/phrases (expandable)
        this.inappropriateWords = [
            // Profanity
            'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'piss',
            'bastard', 'whore', 'slut', 'fag', 'retard', 'gay', 'homo',
            // Offensive terms
            'nazi', 'hitler', 'terrorist', 'rape', 'murder', 'kill', 'die',
            'suicide', 'cancer', 'aids', 'covid', 'virus', 'disease',
            // Racial slurs and hate speech
            'nigger', 'nigga', 'chink', 'spic', 'kike', 'faggot', 'tranny',
            // Sexual content
            'sex', 'porn', 'nude', 'naked', 'tits', 'boobs', 'penis', 'vagina',
            'cock', 'dick', 'pussy', 'cum', 'orgasm', 'masturbate',
            // Drugs
            'cocaine', 'heroin', 'meth', 'weed', 'marijuana', 'drugs',
            // Generic offensive
            'hate', 'stupid', 'idiot', 'loser', 'noob', 'suck', 'sucks'
        ];
        
        // Initialize system
        this.initializeSystem();
    }    /**
     * Initialize the leaderboard system (online or offline mode)
     */
    async initializeSystem() {
        // Check if Firebase is available
        await this.checkFirebaseConnection();
        
        // Set up network status listeners
        this.setupNetworkListeners();
        
        if (this.isOnline) {
            console.log('🌐 Connected to Firebase leaderboard');
            await this.loadFirebaseLeaderboards();
        } else {
            console.log('💾 Using offline leaderboard mode');
            this.clearFakeSubmissions();
            this.loadLeaderboards();
        }
        
        // Always load local user preferences
        this.loadUploadHistory();
        this.loadPlayerName();
        this.loadPlayerEntries();
        
        // Load moderation data
        this.loadModerationData();
    }    /**
     * Check if Firebase is available and network connectivity
     */
    async checkFirebaseConnection() {
        try {
            if (typeof window !== 'undefined' && window.firebaseDatabase) {
                this.firebaseDatabase = window.firebaseDatabase;
                // Check actual network connectivity
                const hasConnection = await this.checkNetworkConnectivity();
                this.isOnline = hasConnection;
                if (hasConnection) {
                    console.log('Firebase database connected with network');
                } else {
                    console.log('Firebase available but no network connection');
                }
            } else {
                this.isOnline = false;
                console.log('Firebase not available, using offline mode');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('Firebase connection error:', error);
        }
    }    /**
     * Check for actual network connectivity
     */
    async checkNetworkConnectivity() {
        // Check browser's online status first
        if (!navigator.onLine) {
            return false;
        }

        try {
            // Try to make a small request to check actual connectivity
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            console.log('Network connectivity check failed:', error);
            return false;
        }
    }
    
    /**
     * Firebase submitScore function as specified in LeaderBoard.MD task 3
     */
    async submitScore(name, score, difficulty = this.selectedDifficulty, survivalTime = 0) {
        if (!this.isOnline || !this.firebaseDatabase) {
            console.log('Firebase not available, using offline mode');
            return this.submitScoreOffline(name, score, difficulty, survivalTime);
        }
          try {
            const scoresRef = this.firebaseDatabase.ref(`leaderboard/${difficulty}`);
            const newScore = {
                name: name,
                score: score,
                survivalTime: survivalTime,
                timestamp: Date.now()
            };
            
            // TODO: Implement entry replacement logic for Firebase
            // For now, Firebase allows multiple entries per player
            // Push to Firebase
            await scoresRef.push(newScore);
            
            console.log('✅ Score submitted to Firebase:', newScore);
            
            // Update local tracking
            this.uploadedDifficulties.add(difficulty);
            this.savePlayerName(name);
            this.saveUploadHistory();
            
            // Refresh local leaderboards
            await this.loadFirebaseLeaderboards();
            
            return true;
        } catch (error) {
            console.error('❌ Firebase submit error:', error);
            // Fallback to offline
            return this.submitScoreOffline(name, score, difficulty, survivalTime);
        }
    }
    
    /**
     * Load leaderboards from Firebase
     */
    async loadFirebaseLeaderboards() {
        if (!this.firebaseDatabase) return;
        
        try {
            const snapshot = await this.firebaseDatabase.ref('leaderboard').once('value');
            const data = snapshot.val();
            
            if (data) {
                // Convert Firebase data to our format
                Object.keys(this.leaderboards).forEach(difficulty => {
                    if (data[difficulty]) {
                        const scores = [];
                        Object.values(data[difficulty]).forEach(score => {
                            scores.push({
                                id: score.timestamp || Date.now(),
                                name: score.name,
                                score: score.score,
                                survivalTime: score.survivalTime || 0,
                                timestamp: score.timestamp || Date.now()
                            });
                        });
                        
                        // Sort by score descending
                        scores.sort((a, b) => b.score - a.score);
                        this.leaderboards[difficulty] = scores.slice(0, 10); // Keep top 10
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load Firebase leaderboards:', error);
            this.isOnline = false;
        }
    }
      /**
     * Refresh leaderboards (for live updates)
     */
    async refreshLeaderboards() {
        if (this.isOnline) {
            await this.loadFirebaseLeaderboards();
        }
    }
      /**
     * showLeaderboard function as specified in LeaderBoard.MD task 4
     * Shows the live leaderboard in the HTML container
     * Task 5: Uses live updates with .on("value") instead of .once("value")
     */
    showLeaderboard(difficulty = this.selectedDifficulty, enableLiveUpdates = true) {
        if (!this.isOnline || !this.firebaseDatabase) {
            console.log('Firebase not available, showing offline leaderboard');
            this.showOfflineLeaderboard(difficulty);
            return;
        }
        
        const scoresRef = this.firebaseDatabase.ref(`leaderboard/${difficulty}`);
        
        // Task 5: Use .on("value") for live updates instead of .once("value")
        const listener = enableLiveUpdates ? 'on' : 'once';
        
        scoresRef.orderByChild("score").limitToLast(5)[listener]("value", (snapshot) => {
            const data = [];
            snapshot.forEach((childSnapshot) => {
                data.push(childSnapshot.val());
            });

            data.reverse(); // Show highest scores first

            const leaderboardElement = document.getElementById("leaderboard");
            if (!leaderboardElement) {
                console.warn('Leaderboard element not found in DOM');
                return;
            }
            
            leaderboardElement.innerHTML = "";

            if (data.length === 0) {
                const li = document.createElement("li");
                li.style.textAlign = "center";
                li.style.color = "#7d8590";
                li.style.padding = "10px";
                li.textContent = `No scores yet for ${DIFFICULTY_LEVELS[difficulty].name} difficulty`;
                leaderboardElement.appendChild(li);
                return;
            }

            data.forEach((entry, index) => {
                const li = document.createElement("li");
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.padding = "8px 0";
                li.style.borderBottom = index < data.length - 1 ? "1px solid #30363d" : "none";
                
                // Add medal for top 3
                let rankDisplay = `${index + 1}.`;
                if (index === 0) rankDisplay = '🥇';
                else if (index === 1) rankDisplay = '🥈';
                else if (index === 2) rankDisplay = '🥉';
                
                li.innerHTML = `
                    <span>${rankDisplay} ${entry.name}</span>
                    <span style="color: #ffd700;">${entry.score}m</span>
                `;
                leaderboardElement.appendChild(li);
            });
            
            // Show the leaderboard container
            const containerElement = document.getElementById("leaderboard-container");
            if (containerElement) {
                containerElement.style.display = "block";
            }
        });
        
        // Store the listener reference for cleanup
        if (enableLiveUpdates) {
            this.currentLeaderboardListener = {
                ref: scoresRef.orderByChild("score").limitToLast(5),
                difficulty: difficulty
            };
        }
    }
    
    /**
     * Stop live leaderboard updates
     */
    stopLiveLeaderboardUpdates() {
        if (this.currentLeaderboardListener) {
            this.currentLeaderboardListener.ref.off("value");
            this.currentLeaderboardListener = null;
        }
    }
    
    /**
     * Show offline leaderboard fallback
     */
    showOfflineLeaderboard(difficulty = this.selectedDifficulty) {
        const entries = this.getLeaderboard(difficulty).slice(0, 5);
        const leaderboardElement = document.getElementById("leaderboard");
        
        if (!leaderboardElement) {
            console.warn('Leaderboard element not found in DOM');
            return;
        }
        
        leaderboardElement.innerHTML = "";
        
        if (entries.length === 0) {
            const li = document.createElement("li");
            li.style.textAlign = "center";
            li.style.color = "#7d8590";
            li.style.padding = "10px";
            li.textContent = `No offline scores for ${DIFFICULTY_LEVELS[difficulty].name} difficulty`;
            leaderboardElement.appendChild(li);
        } else {
            entries.forEach((entry, index) => {
                const li = document.createElement("li");
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.padding = "8px 0";
                li.style.borderBottom = index < entries.length - 1 ? "1px solid #30363d" : "none";
                
                let rankDisplay = `${index + 1}.`;
                if (index === 0) rankDisplay = '🥇';
                else if (index === 1) rankDisplay = '🥈';
                else if (index === 2) rankDisplay = '🥉';
                
                li.innerHTML = `
                    <span>${rankDisplay} ${entry.name}</span>
                    <span style="color: #ffd700;">${entry.score}m</span>
                `;
                leaderboardElement.appendChild(li);
            });
        }
        
        // Show the leaderboard container
        const containerElement = document.getElementById("leaderboard-container");
        if (containerElement) {
            containerElement.style.display = "block";
        }
    }
      /**
     * Check if player can upload for a specific difficulty
     */
    canUploadForDifficulty(difficulty) {
        // Allow uploads, but will replace existing entry if one exists
        return true;
    }    /**
     * Initiate score upload process
     */
    initiateUpload(difficulty, score, survivalTime) {
        if (score < 100) {
            this.uploadResult = {
                success: false,
                message: 'Minimum score of 100m required for leaderboard!'
            };
            return false;
        }

        // Check if player has an existing entry and inform them
        const hasExistingEntry = this.uploadedDifficulties.has(difficulty);
        if (hasExistingEntry) {
            const existingEntryId = this.playerEntries.get(difficulty);
            const existingEntry = this.leaderboards[difficulty].find(entry => entry.id === existingEntryId);
            
            if (existingEntry) {
                // Just inform the user, but allow the submission
                console.log(`Player has existing entry: ${existingEntry.score}m, new score: ${score}m`);
            }
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
     * Submit score to leaderboard (Firebase or offline)
     */
    async submitScoreFromUpload(playerName) {
        if (!this.currentUpload || !playerName.trim()) {
            return false;
        }
        
        // Validate player name for inappropriate content
        const validation = this.validatePlayerName(playerName.trim());
        if (!validation.valid) {
            this.uploadResult = {
                success: false,
                message: validation.message
            };
            
            // If banned, close the upload prompt
            if (validation.banned) {
                this.currentUpload = null;
                this.showUploadPrompt = false;
                this.nameInputActive = false;
            } else {
                // For warnings, clear the name and let them try again
                this.playerName = '';
            }
            
            this.isUploading = false;
            return false;
        }
        
        this.isUploading = true;
        this.nameInputActive = false;
        
        try {
            const { difficulty, score, survivalTime } = this.currentUpload;
            const success = await this.submitScore(playerName.trim(), score, difficulty, survivalTime);
            
            if (success) {
                this.uploadResult = {
                    success: true,
                    message: `Score uploaded successfully to ${DIFFICULTY_LEVELS[difficulty].name} leaderboard!`
                };
                
                this.currentUpload = null;
                this.showUploadPrompt = false;
            } else {
                this.uploadResult = {
                    success: false,
                    message: 'Upload failed! Please try again later.'
                };
            }
            
            return success;
            
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
     * Submit score offline (fallback method)
     */
    async submitScoreOffline(playerName, score, difficulty, survivalTime) {
        // Simulate API upload delay
        await this.simulateUpload();
        
        // Remove existing entry if player has one for this difficulty
        const existingEntryId = this.playerEntries.get(difficulty);
        if (existingEntryId) {
            this.leaderboards[difficulty] = this.leaderboards[difficulty].filter(entry => entry.id !== existingEntryId);
        }
        
        const entry = {
            name: playerName.trim().substring(0, 20),
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
        
        return true;
    }
    
    /**
     * Simulate upload delay
     */
    async simulateUpload() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.random() * 2000);
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
     * Save leaderboards to localStorage (offline mode)
     */
    saveLeaderboards() {
        try {
            localStorage.setItem('coderunner_leaderboards', JSON.stringify(this.leaderboards));
        } catch (error) {
            console.warn('Failed to save leaderboards:', error);
        }
    }
    
    /**
     * Load leaderboards from localStorage (offline mode)
     */
    loadLeaderboards() {
        try {
            const saved = localStorage.getItem('coderunner_leaderboards');
            if (saved) {
                const data = JSON.parse(saved);
                Object.keys(this.leaderboards).forEach(difficulty => {
                    if (data[difficulty]) {
                        this.leaderboards[difficulty] = data[difficulty];
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load leaderboards:', error);
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
     * Clear any fake submissions from localStorage
     */
    clearFakeSubmissions() {
        const noFakeDataFlag = localStorage.getItem('coderunner_no_fake_data');
        
        if (!noFakeDataFlag) {
            try {
                localStorage.removeItem('coderunner_leaderboards');
                localStorage.setItem('coderunner_no_fake_data', 'true');
                console.log('Cleared all leaderboard data to remove fake submissions');
            } catch (error) {
                console.warn('Failed to clear legacy data:', error);
            }
            
            Object.keys(this.leaderboards).forEach(difficulty => {
                this.leaderboards[difficulty] = [];
            });
        }
    }
    
    /**
     * Check if a name contains inappropriate content
     */
    isInappropriateName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const lowerName = name.toLowerCase().trim();
        
        // Check for inappropriate words
        for (const word of this.inappropriateWords) {
            if (lowerName.includes(word)) {
                return true;
            }
        }
        
        // Check for excessive special characters (spam-like behavior)
        const specialCharCount = (lowerName.match(/[^a-z0-9\s]/g) || []).length;
        if (specialCharCount > lowerName.length * 0.5) {
            return true;
        }
        
        // Check for repeated characters (like "aaaaa" or "1111")
        const repeatedPattern = /(.)\1{4,}/;
        if (repeatedPattern.test(lowerName)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if player is currently banned
     */
    isPlayerBanned() {
        return Date.now() < this.moderationData.banEndTime;
    }
    
    /**
     * Get time remaining on ban (in hours)
     */
    getBanTimeRemaining() {
        if (!this.isPlayerBanned()) return 0;
        return Math.ceil((this.moderationData.banEndTime - Date.now()) / (1000 * 60 * 60));
    }
    
    /**
     * Record a violation and apply appropriate punishment
     */
    recordViolation(inappropriateName) {
        this.moderationData.violations++;
        this.moderationData.lastViolationTime = Date.now();
        
        // Add to warning history (keep last 10)
        this.moderationData.warningHistory.unshift({
            name: inappropriateName,
            timestamp: Date.now()
        });
        if (this.moderationData.warningHistory.length > 10) {
            this.moderationData.warningHistory = this.moderationData.warningHistory.slice(0, 10);
        }
        
        // Apply ban after 3 violations
        if (this.moderationData.violations >= 3) {
            // 2 days ban (48 hours)
            this.moderationData.banEndTime = Date.now() + (48 * 60 * 60 * 1000);
            this.saveModerationData();
            return {
                banned: true,
                message: `You have been banned from the leaderboard for 2 days due to repeated inappropriate names. Ban expires in ${this.getBanTimeRemaining()} hours.`
            };
        }
        
        this.saveModerationData();
        
        const warningsLeft = 3 - this.moderationData.violations;
        return {
            banned: false,
            message: `Warning ${this.moderationData.violations}/3: Inappropriate name detected. ${warningsLeft} warning(s) remaining before a 2-day ban.`
        };
    }
    
    /**
     * Validate player name before submission
     */
    validatePlayerName(name) {
        // Check if player is banned
        if (this.isPlayerBanned()) {
            return {
                valid: false,
                message: `You are banned from the leaderboard. Ban expires in ${this.getBanTimeRemaining()} hours.`,
                banned: true
            };
        }
        
        // Check for inappropriate content
        if (this.isInappropriateName(name)) {
            const violation = this.recordViolation(name);
            return {
                valid: false,
                message: violation.message,
                banned: violation.banned
            };
        }
        
        // Name is valid
        return {
            valid: true,
            message: 'Name approved',
            banned: false
        };
    }
    
    /**
     * Save moderation data to localStorage
     */
    saveModerationData() {
        try {
            localStorage.setItem('coderunner_moderation', JSON.stringify(this.moderationData));
        } catch (error) {
            console.warn('Failed to save moderation data:', error);
        }
    }
    
    /**
     * Load moderation data from localStorage
     */
    loadModerationData() {
        try {
            const saved = localStorage.getItem('coderunner_moderation');
            if (saved) {
                const data = JSON.parse(saved);
                this.moderationData = {
                    violations: data.violations || 0,
                    lastViolationTime: data.lastViolationTime || 0,
                    banEndTime: data.banEndTime || 0,
                    warningHistory: data.warningHistory || []
                };
                
                // Reset violations if enough time has passed (30 days)
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                if (this.moderationData.lastViolationTime < thirtyDaysAgo) {
                    this.moderationData.violations = 0;
                    this.moderationData.warningHistory = [];
                    this.saveModerationData();
                }
            }
        } catch (error) {
            console.warn('Failed to load moderation data:', error);
        }
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
        if (!newName || !newName.trim()) {
            return false;
        }
        
        // Validate new name for inappropriate content
        const validation = this.validatePlayerName(newName.trim());
        if (!validation.valid) {
            this.uploadResult = {
                success: false,
                message: validation.message
            };
            return false;
        }
        
        this.savePlayerName(newName.trim());
        this.savedPlayerName = newName.trim();
        
        // Update all player entries with the new name (offline only for now)
        if (!this.isOnline) {
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
        }
        
        this.uploadResult = {
            success: true,
            message: `Player name updated to "${newName.trim()}"`
        };
        
        return true;
    }
    
    /**
     * Set up listeners for network status changes
     */
    setupNetworkListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            this.handleNetworkStatusChange(true);
        });

        window.addEventListener('offline', () => {
            console.log('Network connection lost');
            this.handleNetworkStatusChange(false);
        });

        // Periodically check connectivity (every 30 seconds when online)
        setInterval(async () => {
            if (this.isOnline && this.firebaseDatabase) {
                const hasConnection = await this.checkNetworkConnectivity();
                if (!hasConnection) {
                    this.handleNetworkStatusChange(false);
                }
            }
        }, 30000);
    }

    /**
     * Handle network status changes
     */
    async handleNetworkStatusChange(isConnected) {
        if (isConnected && this.firebaseDatabase) {
            // Try to verify actual connectivity
            const hasConnection = await this.checkNetworkConnectivity();
            this.isOnline = hasConnection;
            if (hasConnection) {
                console.log('🌐 Switched to online mode');
                // Refresh leaderboards when coming back online
                await this.loadFirebaseLeaderboards();
            }
        } else {
            this.isOnline = false;
            console.log('💾 Switched to offline mode');
        }
    }
    
    /**
     * Debug function: Test content moderation with a specific name
     * Usage in console: game.leaderboardSystem.testModeration("inappropriate_name")
     */
    testModeration(testName) {
        console.log(`🧪 Testing moderation for name: "${testName}"`);
        const validation = this.validatePlayerName(testName);
        console.log('📋 Validation result:', validation);
        console.log('📊 Current moderation status:', this.getModerationStatus());
        return validation;
    }
    
    /**
     * Debug function: Force add a violation
     * Usage in console: game.leaderboardSystem.forceViolation("test_name")
     */
    forceViolation(testName = "test_inappropriate") {
        console.log(`⚠️ Forcing violation for name: "${testName}"`);
        const result = this.recordViolation(testName);
        console.log('📋 Violation result:', result);
        console.log('📊 Updated moderation status:', this.getModerationStatus());
        return result;
    }
    
    /**
     * Debug function: Show current moderation data
     * Usage in console: game.leaderboardSystem.showModerationData()
     */
    showModerationData() {        console.log('📊 Current Moderation Data:');
        console.log('- Violations:', this.moderationData.violations);
        console.log('- Last Violation:', new Date(this.moderationData.lastViolationTime));
        console.log('- Ban End Time:', new Date(this.moderationData.banEndTime));
        console.log('- Warning History:', this.moderationData.warningHistory);
        console.log('- Is Banned:', this.isPlayerBanned());
        if (this.isPlayerBanned()) {
            console.log('- Hours Remaining:', this.getBanTimeRemaining());
        }
        return this.moderationData;
    }

    /**
     * Save player name to localStorage
     */
    savePlayerName(name) {
        try {
            localStorage.setItem('coderunner_player_name', name);
            this.savedPlayerName = name;
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
    }    /**
     * Get saved player name
     */
    getSavedPlayerName() {
        return this.savedPlayerName || '';
    }    /**
     * Get all difficulty tabs
     */
    getDifficultyTabs() {
        return Object.keys(DIFFICULTY_LEVELS);
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
            // Refresh leaderboards when switching tabs (for live updates)
            if (this.isOnline) {
                this.refreshLeaderboards();
            }
        }
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
}
