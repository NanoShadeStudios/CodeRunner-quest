/**
 * Input Manager - Centralized input handling
 */

export class InputManager {    constructor() {        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false,
            x: false,
            shift: false
        };this.callbacks = {
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
            deleteEntry: null,            changeName: null,
            fullscreen: null,
            continue: null,
            shop: null,
            shopScrollUp: null,
            shopScrollDown: null
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
    }    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Handle text input for name entry
        document.addEventListener('keypress', (e) => this.handleKeyPress(e));
            // Prevent default behavior for game keys, but not when in name input mode
        document.addEventListener('keydown', (e) => {
            const isInNameInput = this.isNameInputActive && this.isNameInputActive();
            const isTypingInField = this.isTypingInInputField();            
            // Only prevent default if not in name input mode AND not typing in any input field
            if (!isInNameInput && !isTypingInField) {
                // Get all keybinds and check if this key is bound to any action
                if (window.keybindManager) {
                    const actions = window.keybindManager.getActionsForKey(e.code);
                    if (actions.length > 0) {
                        e.preventDefault();
                    }
                } else {
                    // Fallback to hardcoded keys if keybind manager not available
                    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyU', 'KeyC', 'KeyL', 'KeyE', 'KeyF', 'KeyQ', 'KeyX', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
                        e.preventDefault();
                    }
                }
            }
        });
    }handleKeyDown(e) {
        // If we're in name input mode or typing in any input field, only handle special keys
        const isInNameInput = this.isNameInputActive && this.isNameInputActive();
        const isTypingInField = this.isTypingInInputField();
        
        // Get actions for this key from keybind manager
        const actions = window.keybindManager ? window.keybindManager.getActionsForKey(e.code) : [];
        
        // Handle movement keys (continuous input)
        if (!isInNameInput && !isTypingInField) {
            if (actions.includes('left')) {
                this.keys.left = true;
            }
            if (actions.includes('right')) {
                this.keys.right = true;
            }
            if (actions.includes('up')) {
                this.keys.up = true;
                // Handle shop scroll up
                if (this.callbacks.shopScrollUp) this.callbacks.shopScrollUp();
            }
            if (actions.includes('down')) {
                this.keys.down = true;
                // Handle shop scroll down
                if (this.callbacks.shopScrollDown) this.callbacks.shopScrollDown();
            }
            if (actions.includes('space')) {
                this.keys.space = true;
            }
            if (actions.includes('x')) {
                this.keys.x = true;
            }
            if (actions.includes('shift')) {
                this.keys.shift = true;
            }
        }

        // Handle action keys (single press)
        if (actions.includes('confirm') && this.callbacks.confirm) {
            this.callbacks.confirm();
        }
        if (!isInNameInput && !isTypingInField) {
            if (actions.includes('pause') && this.callbacks.pause) {
                this.callbacks.pause();
            }
            if (actions.includes('restart') && this.callbacks.restart) {
                this.callbacks.restart();
            }
            if (actions.includes('continue')) {
                if (this.callbacks.continue) this.callbacks.continue();
                if (this.callbacks.changelog) this.callbacks.changelog();
            }
            if (actions.includes('leaderboard') && this.callbacks.leaderboard) {
                this.callbacks.leaderboard();
            }
            if (actions.includes('uploadScore') && this.callbacks.uploadScore) {
                this.callbacks.uploadScore();
            }
            if (actions.includes('fullscreen') && this.callbacks.fullscreen) {
                this.callbacks.fullscreen();
            }
            if (actions.includes('changeName') && this.callbacks.changeName) {
                this.callbacks.changeName();
            }
            if (actions.includes('shop') && this.callbacks.shop) {
                this.callbacks.shop();
            }
            if (actions.includes('togglePerformance') && this.callbacks.togglePerformance) {
                this.callbacks.togglePerformance();
            }
            if (actions.includes('deleteEntry') && this.callbacks.deleteEntry) {
                this.callbacks.deleteEntry();
            }
        }
        if (actions.includes('skip') && this.callbacks.skip) {
            this.callbacks.skip();
        }
        if (actions.includes('backspace') && this.callbacks.backspace) {
            this.callbacks.backspace();
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
        // Get actions for this key from keybind manager
        const actions = window.keybindManager ? window.keybindManager.getActionsForKey(e.code) : [];
        
        // Handle key releases for continuous input keys
        if (actions.includes('left')) {
            this.keys.left = false;
        }
        if (actions.includes('right')) {
            this.keys.right = false;
        }
        if (actions.includes('up')) {
            this.keys.up = false;
        }
        if (actions.includes('down')) {
            this.keys.down = false;
        }
        if (actions.includes('space')) {
            this.keys.space = false;
        }
        if (actions.includes('x')) {
            this.keys.x = false;
        }
        if (actions.includes('shift')) {
            this.keys.shift = false;
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
