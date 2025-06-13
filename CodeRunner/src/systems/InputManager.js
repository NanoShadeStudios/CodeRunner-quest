/**
 * Input Manager - Centralized input handling
 */

export class InputManager {
    constructor() {        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false        };        this.callbacks = {
            pause: null,
            restart: null,
            confirm: null,
            skip: null,
            changelog: null,
            togglePerformance: null,
            difficultySelect: null,
            leaderboard: null,
            uploadScore: null,
            textInput: null,
            backspace: null,
            deleteEntry: null,
            changeName: null,
            fullscreen: null
        };
        
        // Add reference to check for text input mode
        this.isNameInputActive = null;
        
        this.setupEventListeners();
    }
      /**
     * Set a function to check if name input is active
     */
    setNameInputChecker(checker) {
        this.isNameInputActive = checker;
    }

    /**
     * Check if user is currently typing in any input field
     */
    isTypingInInputField() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }
      setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Handle text input for name entry
        document.addEventListener('keypress', (e) => this.handleKeyPress(e));
            // Prevent default behavior for game keys, but not when in name input mode
        document.addEventListener('keydown', (e) => {
            const isInNameInput = this.isNameInputActive && this.isNameInputActive();
            const isTypingInField = this.isTypingInInputField();
                // Only prevent default if not in name input mode AND not typing in any input field
            if (!isInNameInput && !isTypingInField && ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyU', 'KeyC', 'KeyL', 'KeyE', 'KeyF'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }    handleKeyDown(e) {
        // If we're in name input mode or typing in any input field, only handle special keys
        const isInNameInput = this.isNameInputActive && this.isNameInputActive();
        const isTypingInField = this.isTypingInInputField();
        
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                if (!isInNameInput && !isTypingInField) {
                    this.keys.left = true;
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (!isInNameInput && !isTypingInField) {
                    this.keys.right = true;
                    // Handle D key for difficulty selection when in game over state
                    if (e.code === 'KeyD' && this.callbacks.difficultySelect) {
                        this.callbacks.difficultySelect();
                    }
                }
                break;            case 'ArrowUp':
            case 'KeyW':
                if (!isInNameInput && !isTypingInField) {
                    this.keys.up = true;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (!isInNameInput && !isTypingInField) {
                    this.keys.down = true;
                }
                break;
            case 'Space':
                if (!isInNameInput && !isTypingInField) {
                    this.keys.space = true;
                    if (this.callbacks.confirm) this.callbacks.confirm();
                }
                break;
            case 'Enter':
                if (this.callbacks.confirm) this.callbacks.confirm();                break;
            case 'KeyP':
                if (!isInNameInput && !isTypingInField && this.callbacks.pause) this.callbacks.pause();
                break;
            case 'KeyR':
                if (!isInNameInput && !isTypingInField && this.callbacks.restart) this.callbacks.restart();
                break;
            case 'KeyC':
                if (!isInNameInput && !isTypingInField && this.callbacks.changelog) this.callbacks.changelog();
                break;
            case 'KeyL':
                if (!isInNameInput && !isTypingInField && this.callbacks.leaderboard) this.callbacks.leaderboard();
                break;            case 'KeyE':
                if (!isInNameInput && !isTypingInField && this.callbacks.uploadScore) this.callbacks.uploadScore();
                break;
            case 'KeyF':
                if (!isInNameInput && !isTypingInField && this.callbacks.fullscreen) this.callbacks.fullscreen();
                break;
            case 'Escape':
                if (this.callbacks.skip) this.callbacks.skip();
                break;            case 'F3':
                if (!isInNameInput && !isTypingInField && this.callbacks.togglePerformance) this.callbacks.togglePerformance();
                break;case 'Backspace':
                if (this.callbacks.backspace) this.callbacks.backspace();
                break;
            case 'Delete':
                if (!isInNameInput && !isTypingInField && this.callbacks.deleteEntry) this.callbacks.deleteEntry();
                break;
            case 'KeyN':
                if (!isInNameInput && !isTypingInField && this.callbacks.changeName) this.callbacks.changeName();
                break;
        }
    }handleKeyPress(e) {
        // Only handle text input if we're in name input mode
        const isInNameInput = this.isNameInputActive && this.isNameInputActive();
        
        if (isInNameInput && this.callbacks.textInput) {
            const char = e.key;
            // Allow letters, numbers, spaces, and common symbols
            if (/^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(char)) {
                this.callbacks.textInput(char);
            }
        }
    }
    
    handleKeyUp(e) {
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = false;
                break;            case 'Space':
                this.keys.space = false;
                break;
            case 'Enter':
                // Enter key doesn't need to set a continuous state
                break;
        }
    }
    
    setCallback(event, callback) {
        this.callbacks[event] = callback;
    }
      getKeys() {
        return { ...this.keys };
    }

    /**
     * Clear all input states - useful when transitioning between game states
     */
    clearInputs() {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
    }
}
