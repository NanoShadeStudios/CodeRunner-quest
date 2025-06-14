class AudioSystem {    constructor() {
       
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.musicMode = 'chill'; // 'chill' or 'intense'
        this.fadeTimeout = null;
        
       
        
        // Load settings from localStorage
      
        this.loadSettings();
        
        
        
        // Initialize audio context for better compatibility
        this.audioContext = null;
        this.initAudioContext();
        
        // Preload all audio assets
     
        this.preloadAudio();
        
      
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          
        }
    }
      preloadAudio() {
        // Sound effects
        const soundEffects = {
            jump: this.createSynthSound('jump'),
            doubleJump: this.createSynthSound('doubleJump'),
            death: this.createSynthSound('death'),
            collect: this.createSynthSound('collect'),
            menuClick: this.createSynthSound('menuClick'),
            menuOpen: this.createSynthSound('menuOpen'),
            menuClose: this.createSynthSound('menuClose'),
            purchase: this.createSynthSound('purchase'),
            damage: this.createSynthSound('damage'),
            powerup: this.createSynthSound('powerup')
        };
          // Load sound effects
        Object.entries(soundEffects).forEach(([name, audioData]) => {
            this.sounds[name] = this.createAudioElement(audioData.dataUrl);
        });
        
        // Available music tracks
        this.availableTracks = [
            { 
                name: 'Arcade Classic', 
                filename: 'that-game-arcade-short-236108.mp3',
                description: 'Classic arcade vibes' 
            },
            { 
                name: 'Chill Synthwave', 
                filename: 'chill-synthwave-background-track-341854.mp3',
                description: 'Relaxing synthwave beats' 
            },
            { 
                name: 'Chipmusic Dancer', 
                filename: 'chipmusic-box-dancer-lofi-retro-retrowave-chiptune-synth-dance-157475.mp3',
                description: 'Energetic chiptune dance' 
            },
            { 
                name: 'Distant Echoes', 
                filename: 'distant-echoes-5339.mp3',
                description: 'Atmospheric ambient' 
            },
            { 
                name: 'Futuristic Action', 
                filename: 'futuristic-action-cinematic-electronic-loop-291807.mp3',
                description: 'High-energy cinematic' 
            },
            { 
                name: 'Lounge Retro Wave', 
                filename: 'lounge-retro-wave-186444.mp3',
                description: 'Smooth retro lounge' 
            },
            { 
                name: 'Nostalgic Synth Pop', 
                filename: 'nostalgic-motivating-retro-synth-wave-pop-250555.mp3',
                description: 'Motivating retro pop' 
            }        ];
        
        // Set default track, then check if we have a saved preference
        this.selectedTrack = this.availableTracks[0].filename;
        
        // Load saved track preference if available
        try {
            const saved = localStorage.getItem('coderunner_audio_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.selectedTrack) {
                    // Verify the saved track exists in available tracks
                    const trackExists = this.availableTracks.some(track => track.filename === settings.selectedTrack);
                    if (trackExists) {
                        this.selectedTrack = settings.selectedTrack;
                    }
                }
            }
        } catch (e) {
           
        }
        
        // Load the selected music track
        this.loadMusicTrack(this.selectedTrack);
        
        // Set initial volumes
        this.updateAllVolumes();
    }
    
    loadMusicTrack(filename) {
        const musicPath = `Music/${filename}`;
        const backgroundMusic = this.createAudioElement(musicPath, true);
        
        // Use the same track for both music modes
        this.music.chill = backgroundMusic;
        this.music.intense = backgroundMusic;
        
        // Update selected track
        this.selectedTrack = filename;
        this.saveSettings();
    }
    
    switchTrack(filename) {
        if (this.selectedTrack === filename) return;
        
        const wasPlaying = this.currentMusic && !this.currentMusic.paused;
        const currentTime = this.currentMusic ? this.currentMusic.currentTime : 0;
        
        // Stop current music
        this.stopMusic();
        
        // Load new track
        this.loadMusicTrack(filename);
        
        // Resume playing if music was playing before
        if (wasPlaying && !this.isMuted) {
            setTimeout(() => {
                this.playMusic(this.musicMode);
                // Don't try to restore time as it's a different track
            }, 100);
        }
    }
    
    getAvailableTracks() {
        return this.availableTracks;
    }
    
    getCurrentTrack() {
        return this.selectedTrack;
    }
    
    createSynthSound(type) {
        if (!this.audioContext) {
            return { dataUrl: '' };
        }
        
        const sampleRate = 44100;
        let duration, frequency, waveType, envelope;
        
        switch (type) {
            case 'jump':
                duration = 0.2;
                frequency = 440;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 };
                break;
            case 'doubleJump':
                duration = 0.25;
                frequency = 660;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.05, sustain: 0.4, release: 0.2 };
                break;
            case 'death':
                duration = 0.8;
                frequency = 220;
                waveType = 'sawtooth';
                envelope = { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 };
                break;
            case 'collect':
                duration = 0.3;
                frequency = 800;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 };
                break;
            case 'menuClick':
                duration = 0.1;
                frequency = 600;
                waveType = 'square';
                envelope = { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 };
                break;
            case 'menuOpen':
                duration = 0.3;
                frequency = 523;
                waveType = 'sine';
                envelope = { attack: 0.05, decay: 0.1, sustain: 0.4, release: 0.15 };
                break;
            case 'menuClose':
                duration = 0.25;
                frequency = 392;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.14 };
                break;
            case 'purchase':
                duration = 0.5;
                frequency = 880;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 };
                break;
            case 'damage':
                duration = 0.4;
                frequency = 150;
                waveType = 'sawtooth';
                envelope = { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.25 };
                break;
            case 'powerup':
                duration = 0.6;
                frequency = 1047;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 };
                break;
            default:
                duration = 0.2;
                frequency = 440;
                waveType = 'sine';
                envelope = { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 };
        }
        
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // Generate wave
            let sample = 0;
            switch (waveType) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                    break;
            }
            
            // Apply envelope
            let amplitude = 0;
            const attackTime = envelope.attack * duration;
            const decayTime = envelope.decay * duration;
            const releaseTime = envelope.release * duration;
            const sustainTime = duration - attackTime - decayTime - releaseTime;
            
            if (t < attackTime) {
                amplitude = t / attackTime;
            } else if (t < attackTime + decayTime) {
                amplitude = 1 - (1 - envelope.sustain) * (t - attackTime) / decayTime;
            } else if (t < attackTime + decayTime + sustainTime) {
                amplitude = envelope.sustain;
            } else {
                amplitude = envelope.sustain * (1 - (t - attackTime - decayTime - sustainTime) / releaseTime);
            }
            
            data[i] = sample * amplitude * 0.3; // Overall volume adjustment
        }
        
        // Convert buffer to data URL
        const wav = this.bufferToWav(buffer);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const dataUrl = URL.createObjectURL(blob);
        
        return { dataUrl };
    }
    
    bufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Convert samples
        const data = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return arrayBuffer;
    }
      // Note: Removed createBackgroundMusic method as we now use MP3 file instead of procedurally generated music
    
    createAudioElement(src, loop = false) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.preload = 'auto';
        return audio;
    }
    
    playSound(soundName, volumeOverride = null) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.volume = (volumeOverride || this.sfxVolume) * this.masterVolume;
        
        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
              
            });
        }
    }
      playMusic(mode = 'chill') {
        if (this.isMuted || !this.music[mode]) return;
        
        // Stop current music
        this.stopMusic();
        
        this.musicMode = mode;
        this.currentMusic = this.music[mode];
        this.currentMusic.volume = this.musicVolume * this.masterVolume;
        
        // Set playback rate based on music mode (faster for intense mode)
        this.currentMusic.playbackRate = mode === 'intense' ? 1.1 : 1.0;
        
        const playPromise = this.currentMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
             
                
                // If autoplay fails (common in browsers), try again after user interaction
                const resumeAudio = () => {
                    this.currentMusic.play().then(() => {
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('keydown', resumeAudio);
                    }).catch;
                };
                
                document.addEventListener('click', resumeAudio, { once: true });
                document.addEventListener('keydown', resumeAudio, { once: true });
            });
        }
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }
      switchMusicMode(newMode) {
        if (newMode === this.musicMode || !this.music[newMode]) return;
        
        const fadeOutDuration = 1000; // 1 second
        const fadeInDuration = 1000;
        
        // Save the current position to continue from the same point
        const currentTime = this.currentMusic ? this.currentMusic.currentTime : 0;
        
        if (this.currentMusic) {
            this.fadeOut(this.currentMusic, fadeOutDuration, () => {
                this.playMusic(newMode);
                
                // Set the playback rate based on music mode
                if (this.currentMusic) {
                    this.currentMusic.playbackRate = newMode === 'intense' ? 1.1 : 1.0;
                    
                    // Try to continue from the same position if possible
                    if (currentTime > 0) {
                        this.currentMusic.currentTime = currentTime;
                    }
                }
                
                this.fadeIn(this.currentMusic, fadeInDuration);
            });
        } else {
            this.playMusic(newMode);
            
            // Set the playback rate based on music mode
            if (this.currentMusic) {
                this.currentMusic.playbackRate = newMode === 'intense' ? 1.1 : 1.0;
            }
        }
    }
    
    fadeOut(audio, duration, callback) {
        const startVolume = audio.volume;
        const fadeStep = startVolume / (duration / 50);
        
        const fade = setInterval(() => {
            if (audio.volume > fadeStep) {
                audio.volume -= fadeStep;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fade);
                if (callback) callback();
            }
        }, 50);
    }
    
    fadeIn(audio, duration) {
        const targetVolume = this.musicVolume * this.masterVolume;
        const fadeStep = targetVolume / (duration / 50);
        audio.volume = 0;
        
        const fade = setInterval(() => {
            if (audio.volume < targetVolume - fadeStep) {
                audio.volume += fadeStep;
            } else {
                audio.volume = targetVolume;
                clearInterval(fade);
            }
        }, 50);
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }
      setMusicVolume(volume) {
       
        this.musicVolume = Math.max(0, Math.min(1, volume));
       
        this.updateAllVolumes();
        this.saveSettings();
    }
    
    updateAllVolumes() {
        // Update SFX volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound.volume !== undefined) {
                sound.volume = this.sfxVolume * this.masterVolume;
            }
        });
        
        // Update music volume
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.playMusic(this.musicMode);
        }
        
        this.saveSettings();
        return this.isMuted;
    }    saveSettings() {
        const settings = {
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            musicMode: this.musicMode,
            selectedTrack: this.selectedTrack,
            timestamp: Date.now() // Add timestamp for conflict resolution
        };
        
     
        try {
            localStorage.setItem('coderunner_audio_settings', JSON.stringify(settings));
           
        } catch (e) {
            console.error('🎵 Failed to save audio settings:', e);
        }
    }loadSettings() {
        console.log('🎵 loadSettings() called (no parameters) - Loading from localStorage...');
        this.loadSettingsFromLocalStorage();
        console.log('🎵 loadSettings() finished with volumes:', {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume
        });
    }
      loadSettingsFromLocalStorage() {
        console.log('🎵 loadSettingsFromLocalStorage() called');
        try {
            const saved = localStorage.getItem('coderunner_audio_settings');
            console.log('🎵 Raw saved settings from localStorage:', saved);
            if (saved) {
                const settings = JSON.parse(saved);
                console.log('🎵 Parsed settings from localStorage:', settings);
                
                console.log('🎵 BEFORE applying settings:', {
                    masterVolume: this.masterVolume,
                    sfxVolume: this.sfxVolume,
                    musicVolume: this.musicVolume
                });
                
                this.isMuted = settings.isMuted || false;
                this.masterVolume = settings.masterVolume ?? 0.7;
                this.sfxVolume = settings.sfxVolume ?? 0.8;
                this.musicVolume = settings.musicVolume ?? 0.5;
                this.musicMode = settings.musicMode || 'chill';
                this.selectedTrack = settings.selectedTrack || this.availableTracks[0].filename;
                
                console.log('🎵 AFTER applying settings:', {
                    masterVolume: this.masterVolume,
                    sfxVolume: this.sfxVolume,
                    musicVolume: this.musicVolume
                });
            } else {
                console.log('🎵 No saved settings found, using defaults');
            }
        } catch (e) {
            console.warn('🎵 Failed to load audio settings:', e);        }
    }
    
    /**
     * Get current audio settings for saving to cloud/localStorage
     */
    getSettings() {
        return {
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            musicMode: this.musicMode,
            selectedTrack: this.selectedTrack,
            timestamp: Date.now()
        };
    }

    /**
     * Load settings from unified save system
     */
    loadSettings(settingsData) {
        console.log('🎵 loadSettings(settingsData) called with data:', settingsData);
        try {
            if (settingsData && typeof settingsData === 'object') {
                // Check if we have more recent direct localStorage settings
                const directSettings = localStorage.getItem('coderunner_audio_settings');
                let useDirectSettings = false;
                  if (directSettings) {
                    try {
                        const parsed = JSON.parse(directSettings);
                        console.log('🎵 Direct localStorage timestamp:', parsed.timestamp);
                        console.log('🎵 Unified save timestamp:', settingsData.timestamp);
                        
                        // If unified save data doesn't have a timestamp or is older, use direct settings
                        if (!settingsData.timestamp || 
                            (parsed.timestamp && parsed.timestamp > (settingsData.timestamp || 0))) {
                            console.log('🎵 Using direct localStorage audio settings (more recent than unified save)');
                            console.log('🎵 Direct settings values:', {
                                masterVolume: parsed.masterVolume,
                                sfxVolume: parsed.sfxVolume,
                                musicVolume: parsed.musicVolume
                            });
                            useDirectSettings = true;
                        } else {
                            console.log('🎵 Unified save is more recent, will use unified settings');
                        }
                    } catch (e) {
                        // If parsing fails, fall back to unified settings
                        console.log('🎵 Failed to parse direct settings, using unified:', e);
                    }
                }
                
                if (!useDirectSettings) {
                    console.log('🎵 Loading audio settings from unified save system');
                    console.log('🎵 BEFORE applying unified settings:', {
                        masterVolume: this.masterVolume,
                        sfxVolume: this.sfxVolume,
                        musicVolume: this.musicVolume
                    });
                    
                    this.isMuted = settingsData.isMuted ?? this.isMuted;
                    this.masterVolume = settingsData.masterVolume ?? this.masterVolume;
                    this.sfxVolume = settingsData.sfxVolume ?? this.sfxVolume;
                    this.musicVolume = settingsData.musicVolume ?? this.musicVolume;
                    this.musicMode = settingsData.musicMode || this.musicMode;
                    this.selectedTrack = settingsData.selectedTrack || this.selectedTrack;
                    
                    console.log('🎵 AFTER applying unified settings:', {
                        masterVolume: this.masterVolume,
                        sfxVolume: this.sfxVolume,
                        musicVolume: this.musicVolume
                    });
                    
                    // Save to the direct localStorage key for consistency
                    this.saveSettings();
                } else {
                    // Load from direct localStorage (already loaded in constructor)
                    console.log('🎵 Using direct localStorage instead of unified save');
                    this.loadSettingsFromLocalStorage();
                }
            }
        } catch (e) {
            console.warn('🎵 Failed to load audio settings from unified save:', e);
        }
    }

    // Convenience methods for game events
    onJump() {
        this.playSound('jump');
    }
    
    onDoubleJump() {
        this.playSound('doubleJump');
    }
    
    onDeath() {
        this.playSound('death');
        this.switchMusicMode('chill'); // Reset to chill mode on death
    }
    
    onCollect() {
        this.playSound('collect');
    }
    
    onMenuClick() {
        this.playSound('menuClick');
    }
    
    onMenuOpen() {
        this.playSound('menuOpen');
    }
    
    onMenuClose() {
        this.playSound('menuClose');
    }
    
    onPurchase() {
        this.playSound('purchase');
    }
    
    onDamage() {
        this.playSound('damage');
    }
    
    onPowerup() {
        this.playSound('powerup');
    }
      // Dynamic music based on game state
    updateMusicForGameState(gameState) {
        if (gameState.difficulty > 2.0 || gameState.health <= 1) {
            this.switchMusicMode('intense');
        } else {
            this.switchMusicMode('chill');
        }
    }

    // Debug helper function
    clearAllAudioStorage() {
        localStorage.removeItem('coderunner_audio_settings');
        localStorage.removeItem('coderunner_save_data');
        console.log('🎵 Cleared all audio storage');
    }
}

// Export for use in other modules
window.AudioSystem = AudioSystem;

// Debug helper for testing
window.debugAudio = {
    clearStorage: () => {
        localStorage.removeItem('coderunner_audio_settings');
        localStorage.removeItem('coderunner_save_data');
        console.log('🎵 Cleared all audio storage');
    },
    getDirectSettings: () => {
        const saved = localStorage.getItem('coderunner_audio_settings');
        return saved ? JSON.parse(saved) : null;
    },
    getUnifiedSettings: () => {
        const saved = localStorage.getItem('coderunner_save_data');
        if (saved) {
            const data = JSON.parse(saved);
            return data.audioSettings || null;
        }
        return null;
    },
    getCurrentValues: () => {
        if (window.audioSystem) {
            return {
                masterVolume: window.audioSystem.masterVolume,
                sfxVolume: window.audioSystem.sfxVolume,
                musicVolume: window.audioSystem.musicVolume
            };
        }
        return null;
    }
};
