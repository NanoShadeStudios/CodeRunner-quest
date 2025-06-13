/**
 * Game Constants and Configuration
 */

export const GAME_CONFIG = {
    // Canvas settings
    CANVAS_ID: 'gameCanvas',
    
    // World settings
    TILE_SIZE: 32,
    CHUNK_WIDTH: 16,
    CHUNK_HEIGHT: 12,
    WORLD_SPEED: 120,
    
    // Generation settings
    GENERATION_DISTANCE: 3,
    CLEANUP_DISTANCE: 5,
    
    // Physics constants
    GRAVITY: 800,
    MAX_FALL_SPEED: 400,
      // Player settings
    PLAYER_WIDTH: 24,
    PLAYER_HEIGHT: 32,
    MOVE_SPEED: 180,
    JUMP_POWER: -360,
    FRICTION: 0.85,
    AIR_RESISTANCE: 0.98,
    
    // Health system
    PLAYER_HEALTH: 3,
    MAX_HEALTH: 3,
    INVULNERABILITY_DURATION: 1500,
    
    // Game over
    GAME_OVER_FADE_DURATION: 1500,
    
    // Upgrade system
    UPGRADE_COSTS: {
        JUMP_HEIGHT: 50,
        SCORE_MULTIPLIER: 75,
        POWER_UP_DURATION: 60
    },
    
    UPGRADE_VALUES: {
        JUMP_HEIGHT_INCREASE: 50,
        SCORE_MULTIPLIER_INCREASE: 0.25,
        POWER_UP_DURATION_INCREASE: 2000
    },
    
    // Generation probabilities
    FLOOR_BASE_CHANCE: 70,
    GAP_CHANCE: 15,
    SPIKE_CHANCE: 15,
    GLITCH_CHANCE: 8,
    PLATFORM_CHANCE: 12,
    MIN_FLOOR_STREAK: 2,
    MAX_GAP_SIZE: 3,
    SPIKE_MIN_DISTANCE: 3
};

export const TILE_TYPES = {
    EMPTY: 0,
    FLOOR: 1,
    GAP: 2,
    SPIKE: 3,
    GLITCH: 4,
    PLATFORM: 5,
    DATA_PACKET: 6
};

export const GAME_STATES = {
    INITIALIZING: 'initializing',
    DIFFICULTY_SELECT: 'difficultySelect',
    CHANGELOG: 'changelog',
    LEADERBOARD: 'leaderboard',
    RESET_CONFIRM: 'resetConfirm',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

export const DIFFICULTY_LEVELS = {
    EASY: {
        name: 'Easy',
        emoji: '🔹',
        description: 'Fast regeneration - Perfect for beginners',
        healthRegenInterval: 60000, // 1 minute
        color: '#40d158'
    },
    MEDIUM: {
        name: 'Medium',
        emoji: '🔸',
        description: 'Moderate regeneration - Balanced challenge',
        healthRegenInterval: 180000, // 3 minutes
        color: '#ffd700'
    },
    HARD: {
        name: 'Hard',
        emoji: '🔴',
        description: 'Slow regeneration - For experienced players',
        healthRegenInterval: 420000, // 7 minutes
        color: '#ff6b35'
    },
    EXTREME: {
        name: 'Extreme',
        emoji: '❌',
        description: 'No regeneration - Ultimate survival challenge',
        healthRegenInterval: 0, // Never
        color: '#f85149'
    }
};

export const PLAYER_MODES = {
    LIVE: 'live',
    DEBUG: 'debug'
};

export const COLORS = {
    // Floor colors
    FLOOR_MAIN: '#21262d',
    FLOOR_HIGHLIGHT: '#30363d',
    FLOOR_BORDER: '#161b22',
    
    // Platform colors
    PLATFORM_BASE: '#238636',
    PLATFORM_HIGHLIGHT: '#2ea043',
    PLATFORM_DETAILS: '#1f2328',
    PLATFORM_INDICATOR: '#3fb950',
    
    // Spike colors
    SPIKE_BASE: 'rgba(248, 81, 73, {alpha})',
    SPIKE_POINTS: 'rgba(255, 100, 90, {alpha})',
    
    // Glitch colors
    GLITCH_BASE: 'rgba(165, 243, 252, {alpha})',
    GLITCH_PATTERN: 'rgba(103, 232, 249, {alpha})',
    GLITCH_NOISE: 'rgba(8, 145, 178, {alpha})',
      // Player colors
    PLAYER_LIVE: '#58a6ff'
};
