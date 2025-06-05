/**
 /**
 * Player - Digital Explorer character
 */

import { GAME_CONFIG, COLORS } from '../utils/constants.js';

export class Player {
    constructor(x, y, game = null, upgrades = null) {
        if (isNaN(x) || isNaN(y)) {
            x = isNaN(x) ? 0 : x;  // Fallback to safe x
            y = isNaN(y) ? 256 : y;  // Fallback to safe y
        }
        
        this.x = x;
        this.y = y;
        this.game = game; // Add reference to game for score updates and upgrade system
        this.width = GAME_CONFIG.PLAYER_WIDTH;
        this.height = GAME_CONFIG.PLAYER_HEIGHT;
        
        // Apply upgrade bonuses
        this.upgrades = upgrades || { jumpHeight: 0, scoreMultiplier: 1.0, powerUpDuration: 0 };
        this.baseJumpPower = GAME_CONFIG.JUMP_POWER;
        this.jumpPower = this.baseJumpPower + this.upgrades.jumpHeight; // More positive = higher jump (fixed)
        
        // Shop upgrade properties
        this.shopUpgrades = {
            // Movement upgrades
            doubleJump: false,
            shield: false,
            shieldActive: false,
            magnet: false,
            hoverBoots: false,
            isHovering: false,
            extraHealth: 0,
            
            // Score & Data Pack upgrades
            datapackMultiplier: 1.0,
            scoreMultiplier: 1.0,
            comboBonus: 1.0,
            streakSaver: false,
            
            // Game-changing mechanics
            allyDrone: false,
            extraLane: false,
            
            // Revive/Retry upgrades
            secondChance: false,
            rewind: false,
            
            // Cosmetic unlocks
            trailEffects: false,
            glowingOutfit: false,
            customAnimations: false
        };
        
        this.vx = 0;
        this.vy = 0;
        this.onGround = true; // Start on ground to prevent immediate falling
        this.isJumping = false;
        this.isPressingDown = false;
        
        // Optimized jump state tracking
        this.jumpState = {
            wasPressed: false,        // Previous frame jump key state
            justPressed: false,       // Jump key pressed this frame
            doubleJumpAvailable: true, // Can perform double jump
            airTime: 0,              // Time spent in air (for coyote time)
            lastJumpTime: 0          // Last time jump was performed
        };
        
        this.health = GAME_CONFIG.PLAYER_HEALTH + this.shopUpgrades.extraHealth;
        this.maxHealth = this.health;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.lastHitTime = 0;
          this.animationFrame = 0;
        this.animationTime = 0;        this.facingDirection = 1; // 1 = right, -1 = left
        this.damageTexts = [];
    }update(deltaTime, inputKeys, world, physicsEngine) {
        const deltaSeconds = deltaTime / 1000;
        this.animationTime += deltaTime;
          this.updateHealthSystem(deltaTime);
        this.updateDamageTexts(deltaTime);
        
        this.isPressingDown = inputKeys.down;
          if (this.isPressingDown && this.onGround && world) {
            const collision = physicsEngine.checkCollision(this.x, this.y + 1, this.width, this.height, 1, false);
            if (collision.collision && collision.tileType === world.TILE_TYPES?.PLATFORM) {
                this.vy = 50;
                this.onGround = false;
            }
        }          this.updateMovement(deltaSeconds, inputKeys);
        this.updateJumping(inputKeys);
        this.updatePhysics(deltaSeconds, physicsEngine);        // Check for collectibles
        if (physicsEngine && this.game) {
            const collected = physicsEngine.checkCollectibles(this.x, this.y, this.width, this.height, this.game);
            if (collected.length > 0) {
                this.handleCollectibles(collected);
            }
        }
        
        if (physicsEngine) {
            const hazard = physicsEngine.checkHazards(this);
            if (hazard.hazard) {
                this.handleHazard(hazard);
            }
        }
    }    updateMovement(deltaSeconds, inputKeys) {
        let moveInput = 0;
          if (inputKeys.left) moveInput -= 1;
        if (inputKeys.right) moveInput += 1;
        
        if (moveInput !== 0) {
            // Apply normal movement speed (no speed boost multiplier)
            const velocityChange = moveInput * GAME_CONFIG.MOVE_SPEED * deltaSeconds * 4;
            this.vx += velocityChange;
            const maxSpeed = GAME_CONFIG.MOVE_SPEED;
            this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
        }
          // Apply appropriate friction/resistance
        if (this.onGround) {
            this.vx *= GAME_CONFIG.FRICTION;
        } else {
            this.vx *= GAME_CONFIG.AIR_RESISTANCE;
        }
          // Prevent micro-movements that cause jitter
        if (Math.abs(this.vx) < 1.0) {
            this.vx = 0;
        }
    }    updateJumping(inputKeys) {
        const jumpPressed = inputKeys.space || inputKeys.up;
        const currentTime = Date.now();
        
        // Update jump state efficiently
        this.jumpState.justPressed = jumpPressed && !this.jumpState.wasPressed;
        this.jumpState.wasPressed = jumpPressed;
        
        // Coyote time - allow jump shortly after leaving ground
        const coyoteTime = 100; // 100ms grace period
        const canCoyoteJump = !this.onGround && this.jumpState.airTime < coyoteTime && this.jumpState.doubleJumpAvailable;
        
        if (this.jumpState.justPressed) {
            if (this.onGround || canCoyoteJump) {
                // Regular jump or coyote jump
                this.performJump();
                this.jumpState.lastJumpTime = currentTime;
            } else if (!this.onGround && this.shopUpgrades.doubleJump && this.jumpState.doubleJumpAvailable) {
                // Double jump - only if available and not on ground
                this.performDoubleJump();
                this.jumpState.lastJumpTime = currentTime;
            }
        }
        
        // Track air time for coyote time
        if (!this.onGround) {
            this.jumpState.airTime += 16; // Approximate frame time
        }
    }
    
    /**
     * Perform regular jump with consistent mechanics
     */
    performJump() {
        this.vy = this.jumpPower;
        this.onGround = false;
        this.isJumping = true;
        this.jumpState.airTime = 0;
        return true;
    }
      updatePhysics(deltaSeconds, physicsEngine) {
        if (!this.onGround) {
            this.vy += GAME_CONFIG.GRAVITY * deltaSeconds;
            
            if (this.vy > GAME_CONFIG.MAX_FALL_SPEED) {
                this.vy = GAME_CONFIG.MAX_FALL_SPEED;
            }
        }
        
        if (physicsEngine) {
            physicsEngine.handleHorizontalMovement(this, deltaSeconds);
            physicsEngine.handleVerticalMovement(this, deltaSeconds);
        }
        
        // Check for NaN values and log error
        if (isNaN(this.x) || isNaN(this.y) || isNaN(this.vx) || isNaN(this.vy)) {
            console.error(`NaN DETECTED: x=${this.x}, y=${this.y}, vx=${this.vx}, vy=${this.vy}`);
        }
    }
    
    updateHealthSystem(deltaTime) {
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime < 0) {
                this.invulnerabilityTime = 0;
            }
        }
    }
    
    updateDamageTexts(deltaTime) {
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            const text = this.damageTexts[i];
            text.lifetime -= deltaTime;
            text.y -= 50 * (deltaTime / 1000);
            text.opacity = Math.max(0, text.lifetime / text.maxLifetime);
            
            if (text.lifetime <= 0) {
                this.damageTexts.splice(i, 1);
            }
        }
    }
  handleHazard(hazard) {
        switch (hazard.type) {
            case 'spike':
                this.takeDamage(1, "spikes");
                break;
            case 'fall':
                this.die("fell into the digital void");
                break;
            case 'outOfBounds':
                this.die("lost in the data stream");
                break;
        }
    }    takeDamage(amount, source) {
        if (this.invulnerabilityTime > 0) return;
        
        this.health -= amount;
        this.invulnerabilityTime = GAME_CONFIG.INVULNERABILITY_DURATION;
        this.lastDamageTime = Date.now();
        
        this.damageTexts.push({
            text: `-${amount}`,
            x: this.x + this.width / 2,
            y: this.y,
            lifetime: 1500,
            maxLifetime: 1500,
            opacity: 1,
            color: '#ff4444'
        });
        
        if (this.health <= 0) {
            this.die(source);
        }
    }
      die(reason) {
        if (this.game) {
            this.game.gameOver(reason);
        }
    }

    /**
     * Create a floating heal text indicator
     */
    createHealText(amount) {
        this.damageTexts.push({
            text: `+${amount} ❤️`,
            x: this.x + this.width / 2,
            y: this.y,
            lifetime: 1500,
            maxLifetime: 1500,
            opacity: 1,
            color: 'heal'
        });
    }
    
    /**
     * Handle collected items (data packets, etc.)
     */
    handleCollectibles(collected) {
        for (const item of collected) {
            if (item.type === 'dataPacket') {
                // Create collection effect
                this.createCollectionEffect(item.worldX, item.worldY, item.points);
                
                // Update score if there's a score multiplier
                if (this.game && this.game.upgradeSystem) {
                    const bonuses = this.game.upgradeSystem.getBonuses();
                    const scoreGain = Math.floor(item.points * 10 * bonuses.scoreMultiplier);
                    this.game.score += scoreGain;
                    
                    // Show score text
                    this.createScoreText(scoreGain, item.worldX, item.worldY);
                }
            }
        }
    }
      /**
     * Create visual effect for item collection
     */
    createCollectionEffect(worldX, worldY, points) {
        // Create sparkle effect using damage text system
        this.damageTexts.push({
            text: '✨',
            x: worldX + 16,
            y: worldY + 16,
            lifetime: 800,
            maxLifetime: 800,
            opacity: 1,
            color: points > 1 ? '#9333ea' : '#10b981' // Purple for corrupted, green for normal
        });
    }
    
    /**
     * Create floating score text
     */
    createScoreText(scoreGain, worldX, worldY) {
        this.damageTexts.push({
            x: worldX + 16,
            y: worldY,
            vx: 0,
            vy: -30,
            text: `+${scoreGain}`,
            color: '#10b981',
            lifetime: 1500,
            maxLifetime: 1500,
            size: 14
        });
    }    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Draw main player body
        this.drawPlayerBody(ctx, screenX, screenY);
        
        // Draw damage text
        this.drawDamageTexts(ctx, camera);
    }    drawPlayerBody(ctx, screenX, screenY) {
        // Check if player is invulnerable and should flash
        const isFlashing = this.invulnerabilityTime > 0 && Math.floor(Date.now() / 100) % 2 === 0;
        
        // Running animation frame (3 frames)
        const isRunning = this.onGround && Math.abs(this.vx) > 10;
        const animFrame = isRunning ? Math.floor(this.animationTime * 0.008) % 3 : 0;
        
        // Add animation bob when moving
        const bob = isRunning ? Math.sin(this.animationTime * 0.01) * 1 : 0;
        const finalY = screenY + bob;
        
        // Color scheme - always use live mode colors
        let hoodColor, cloakColor, visorColor, bodyColor, shoeColor;
        
        if (isFlashing) {
            // Flash red when invulnerable
            hoodColor = '#8B1E3F';
            cloakColor = '#C42348';
            visorColor = '#FF6B6B';
            bodyColor = '#2D1B1B';
            shoeColor = '#1A1A1A';
        } else {
            // Live mode colors - darker hood with cyan visor
            hoodColor = '#2A2A2A';
            cloakColor = '#404040';
            visorColor = '#00FFFF';
            bodyColor = '#1A1A1A';
            shoeColor = '#FFD700'; // Gold shoes for contrast
        }
        
        // Add glow effect to visor
        if (!isFlashing) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = visorColor;
        }
        
        this.drawTimeRunnerSprite(ctx, screenX, finalY, animFrame, {
            hoodColor,
            cloakColor, 
            visorColor,
            bodyColor,
            shoeColor
        });
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }

    /**
     * Draw the pixel art Time Runner sprite
     */
    drawTimeRunnerSprite(ctx, x, y, animFrame, colors) {
        const scale = 1; // Scale factor for pixel art
        const p = (px, py, color = null) => {
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x + px * scale, y + py * scale, scale, scale);
            }
        };

        // Hood outline and main shape (24x32 sprite)
        // Row 0-2: Hood top
        p(8, 0, colors.hoodColor); p(9, 0, colors.hoodColor); p(10, 0, colors.hoodColor); p(11, 0, colors.hoodColor);
        p(12, 0, colors.hoodColor); p(13, 0, colors.hoodColor); p(14, 0, colors.hoodColor); p(15, 0, colors.hoodColor);
        
        p(7, 1, colors.hoodColor); p(8, 1, colors.hoodColor); p(9, 1, colors.hoodColor); p(10, 1, colors.hoodColor);
        p(11, 1, colors.hoodColor); p(12, 1, colors.hoodColor); p(13, 1, colors.hoodColor); p(14, 1, colors.hoodColor);
        p(15, 1, colors.hoodColor); p(16, 1, colors.hoodColor);
        
        p(6, 2, colors.hoodColor); p(7, 2, colors.hoodColor); p(8, 2, colors.hoodColor); p(9, 2, colors.hoodColor);
        p(10, 2, colors.hoodColor); p(11, 2, colors.hoodColor); p(12, 2, colors.hoodColor); p(13, 2, colors.hoodColor);
        p(14, 2, colors.hoodColor); p(15, 2, colors.hoodColor); p(16, 2, colors.hoodColor); p(17, 2, colors.hoodColor);

        // Row 3-5: Hood sides and visor area
        p(5, 3, colors.hoodColor); p(6, 3, colors.hoodColor); p(7, 3, colors.hoodColor); p(8, 3, colors.hoodColor);
        p(9, 3, colors.visorColor); p(10, 3, colors.visorColor); p(11, 3, colors.visorColor); p(12, 3, colors.visorColor);
        p(13, 3, colors.visorColor); p(14, 3, colors.visorColor); p(15, 3, colors.hoodColor); p(16, 3, colors.hoodColor);
        p(17, 3, colors.hoodColor); p(18, 3, colors.hoodColor);

        p(5, 4, colors.hoodColor); p(6, 4, colors.hoodColor); p(7, 4, colors.hoodColor); p(8, 4, colors.visorColor);
        p(9, 4, colors.visorColor); p(10, 4, colors.visorColor); p(11, 4, colors.visorColor); p(12, 4, colors.visorColor);
        p(13, 4, colors.visorColor); p(14, 4, colors.visorColor); p(15, 4, colors.visorColor); p(16, 4, colors.hoodColor);
        p(17, 4, colors.hoodColor); p(18, 4, colors.hoodColor);

        p(4, 5, colors.hoodColor); p(5, 5, colors.hoodColor); p(6, 5, colors.hoodColor); p(7, 5, colors.visorColor);
        p(8, 5, colors.visorColor); p(9, 5, colors.visorColor); p(10, 5, colors.visorColor); p(11, 5, colors.visorColor);
        p(12, 5, colors.visorColor); p(13, 5, colors.visorColor); p(14, 5, colors.visorColor); p(15, 5, colors.visorColor);
        p(16, 5, colors.hoodColor); p(17, 5, colors.hoodColor); p(18, 5, colors.hoodColor); p(19, 5, colors.hoodColor);

        // Row 6-8: Visor and hood lower
        p(4, 6, colors.hoodColor); p(5, 6, colors.hoodColor); p(6, 6, colors.visorColor); p(7, 6, colors.visorColor);
        p(8, 6, colors.visorColor); p(9, 6, colors.visorColor); p(10, 6, colors.visorColor); p(11, 6, colors.visorColor);
        p(12, 6, colors.visorColor); p(13, 6, colors.visorColor); p(14, 6, colors.visorColor); p(15, 6, colors.visorColor);
        p(16, 6, colors.visorColor); p(17, 6, colors.hoodColor); p(18, 6, colors.hoodColor); p(19, 6, colors.hoodColor);

        p(4, 7, colors.hoodColor); p(5, 7, colors.hoodColor); p(6, 7, colors.hoodColor); p(7, 7, colors.visorColor);
        p(8, 7, colors.visorColor); p(9, 7, colors.visorColor); p(10, 7, colors.visorColor); p(11, 7, colors.visorColor);
        p(12, 7, colors.visorColor); p(13, 7, colors.visorColor); p(14, 7, colors.visorColor); p(15, 7, colors.visorColor);
        p(16, 7, colors.hoodColor); p(17, 7, colors.hoodColor); p(18, 7, colors.hoodColor); p(19, 7, colors.hoodColor);

        p(5, 8, colors.hoodColor); p(6, 8, colors.hoodColor); p(7, 8, colors.hoodColor); p(8, 8, colors.hoodColor);
        p(9, 8, colors.visorColor); p(10, 8, colors.visorColor); p(11, 8, colors.visorColor); p(12, 8, colors.visorColor);
        p(13, 8, colors.visorColor); p(14, 8, colors.visorColor); p(15, 8, colors.hoodColor); p(16, 8, colors.hoodColor);
        p(17, 8, colors.hoodColor); p(18, 8, colors.hoodColor);

        // Row 9-15: Cloak/body
        p(6, 9, colors.cloakColor); p(7, 9, colors.cloakColor); p(8, 9, colors.cloakColor); p(9, 9, colors.cloakColor);
        p(10, 9, colors.bodyColor); p(11, 9, colors.bodyColor); p(12, 9, colors.bodyColor); p(13, 9, colors.bodyColor);
        p(14, 9, colors.cloakColor); p(15, 9, colors.cloakColor); p(16, 9, colors.cloakColor); p(17, 9, colors.cloakColor);

        for (let row = 10; row <= 14; row++) {
            p(6, row, colors.cloakColor); p(7, row, colors.cloakColor); p(8, row, colors.bodyColor); p(9, row, colors.bodyColor);
            p(10, row, colors.bodyColor); p(11, row, colors.bodyColor); p(12, row, colors.bodyColor); p(13, row, colors.bodyColor);
            p(14, row, colors.bodyColor); p(15, row, colors.bodyColor); p(16, row, colors.cloakColor); p(17, row, colors.cloakColor);
        }

        // Row 16-19: Lower body/cloak
        for (let row = 15; row <= 18; row++) {
            p(7, row, colors.cloakColor); p(8, row, colors.cloakColor); p(9, row, colors.bodyColor); p(10, row, colors.bodyColor);
            p(11, row, colors.bodyColor); p(12, row, colors.bodyColor); p(13, row, colors.bodyColor); p(14, row, colors.bodyColor);
            p(15, row, colors.cloakColor); p(16, row, colors.cloakColor);
        }

        // Row 20-23: Legs with running animation
        let leftLegOffset = 0;
        let rightLegOffset = 0;
        
        if (animFrame === 1) {
            leftLegOffset = -1;
            rightLegOffset = 1;
        } else if (animFrame === 2) {
            leftLegOffset = 1;
            rightLegOffset = -1;
        }

        // Left leg
        for (let row = 19; row <= 22; row++) {
            p(8 + leftLegOffset, row, colors.bodyColor); p(9 + leftLegOffset, row, colors.bodyColor);
        }
        
        // Right leg  
        for (let row = 19; row <= 22; row++) {
            p(13 + rightLegOffset, row, colors.bodyColor); p(14 + rightLegOffset, row, colors.bodyColor);
        }

        // Row 24-27: Feet/shoes with running animation
        // Left shoe
        p(7 + leftLegOffset, 23, colors.shoeColor); p(8 + leftLegOffset, 23, colors.shoeColor);
        p(9 + leftLegOffset, 23, colors.shoeColor); p(10 + leftLegOffset, 23, colors.shoeColor);
        
        // Right shoe
        p(12 + rightLegOffset, 23, colors.shoeColor); p(13 + rightLegOffset, 23, colors.shoeColor);
        p(14 + rightLegOffset, 23, colors.shoeColor); p(15 + rightLegOffset, 23, colors.shoeColor);

        // Foot detail for animation
        if (animFrame === 1) {
            // Left foot forward
            p(6 + leftLegOffset, 23, colors.shoeColor);
            p(6 + leftLegOffset, 24, colors.shoeColor);
        } else if (animFrame === 2) {
            // Right foot forward  
            p(16 + rightLegOffset, 23, colors.shoeColor);
            p(16 + rightLegOffset, 24, colors.shoeColor);
        }
    }

    drawDamageTexts(ctx, camera) {
        ctx.save();
        ctx.font = 'bold 14px "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", monospace';
        ctx.textAlign = 'center';
        
        for (const damageText of this.damageTexts) {
            const screenX = damageText.x - camera.x;
            const screenY = damageText.y - camera.y;
            
            // Skip if off-screen
            if (screenX < -50 || screenX > ctx.canvas.width + 50) {
                continue;
            }
            
            // Set color based on type (damage = red, heal = green)
            if (damageText.color === 'heal') {
                ctx.fillStyle = `rgba(64, 209, 88, ${damageText.opacity})`;
            } else {
                ctx.fillStyle = `rgba(248, 81, 73, ${damageText.opacity})`;
            }
            ctx.strokeStyle = `rgba(33, 38, 45, ${damageText.opacity})`;
            ctx.lineWidth = 2;
            
            // Draw text with outline
            ctx.strokeText(damageText.text, screenX, screenY);
            ctx.fillText(damageText.text, screenX, screenY);
        }
        
        ctx.restore();
    }
    
    /**
     * Apply shop upgrade effects to player
     */    applyShopUpgrade(upgradeId) {
        // Apply shop upgrade by ID
          switch (upgradeId) {
            case 'doubleJump':
                this.shopUpgrades.doubleJump = true;
                break;
            case 'shield':
                this.shopUpgrades.shield = true;
                break;
            case 'magnet':
                this.shopUpgrades.magnet = true;
                break;
            case 'hoverBoots':
                this.shopUpgrades.hoverBoots = true;
                break;
            case 'healthUpgrade':
                this.shopUpgrades.extraHealth += 1;
                this.maxHealth += 1;
                this.health = Math.min(this.health + 1, this.maxHealth);
                break;
            case 'datapackMultiplier':
                this.shopUpgrades.datapackMultiplier += 0.5;
                break;
            case 'scoreMultiplier':
                this.shopUpgrades.scoreMultiplier += 0.25;
                break;
            case 'comboBonus':
                this.shopUpgrades.comboBonus += 0.5;
                break;
            case 'streakSaver':
                this.shopUpgrades.streakSaver = true;
                break;
            case 'allyDrone':
                this.shopUpgrades.allyDrone = true;
                break;
            case 'extraLane':
                this.shopUpgrades.extraLane = true;
                break;
            case 'secondChance':
                this.shopUpgrades.secondChance = true;
                break;
            case 'rewind':
                this.shopUpgrades.rewind = true;
                break;
            case 'trailEffects':
                this.shopUpgrades.trailEffects = true;
                break;
            case 'glowingOutfit':
                this.shopUpgrades.glowingOutfit = true;
                break;
            case 'customAnimations':
                this.shopUpgrades.customAnimations = true;
                break;
        }
    }
  
      /**
     * Perform double jump with smooth animation and particle effects
     */
    performDoubleJump() {
        if (!this.shopUpgrades.doubleJump || !this.jumpState.doubleJumpAvailable || this.onGround) {
            return false;
        }
        
        // Smooth double jump velocity - preserve some horizontal momentum
        const doubleJumpPower = this.jumpPower * 0.85; // Slightly weaker than regular jump
        this.vy = doubleJumpPower;
        
        // Mark double jump as used
        this.jumpState.doubleJumpAvailable = false;
        
        // Optional: Add visual/audio feedback here        if (this.game && this.game.audioSystem) {
            // this.game.audioSystem.playSound('doubleJump');
        }
        
        return true;
    }
    
    /**
     * Reset jump state when landing - optimized for performance
     */
    resetDoubleJump() {
        this.jumpState.doubleJumpAvailable = true;
        this.jumpState.airTime = 0;
    }
}
