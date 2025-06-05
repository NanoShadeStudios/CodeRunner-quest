/**
 * Physics Engine - Handles collision detection and physics calculations
 */

import { GAME_CONFIG, TILE_TYPES } from '../utils/constants.js';

export class PhysicsEngine {
    constructor(world) {
        this.world = world;
    }
    
    /**
     * Check collision for a rectangular area
     */    checkCollision(x, y, width, height, direction = 0, playerDropping = false) {
        const left = Math.floor(x / GAME_CONFIG.TILE_SIZE);
        const right = Math.floor((x + width - 1) / GAME_CONFIG.TILE_SIZE);
        const top = Math.floor(y / GAME_CONFIG.TILE_SIZE);
        const bottom = Math.floor((y + height - 1) / GAME_CONFIG.TILE_SIZE);
        
        const collisions = [];
        
        for (let tileY = top; tileY <= bottom; tileY++) {
            for (let tileX = left; tileX <= right; tileX++) {
                const tile = this.world.getTileAt(tileX, tileY);
                
                if (this.isTileSolid(tile, direction, playerDropping)) {
                    collisions.push({
                        collision: true,
                        tileType: tile,
                        tileX: tileX,
                        tileY: tileY
                    });
                }
            }
        }
        
        if (collisions.length === 0) {
            return { collision: false };
        }
        
        // Return the most appropriate collision based on movement direction
        return this.getMostRelevantCollision(collisions, x, y, width, height, direction);
    }    /**
     * Get the most relevant collision based on movement direction and proximity
     */
    getMostRelevantCollision(collisions, playerX, playerY, playerWidth, playerHeight, direction) {
        if (collisions.length === 1) {
            return collisions[0];
        }
        
        // For vertical movement (falling down), choose the topmost collision that's actually below the player
        if (direction === 1) { // Moving down
            const playerBottom = playerY + playerHeight;
            const validCollisions = collisions.filter(collision => {
                const tileTop = collision.tileY * GAME_CONFIG.TILE_SIZE;
                return tileTop >= playerBottom - 10; // Allow small overlap for precision
            });
            
            if (validCollisions.length === 0) {
                return this.getClosestCollision(collisions, playerX, playerY, playerWidth, playerHeight);
            }
            
            let topmost = validCollisions[0];
            for (const collision of validCollisions) {
                if (collision.tileY < topmost.tileY) {
                    topmost = collision;
                }
            }
            return topmost;
        }
        
        // For vertical movement (jumping up), choose the bottommost collision that's actually above the player
        if (direction === -1) { // Moving up
            const playerTop = playerY;
            const validCollisions = collisions.filter(collision => {
                const tileBottom = (collision.tileY + 1) * GAME_CONFIG.TILE_SIZE;
                return tileBottom <= playerTop + 10; // Allow small overlap for precision
            });
            
            if (validCollisions.length === 0) {
                return this.getClosestCollision(collisions, playerX, playerY, playerWidth, playerHeight);
            }
            
            let bottommost = validCollisions[0];
            for (const collision of validCollisions) {
                if (collision.tileY > bottommost.tileY) {
                    bottommost = collision;
                }
            }
            return bottommost;
        }
        
        // For horizontal movement or no direction, choose the closest collision
        return this.getClosestCollision(collisions, playerX, playerY, playerWidth, playerHeight);
    }
    
    /**
     * Get the closest collision by distance
     */
    getClosestCollision(collisions, playerX, playerY, playerWidth, playerHeight) {
        const playerCenterX = playerX + playerWidth / 2;
        const playerCenterY = playerY + playerHeight / 2;
        
        let closest = collisions[0];
        let minDistance = this.getDistanceToTile(playerCenterX, playerCenterY, closest.tileX, closest.tileY);
        
        for (const collision of collisions) {
            const distance = this.getDistanceToTile(playerCenterX, playerCenterY, collision.tileX, collision.tileY);
            if (distance < minDistance) {
                minDistance = distance;
                closest = collision;
            }
        }
        
        return closest;
    }
    
    /**
     * Calculate distance from player center to tile center
     */
    getDistanceToTile(playerCenterX, playerCenterY, tileX, tileY) {
        const tileCenterX = (tileX + 0.5) * GAME_CONFIG.TILE_SIZE;
        const tileCenterY = (tileY + 0.5) * GAME_CONFIG.TILE_SIZE;
        
        const dx = playerCenterX - tileCenterX;
        const dy = playerCenterY - tileCenterY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if a tile is solid based on game rules
     */    isTileSolid(tileType, direction, playerDropping) {
        switch (tileType) {
            case TILE_TYPES.FLOOR:
                return true;
            case TILE_TYPES.PLATFORM:
                return direction === 1 && !playerDropping;
            case TILE_TYPES.SPIKE:
                return false;            case TILE_TYPES.GLITCH:
                return false; // Glitches are no longer solid in single mode
            default:
                return false;
        }
    }
      /**
     * Handle horizontal movement with collision
     */    handleHorizontalMovement(entity, deltaSeconds) {
        if (!this.world) {
            entity.x += entity.vx * deltaSeconds;
            return;
        }
        
        const newX = entity.x + entity.vx * deltaSeconds;
        const collision = this.checkCollision(newX, entity.y, entity.width, entity.height);
        
        if (collision.collision) {
            const movingRight = entity.vx > 0;
            entity.vx = 0;
            
            if (movingRight) {
                // Moving right, stop just before the tile - prevent clipping
                entity.x = collision.tileX * GAME_CONFIG.TILE_SIZE - entity.width - 0.1;
            } else {
                // Moving left, stop just after the tile - prevent clipping
                entity.x = (collision.tileX + 1) * GAME_CONFIG.TILE_SIZE + 0.1;
            }
        } else {
            entity.x = newX;
        }
        
        // Prevent going off the left edge of the world
        if (entity.x < 0) {
            entity.x = 0;
            entity.vx = 0;
        }
    }
      /**
     * Handle vertical movement with collision
     */    handleVerticalMovement(entity, deltaSeconds) {
        if (!this.world) {
            entity.y += entity.vy * deltaSeconds;
            if (entity.y + entity.height >= entity.FLOOR_Y) {
                entity.y = entity.FLOOR_Y - entity.height;
                entity.vy = 0;
                entity.onGround = true;
                entity.isJumping = false;
            } else {
                entity.onGround = false;
            }
            return;
        }        const oldY = entity.y;
        const newY = entity.y + entity.vy * deltaSeconds;
        const direction = entity.vy > 0 ? 1 : (entity.vy < 0 ? -1 : 0);
        const isDropping = entity.isPressingDown;
        
        const collision = this.checkCollision(entity.x, newY, entity.width, entity.height, direction, isDropping);
        
        if (collision.collision) {
            // Calculate the tile's world position
            const tileWorldY = collision.tileY * GAME_CONFIG.TILE_SIZE;
            
            if (entity.vy > 0) {
                // Landing on ground - validate this makes sense
                const proposedY = tileWorldY - entity.height - 0.1;
                
                // Safety check: Don't allow teleporting upward when falling
                if (proposedY < oldY - 5) { // Allow small correction (5px) but not major teleportation
                    entity.y = newY; // Continue falling instead
                    entity.onGround = false;
                } else {                    entity.y = proposedY;
                    entity.vy = 0;
                    entity.onGround = true;
                    entity.isJumping = false;
                    
                    // Reset double jump when landing
                    if (entity.resetDoubleJump) {
                        entity.resetDoubleJump();
                    }
                }
            } else if (entity.vy < 0) {
                // Hitting ceiling - validate this makes sense
                const proposedY = tileWorldY + GAME_CONFIG.TILE_SIZE + 0.1;
                
                // Safety check: Don't allow teleporting downward when jumping
                if (proposedY > oldY + 5) {
                    entity.y = newY; // Continue moving instead
                } else {
                    entity.y = proposedY;
                    entity.vy = 0;
                }
            }
        } else {
            entity.y = newY;
            entity.onGround = false;
        }
    }
      /**
     * Check for hazards at entity position
     */
    checkHazards(entity) {
        const left = Math.floor(entity.x / GAME_CONFIG.TILE_SIZE);
        const right = Math.floor((entity.x + entity.width - 1) / GAME_CONFIG.TILE_SIZE);
        const top = Math.floor(entity.y / GAME_CONFIG.TILE_SIZE);
        const bottom = Math.floor((entity.y + entity.height - 1) / GAME_CONFIG.TILE_SIZE);
        
        for (let tileY = top; tileY <= bottom; tileY++) {
            for (let tileX = left; tileX <= right; tileX++) {
                const tile = this.world.getTileAt(tileX, tileY);                if (tile === TILE_TYPES.SPIKE) {
                    console.log(`SPIKE DETECTION: Found spike at tile (${tileX}, ${tileY}), player at (${entity.x}, ${entity.y})`);
                    return { hazard: true, type: 'spike' };
                }}
        }        // Check for deadly falls (below the ground level with buffer)
        // Ground level is at y = 10, so ground tiles are at y = 10 * 32 = 320
        // Add a generous buffer below the ground level for fall detection
        const groundLevelY = 10 * GAME_CONFIG.TILE_SIZE; // 320
        const fallThreshold = groundLevelY + 200; // 520 - well below ground level
        
        if (entity.y > fallThreshold) {
            console.log(`FALL DETECTION: Player y=${entity.y}, threshold=${fallThreshold}, groundLevel=${groundLevelY}`);
            return { hazard: true, type: 'fall' };
        }
        
        // Check for going off the left side of the world
        if (entity.x < -100) {
            return { hazard: true, type: 'outOfBounds' };
        }
        
        return { hazard: false };
    }
        /**
     * Check for collectible items and handle collection
     */
    checkCollectibles(x, y, width, height, game) {
        const left = Math.floor(x / GAME_CONFIG.TILE_SIZE);
        const right = Math.floor((x + width - 1) / GAME_CONFIG.TILE_SIZE);
        const top = Math.floor(y / GAME_CONFIG.TILE_SIZE);
        const bottom = Math.floor((y + height - 1) / GAME_CONFIG.TILE_SIZE);
        
        const collected = [];
        
        for (let tileY = top; tileY <= bottom; tileY++) {
            for (let tileX = left; tileX <= right; tileX++) {
                const tile = this.world.getTileAt(tileX, tileY);
                
                if (tile === TILE_TYPES.DATA_PACKET) {
                    // Collect the data packet
                    this.world.setTileAt(tileX, tileY, TILE_TYPES.EMPTY);                    // Award points - always 1 point in single mode
                    const points = 1;
                    
                    collected.push({
                        type: 'dataPacket',
                        tileX: tileX,
                        tileY: tileY,
                        points: points,
                        worldX: tileX * GAME_CONFIG.TILE_SIZE,
                        worldY: tileY * GAME_CONFIG.TILE_SIZE
                    });
                    
                    // Add to upgrade system currency
                    if (game && game.upgradeSystem) {
                        game.upgradeSystem.addDataPackets(points);
                    }
                }
            }
        }
        
        return collected;
    }
}
