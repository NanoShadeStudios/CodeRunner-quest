/**
 * CloudSaveSystem - Handles saving game data to the cloud (Firestore) when logged in,
 * and falls back to localStorage for guest users
 */

export class CloudSaveSystem {
    constructor(game) {
        this.game = game;
        this.firestore = null;
        this.auth = null;
        this.isInitialized = false;
        
        // Initialize Firebase references
        this.initializeFirebase();
    }
      initializeFirebase() {
        try {
            if (window.firebaseAuth) {
                this.auth = window.firebaseAuth;
                console.log('✅ Firebase Auth initialized');
                
                // Only initialize Firestore if it's available and working
                if (window.firebaseFirestore) {
                    this.firestore = window.firebaseFirestore;
                    this.isInitialized = true;
                    console.log('✅ CloudSaveSystem initialized with Firestore');
                    
                    // Test Firestore connectivity on a delay to avoid blocking initialization
                    setTimeout(() => this.testFirestoreConnectivity(), 2000);
                } else {
                    console.warn('⚠️ Firestore not available, using localStorage only');
                }
            } else {
                console.warn('⚠️ Firebase not available, using localStorage only');
            }
        } catch (error) {
            console.error('❌ Error initializing CloudSaveSystem:', error);
            this.isInitialized = false;
        }
    }
    
    /**
     * Test Firestore connectivity and disable if problematic
     */
    async testFirestoreConnectivity() {
        if (!this.firestore || !this.isInitialized) return;
        
        try {
            // Simple test that shouldn't require authentication
            const testRef = this.firestore.collection('_test').doc('connectivity');
            await Promise.race([
                testRef.get(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
            ]);
            console.log('✅ Firestore connectivity confirmed');
        } catch (error) {
            console.warn('⚠️ Firestore connectivity test failed, disabling cloud saves:', error.message);
            this.isInitialized = false; // Disable Firestore operations
        }
    }
      /**
     * Check if user is currently logged in
     */
    isUserLoggedIn() {
        return this.auth && this.auth.currentUser !== null;
    }
    
    /**
     * Get current user ID
     */
    getCurrentUserId() {
        if (this.isUserLoggedIn()) {
            return this.auth.currentUser.uid;
        }
        return null;
    }    /**
     * Check if we can connect to Firebase (online check)
     */
    async isOnline() {
        if (!this.isInitialized || !this.isUserLoggedIn()) {
            return false;
        }
        
        try {
            // Use a simple document read with a short timeout
            const testPromise = this.firestore.collection('_connection_test').doc('test').get();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 2000)
            );
            
            await Promise.race([testPromise, timeoutPromise]);
            return true;
        } catch (error) {
            console.log('📶 Firestore connectivity check failed:', error.message);
            
            // If we get specific offline errors, disable Firestore temporarily
            if (error.message.includes('offline') || 
                error.message.includes('unavailable') ||
                error.code === 'unavailable') {
                console.warn('⚠️ Disabling Firestore due to connectivity issues');
                this.isInitialized = false;
            }
            
            return false;
        }
    }    /**
     * Save game data to cloud or localStorage
     */
    async saveGameData(saveData) {
        try {
            // Sanitize data before saving
            const sanitizedData = this.sanitizeData(saveData);
            
            if (this.isUserLoggedIn() && this.isInitialized) {
                try {
                    // Try cloud save with timeout
                    const cloudSavePromise = this.saveToCloud(sanitizedData);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Cloud save timeout')), 5000)
                    );
                    
                    const success = await Promise.race([cloudSavePromise, timeoutPromise]);
                    if (success) {
                        console.log('☁️ Successfully saved to cloud');
                        // Also save to localStorage as backup
                        this.saveToLocalStorage(sanitizedData);
                        return true;
                    }
                } catch (cloudError) {
                    console.warn('⚠️ Cloud save failed, using localStorage:', cloudError.message);
                    // Disable Firestore if we get connectivity errors
                    if (cloudError.message.includes('offline') || 
                        cloudError.message.includes('unavailable') ||
                        cloudError.code === 'unavailable') {
                        this.isInitialized = false;
                    }
                }
            }
            
            // Fall back to localStorage
            console.log('💾 Saving to localStorage');
            return this.saveToLocalStorage(sanitizedData);
            
        } catch (error) {
            console.error('❌ Error saving game data:', error);
            // Always fall back to localStorage on any error
            return this.saveToLocalStorage(saveData);
        }
    }
      /**
     * Load game data from cloud or localStorage
     */
    async loadGameData() {
        try {
            if (this.isUserLoggedIn() && this.isInitialized) {
                // Try to load from Firestore first, but with a timeout
                try {
                    const cloudData = await Promise.race([
                        this.loadFromCloud(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Cloud load timeout')), 3000)
                        )
                    ]);
                    
                    if (cloudData) {
                        console.log('☁️ Successfully loaded data from cloud');
                        return cloudData;
                    }
                } catch (cloudError) {
                    console.warn('⚠️ Cloud load failed, falling back to localStorage:', cloudError.message);
                    // Disable Firestore if we get connectivity errors
                    if (cloudError.message.includes('offline') || 
                        cloudError.message.includes('unavailable') ||
                        cloudError.code === 'unavailable') {
                        this.isInitialized = false;
                    }
                }
            }
            
            // Fall back to localStorage
            console.log('💾 Loading data from localStorage');
            return this.loadFromLocalStorage();
            
        } catch (error) {
            console.error('❌ Error loading game data:', error);
            // Always fall back to localStorage on any error
            return this.loadFromLocalStorage();
        }
    }/**
     * Save data to Firestore
     */
    async saveToCloud(saveData) {
        if (!this.isUserLoggedIn() || !this.isInitialized) {
            throw new Error('User not logged in or Firebase not initialized');
        }
        
        const userId = this.getCurrentUserId();
        const docRef = this.firestore.collection('user_saves').doc(userId);
        
        // Sanitize data to remove undefined values
        const sanitizedData = this.sanitizeData(saveData);
        
        // Prepare cloud save data with proper timestamp
        const cloudSaveData = {
            ...sanitizedData,
            version: sanitizedData.version || '1.4.0',
            timestamp: Date.now() // Use simple timestamp for compatibility
        };
        
        // Add server timestamp if available
        try {
            if (this.firestore.FieldValue && this.firestore.FieldValue.serverTimestamp) {
                cloudSaveData.lastUpdated = this.firestore.FieldValue.serverTimestamp();
            } else if (firebase.firestore && firebase.firestore.FieldValue) {
                cloudSaveData.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
            }
        } catch (timestampError) {
            console.warn('⚠️ Could not add server timestamp:', timestampError.message);
        }
        
        try {
            await docRef.set(cloudSaveData);
            console.log('☁️ Game data saved to cloud for user:', userId);
            return true;
        } catch (error) {
            // Handle offline errors gracefully
            if (error.code === 'unavailable' || error.message.includes('offline')) {
                console.warn('⚠️ Device is offline, data will be saved when connection is restored');
                // Fall back to localStorage for now
                return this.saveToLocalStorage(sanitizedData);
            }
            throw error;
        }
    }
    
    /**
     * Sanitize data to prevent undefined values from being saved to Firestore
     */
    sanitizeData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }
        
        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    // Recursively sanitize nested objects
                    sanitized[key] = this.sanitizeData(value);
                } else {
                    sanitized[key] = value;
                }
            }
        }
        
        return sanitized;
    }
    
    /**
     * Load data from Firestore
     */
    async loadFromCloud() {
        if (!this.isUserLoggedIn() || !this.isInitialized) {
            return null;
        }
        
        const userId = this.getCurrentUserId();
        const docRef = this.firestore.collection('user_saves').doc(userId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            console.log('☁️ Game data loaded from cloud for user:', userId);
            return data;
        } else {
            console.log('☁️ No cloud save data found for user:', userId);
            return null;
        }
    }
    
    /**
     * Save data to localStorage (fallback)
     */
    saveToLocalStorage(saveData) {
        try {
            localStorage.setItem('coderunner_save_data', JSON.stringify(saveData));
            console.log('💾 Game data saved to localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            return false;
        }
    }
    
    /**
     * Load data from localStorage (fallback)
     */
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('coderunner_save_data');
            if (savedData) {
                console.log('💾 Game data loaded from localStorage');
                return JSON.parse(savedData);
            }
            return null;
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
            return null;
        }
    }
    
    /**
     * Check if there's saved game data available
     */
    async hasSavedData() {
        try {
            if (this.isUserLoggedIn() && this.isInitialized) {
                // Check cloud save
                const userId = this.getCurrentUserId();
                const docRef = this.firestore.collection('user_saves').doc(userId);
                const doc = await docRef.get();
                if (doc.exists) {
                    return true;
                }
            }
            
            // Check localStorage
            return localStorage.getItem('coderunner_save_data') !== null;
        } catch (error) {
            console.error('❌ Error checking for saved data:', error);
            // Fall back to localStorage check
            return localStorage.getItem('coderunner_save_data') !== null;
        }
    }    /**
     * Migrate localStorage data to cloud when user logs in
     */
    async migrateLocalDataToCloud() {
        if (!this.isUserLoggedIn() || !this.isInitialized) {
            console.log('⚠️ Migration skipped: User not logged in or Firestore disabled');
            return false;
        }
        
        try {
            // Check if there's local data to migrate
            const localData = this.loadFromLocalStorage();
            if (!localData) {
                console.log('ℹ️ No local data found to migrate');
                return false;
            }
            
            // Try migration with a timeout
            const migrationPromise = this.performMigration(localData);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Migration timeout')), 10000)
            );
            
            return await Promise.race([migrationPromise, timeoutPromise]);
            
        } catch (error) {
            console.error('❌ Error migrating data to cloud:', error);
            console.log('⚠️ Migration failed, data will remain in localStorage');
            
            // Disable Firestore if we get connectivity errors
            if (error.message.includes('offline') || 
                error.message.includes('unavailable') ||
                error.code === 'unavailable') {
                this.isInitialized = false;
            }
            
            return false;
        }
    }
    
    /**
     * Perform the actual migration logic
     */
    async performMigration(localData) {
        try {
            // Check if cloud data already exists
            const cloudData = await this.loadFromCloud();
            if (cloudData) {
                // Cloud data exists, merge with local data
                console.log('☁️ Both local and cloud data exist, merging...');
                return await this.mergeLocalAndCloudData(localData, cloudData);
            } else {
                // No cloud data, upload local data
                console.log('☁️ Migrating local data to cloud...');
                const sanitizedData = this.sanitizeData(localData);
                return await this.saveToCloud(sanitizedData);
            }
        } catch (error) {
            throw error; // Re-throw to be handled by the timeout wrapper
        }
    }
    
    /**
     * Merge local and cloud data, taking the best of both
     */
    async mergeLocalAndCloudData(localData, cloudData) {
        try {
            const mergedData = {
                // Take the higher data packets
                dataPackets: Math.max(localData.dataPackets || 0, cloudData.dataPackets || 0),
                
                // Merge best scores (take highest for each difficulty)
                bestScores: this.mergeBestScores(localData.bestScores || {}, cloudData.bestScores || {}),
                
                // Merge owned upgrades (union of both sets)
                ownedUpgrades: this.mergeOwnedUpgrades(localData.ownedUpgrades || [], cloudData.ownedUpgrades || []),
                
                // Take the more recent profile data
                profileData: this.selectMoreRecentData(localData.profileData, cloudData.profileData, localData.timestamp, cloudData.timestamp),
                
                // Take the more recent audio settings
                audioSettings: this.selectMoreRecentData(localData.audioSettings, cloudData.audioSettings, localData.timestamp, cloudData.timestamp),
                
                // Merge leaderboard data
                leaderboardData: this.selectMoreRecentData(localData.leaderboardData, cloudData.leaderboardData, localData.timestamp, cloudData.timestamp),
                
                // Use current timestamp and version
                timestamp: Date.now(),
                version: localData.version || cloudData.version || '1.4.0'
            };
            
            // Save merged data to cloud
            await this.saveToCloud(mergedData);
            console.log('☁️ Successfully merged and saved data to cloud');
            return true;
        } catch (error) {
            console.error('❌ Error merging data:', error);
            return false;
        }
    }
    
    mergeBestScores(local, cloud) {
        const merged = { ...local };
        Object.keys(cloud).forEach(difficulty => {
            merged[difficulty] = Math.max(merged[difficulty] || 0, cloud[difficulty] || 0);
        });
        return merged;
    }
    
    mergeOwnedUpgrades(local, cloud) {
        const combined = new Set([...local, ...cloud]);
        return Array.from(combined);
    }
    
    selectMoreRecentData(localData, cloudData, localTimestamp, cloudTimestamp) {
        if (!localData) return cloudData;
        if (!cloudData) return localData;
        
        // If we have timestamps, use the more recent one
        if (localTimestamp && cloudTimestamp) {
            return localTimestamp > cloudTimestamp ? localData : cloudData;
        }
        
        // Default to cloud data if no timestamps
        return cloudData;
    }

    /**
     * Attempt to re-enable Firestore if it was disabled due to connectivity issues
     */
    async attemptFirestoreReconnection() {
        if (this.firestore && !this.isInitialized && this.isUserLoggedIn()) {
            console.log('🔄 Attempting to reconnect to Firestore...');
            try {
                // Test connectivity with a very short timeout
                const testPromise = this.firestore.collection('_test').doc('reconnect').get();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Reconnection timeout')), 2000)
                );
                
                await Promise.race([testPromise, timeoutPromise]);
                
                // If we get here, connection is working
                this.isInitialized = true;
                console.log('✅ Firestore reconnection successful');
                return true;
            } catch (error) {
                console.log('❌ Firestore reconnection failed:', error.message);
                return false;
            }
        }
        return false;
    }

    /**
     * Check if should attempt reconnection (call this periodically)
     */
    shouldAttemptReconnection() {
        return this.firestore && !this.isInitialized && this.isUserLoggedIn();
    }
}
