/**
 * World Generator - Procedural terrain generation system
 */

import { GAME_CONFIG, TILE_TYPES } from '../utils/constants.js';
import { TileRenderer } from '../rendering/TileRenderer.js';

export class WorldGenerator {
    constructor(game) {
        this.game = game;
        this.chunks = new Map();
        this.lastGeneratedChunk = -1;
        this.groundLevel = 10;
        this.currentGroundLevel = 10; // Dynamic ground level that changes
        this.difficulty = 1;
        this.lastSpikeWorldX = -10;
        this.tileRenderer = new TileRenderer();
        this.TILE_TYPES = TILE_TYPES; // Make TILE_TYPES accessible to other classes
        
        // Add randomization seeds for different terrain features
        this.terrainSeed = Math.random() * 1000;
        this.lastTerrainType = 'normal';
        this.chunkTypeCounter = 0;
    }
    
    update(deltaTime, camera) {
        this.tileRenderer.update(deltaTime);
        this.difficulty = 1 + Math.floor(camera.x / 1000) * 0.2;
        this.generateChunksForCamera(camera);
        this.cleanupOldChunks(camera);
    }
    
    generateChunksForCamera(camera) {
        const currentChunk = Math.floor(camera.x / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE));
        const maxChunk = currentChunk + GAME_CONFIG.GENERATION_DISTANCE;
        
        for (let chunkX = this.lastGeneratedChunk + 1; chunkX <= maxChunk; chunkX++) {
            this.generateChunk(chunkX);
        }
        
        this.lastGeneratedChunk = Math.max(this.lastGeneratedChunk, maxChunk);
    }      generateChunk(chunkX) {
        if (this.chunks.has(chunkX)) return;
        
        const chunk = {
            x: chunkX,
            tiles: [],
            generated: true,
            terrainType: this.determineTerrainType(chunkX)
        };
          // Skip logging terrain types information
        
        // Initialize empty chunk
        for (let y = 0; y < GAME_CONFIG.CHUNK_HEIGHT; y++) {
            chunk.tiles[y] = [];
            for (let x = 0; x < GAME_CONFIG.CHUNK_WIDTH; x++) {
                chunk.tiles[y][x] = TILE_TYPES.EMPTY;
            }
        }
        
        // Update ground level for variation (except spawn chunk)
        if (chunkX > 0) {
            this.updateGroundLevel(chunkX, chunk.terrainType);
        }
        
        this.generateGroundLevel(chunk, chunkX);
        this.generatePlatforms(chunk, chunkX);
        this.generateSpecialTiles(chunk, chunkX);
        
        this.chunks.set(chunkX, chunk);
    }
    
    /**
     * Determine what type of terrain this chunk should have
     */
    determineTerrainType(chunkX) {
        // First chunk is always safe
        if (chunkX === 0) return 'spawn';
        
        // Use a mix of randomness and patterns
        const terrainTypes = ['normal', 'platformHeavy', 'hazardous', 'elevated', 'valley', 'chaotic'];
        const weights = [30, 20, 15, 15, 10, 10]; // Percentage weights
        
        // Modify weights based on difficulty
        if (this.difficulty > 2) {
            weights[2] += 10; // More hazardous
            weights[5] += 5;  // More chaotic
        }
        
        // Avoid too many consecutive similar terrains
        let availableTypes = [...terrainTypes];
        if (this.lastTerrainType === 'hazardous' && this.chunkTypeCounter > 2) {
            availableTypes = availableTypes.filter(t => t !== 'hazardous');
        }
        
        const rand = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < availableTypes.length; i++) {
            const typeIndex = terrainTypes.indexOf(availableTypes[i]);
            cumulative += weights[typeIndex];
            if (rand < cumulative) {
                const selectedType = availableTypes[i];
                
                if (selectedType === this.lastTerrainType) {
                    this.chunkTypeCounter++;
                } else {
                    this.chunkTypeCounter = 1;
                    this.lastTerrainType = selectedType;
                }
                
                return selectedType;
            }
        }
        
        return 'normal';
    }
    
    /**
     * Update ground level based on terrain type
     */
    /**
     * Get terrain-specific generation parameters
     */
    getTerrainParameters(terrainType) {        const baseParams = {
            gapChance: GAME_CONFIG.GAP_CHANCE,
            maxGapSize: GAME_CONFIG.MAX_GAP_SIZE,
            minFloorStreak: GAME_CONFIG.MIN_FLOOR_STREAK,
            spikeChance: GAME_CONFIG.SPIKE_CHANCE,
            spikeMinDistance: GAME_CONFIG.SPIKE_MIN_DISTANCE
        };
        
        switch (terrainType) {
            case 'spawn':                return {
                    ...baseParams,
                    gapChance: 0, // No gaps in spawn
                    spikeChance: 0 // No spikes in spawn
                };
                
            case 'platformHeavy':                return {
                    ...baseParams,
                    gapChance: baseParams.gapChance * 1.5, // More gaps to make platforms useful
                    maxGapSize: Math.min(baseParams.maxGapSize + 1, 4),
                    spikeChance: baseParams.spikeChance * 0.7 // Fewer ground spikes
                };
                  case 'hazardous':
                return {
                    ...baseParams,
                    spikeChance: baseParams.spikeChance * 2, // Double spike chance
                    spikeMinDistance: Math.max(baseParams.spikeMinDistance - 1, 2) // Closer spikes
                };
                
            case 'elevated':                return {
                    ...baseParams,
                    gapChance: baseParams.gapChance * 1.2,
                    spikeChance: baseParams.spikeChance * 0.8
                };
                  case 'valley':
                return {
                    ...baseParams,
                    gapChance: baseParams.gapChance * 0.7, // Fewer gaps in valleys
                    maxGapSize: Math.max(baseParams.maxGapSize - 1, 2),
                    minFloorStreak: baseParams.minFloorStreak + 1, // Longer floor sections
                    spikeChance: baseParams.spikeChance * 1.2
                };
                
            case 'chaotic':                return {
                    ...baseParams,
                    gapChance: baseParams.gapChance * (0.5 + Math.random()), // Random gap chance
                    maxGapSize: 2 + Math.floor(Math.random() * 3), // Random max gap
                    minFloorStreak: 1 + Math.floor(Math.random() * 3), // Random floor streak
                    spikeChance: baseParams.spikeChance * (0.5 + Math.random() * 1.5) // Very random spike chance
                };
                
            default: // 'normal'
                return baseParams;
        }
    }

    updateGroundLevel(chunkX, terrainType) {
        const baseGroundLevel = 10;
        const maxVariation = 2;
        
        switch (terrainType) {
            case 'elevated':
                this.currentGroundLevel = Math.max(baseGroundLevel - maxVariation, 
                    baseGroundLevel - 1 - Math.floor(Math.random() * 2));
                break;
            case 'valley':
                this.currentGroundLevel = Math.min(baseGroundLevel + maxVariation, 
                    baseGroundLevel + 1 + Math.floor(Math.random() * 2));
                break;
            case 'chaotic':
                // Random elevation change
                const change = (Math.random() - 0.5) * 4;
                this.currentGroundLevel = Math.max(8, Math.min(12, this.currentGroundLevel + change));
                break;
            default:
                // Gradual return to base level or small random variation
                const targetLevel = baseGroundLevel + (Math.random() - 0.5) * 2;
                this.currentGroundLevel += (targetLevel - this.currentGroundLevel) * 0.3;
                break;
        }
        
        this.currentGroundLevel = Math.round(this.currentGroundLevel);
    }    generateGroundLevel(chunk, chunkX) {
        let consecutiveFloors = 0;
        let consecutiveGaps = 0;
        const groundLevel = chunkX === 0 ? this.groundLevel : this.currentGroundLevel;
        
        // Get terrain-specific generation parameters
        const terrainParams = this.getTerrainParameters(chunk.terrainType);
        
        // Clamp groundLevel to valid range
        const clampedGroundLevel = Math.max(0, Math.min(GAME_CONFIG.CHUNK_HEIGHT - 1, groundLevel));
        
        for (let x = 0; x < GAME_CONFIG.CHUNK_WIDTH; x++) {
            const worldX = chunkX * GAME_CONFIG.CHUNK_WIDTH + x;
            let tileType = TILE_TYPES.FLOOR;
              // Special spawn area: Always create 5 flat floor tiles at the beginning
            if (chunkX === 0 && x < 5) {
                tileType = TILE_TYPES.FLOOR;
                chunk.tiles[clampedGroundLevel][x] = tileType;
                consecutiveFloors++;
                consecutiveGaps = 0;
                continue; // Skip all hazard generation for spawn area
            }
            
            if (consecutiveGaps >= terrainParams.maxGapSize) {
                tileType = TILE_TYPES.FLOOR;
                consecutiveGaps = 0;
                consecutiveFloors = 1;
            } else if (consecutiveFloors < terrainParams.minFloorStreak) {
                tileType = TILE_TYPES.FLOOR;
                consecutiveFloors++;
                consecutiveGaps = 0;
            } else {
                const roll = Math.random() * 100;
                const difficultyModifier = Math.min(this.difficulty * 3, 15);
                
                if (roll < terrainParams.gapChance + difficultyModifier) {
                    tileType = TILE_TYPES.GAP;
                    consecutiveGaps++;
                    consecutiveFloors = 0;
                } else {
                    tileType = TILE_TYPES.FLOOR;
                    consecutiveFloors++;
                    consecutiveGaps = 0;
                }
            }
              if (tileType === TILE_TYPES.FLOOR) {
                chunk.tiles[clampedGroundLevel][x] = tileType;
                
                // Skip spikes in the first chunk (spawn area) to ensure safe start
                if (chunkX === 0) {
                    continue; // No spikes in spawn chunk
                }
                  // Add spikes with terrain-specific chances
                const spikeChance = terrainParams.spikeChance + Math.min(this.difficulty * 3, 20);
                const spikeRoll = Math.random() * 100;
                const distanceFromLastSpike = worldX - this.lastSpikeWorldX;
                
                if (spikeRoll < spikeChance && distanceFromLastSpike >= terrainParams.spikeMinDistance && clampedGroundLevel > 0) {
                    chunk.tiles[clampedGroundLevel - 1][x] = TILE_TYPES.SPIKE;
                    this.lastSpikeWorldX = worldX;
                }
                  // Add glitches with terrain-specific chances - DISABLED (no longer used)
                // const glitchChance = terrainParams.glitchChance + Math.min(this.difficulty * 2, 10);
                // if (Math.random() * 100 < glitchChance && clampedGroundLevel > 0 && chunk.tiles[clampedGroundLevel - 1][x] !== TILE_TYPES.SPIKE) {
                //     chunk.tiles[clampedGroundLevel - 1][x] = TILE_TYPES.GLITCH;
                // }
            }
        }
    }
    generatePlatforms(chunk, chunkX) {
        const terrainParams = this.getTerrainParameters(chunk.terrainType);
        const groundLevel = chunkX === 0 ? this.groundLevel : this.currentGroundLevel;
        
        // Clamp groundLevel to valid range
        const clampedGroundLevel = Math.max(0, Math.min(GAME_CONFIG.CHUNK_HEIGHT - 1, groundLevel));
        
        // Determine number of platforms based on terrain type
        let platformCount;
        switch (chunk.terrainType) {
            case 'platformHeavy':
                platformCount = 3 + Math.floor(Math.random() * 3); // 3-5 platforms
                break;
            case 'elevated':
                platformCount = 2 + Math.floor(Math.random() * 2); // 2-3 platforms
                break;
            case 'chaotic':
                platformCount = 1 + Math.floor(Math.random() * 4); // 1-4 platforms (very random)
                break;
            case 'spawn':
                platformCount = 1; // Minimal platforms in spawn area
                break;
            default:
                platformCount = Math.random() < 0.7 ? 2 : 3; // Original logic
                break;
        }

        for (let p = 0; p < platformCount; p++) {
            let platformX, platformY, platformLength;
            
            // Terrain-specific platform placement
            switch (chunk.terrainType) {                case 'platformHeavy':
                    platformX = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 5)) + 1;
                    platformY = clampedGroundLevel - 2 - Math.floor(Math.random() * 4); // Higher variety
                    platformLength = 2 + Math.floor(Math.random() * 4); // 2-5 length
                    break;
                    
                case 'elevated':
                    platformX = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 4)) + 1;
                    platformY = clampedGroundLevel - 3 - Math.floor(Math.random() * 2); // Higher platforms
                    platformLength = 3 + Math.floor(Math.random() * 3); // 3-5 length
                    break;
                    
                case 'valley':
                    platformX = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 4)) + 1;
                    platformY = clampedGroundLevel - 1 - Math.floor(Math.random() * 2); // Lower platforms
                    platformLength = 4 + Math.floor(Math.random() * 2); // 4-5 length (longer for easier traversal)
                    break;
                    
                case 'chaotic':
                    platformX = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 3)) + 1;
                    platformY = clampedGroundLevel - 1 - Math.floor(Math.random() * 5); // Very random heights
                    platformLength = 1 + Math.floor(Math.random() * 4); // 1-4 length (very varied)
                    break;
                    
                case 'hazardous':
                    platformX = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 4)) + 1;
                    platformY = clampedGroundLevel - 2 - Math.floor(Math.random() * 3);
                    platformLength = 2 + Math.floor(Math.random() * 3); // 2-4 length (shorter for difficulty)
                    break;
                    
                case 'spawn':
                    // Safe, predictable platform in spawn area
                    platformX = 8 + p * 6; // Evenly spaced
                    platformY = clampedGroundLevel - 2;
                    platformLength = 3;
                    break;
                    
                default:
                    platformX = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 4)) + 1;
                    platformY = clampedGroundLevel - 2 - Math.floor(Math.random() * 3);
                    platformLength = 3 + Math.floor(Math.random() * 3);
                    break;
            }

            // Place the platform tiles
            for (let i = 0; i < platformLength && platformX + i < GAME_CONFIG.CHUNK_WIDTH; i++) {
                if (platformY >= 0 && platformY < GAME_CONFIG.CHUNK_HEIGHT) {
                    chunk.tiles[platformY][platformX + i] = TILE_TYPES.PLATFORM;
                }
            }
            
            // Add platform-specific hazards for some terrain types
            if (chunk.terrainType === 'hazardous' && Math.random() < 0.3) {
                // 30% chance to add spikes under platforms in hazardous terrain
                const spikeX = platformX + Math.floor(platformLength / 2);
                if (platformY + 1 < GAME_CONFIG.CHUNK_HEIGHT && 
                    chunk.tiles[platformY + 1][spikeX] === TILE_TYPES.EMPTY) {
                    chunk.tiles[platformY + 1][spikeX] = TILE_TYPES.SPIKE;
                }
            }
        }
    }    generateSpecialTiles(chunk, chunkX) {
        const terrainParams = this.getTerrainParameters(chunk.terrainType);
        
        // Base chances modified by terrain type
        let dataPacketChance = 0.03; // 3% base chance
        
        switch (chunk.terrainType) {
            case 'spawn':
                dataPacketChance = 0.05; // More data packets for early collection
                break;
                
            case 'hazardous':
                dataPacketChance = 0.02; // Fewer rewards in dangerous areas
                break;
                
            case 'platformHeavy':
                dataPacketChance = 0.04; // More rewards for platforming
                break;
                
            case 'chaotic':
                dataPacketChance = 0.02 + Math.random() * 0.03; // Random data packet chance
                break;
                
            case 'elevated':
                dataPacketChance = 0.045; // More rewards at higher elevations
                break;
                
            case 'valley':
                dataPacketChance = 0.025; // Fewer rewards in valleys
                break;
        }
        
        for (let y = 0; y < GAME_CONFIG.CHUNK_HEIGHT - 2; y++) {
            for (let x = 0; x < GAME_CONFIG.CHUNK_WIDTH; x++) {
                if (chunk.tiles[y][x] === TILE_TYPES.EMPTY) {
                    const rand = Math.random();
                    if (rand < dataPacketChance) {
                        chunk.tiles[y][x] = TILE_TYPES.DATA_PACKET;
                    }
                }
            }
        }
        
        // Add terrain-specific special features
        this.addTerrainSpecialFeatures(chunk, chunkX);
    }
      /**
     * Add special features unique to each terrain type
     */
    addTerrainSpecialFeatures(chunk, chunkX) {
        const groundLevel = chunkX === 0 ? this.groundLevel : this.currentGroundLevel;
        
        // Clamp groundLevel to valid range
        const clampedGroundLevel = Math.max(0, Math.min(GAME_CONFIG.CHUNK_HEIGHT - 1, groundLevel));
        
        switch (chunk.terrainType) {
            case 'hazardous':
                // Add some floating spike clusters
                if (Math.random() < 0.3) {
                    const clusterX = 2 + Math.floor(Math.random() * (GAME_CONFIG.CHUNK_WIDTH - 4));
                    const clusterY = clampedGroundLevel - 3 - Math.floor(Math.random() * 2);
                    if (clusterY >= 0 && chunk.tiles[clusterY][clusterX] === TILE_TYPES.EMPTY) {
                        chunk.tiles[clusterY][clusterX] = TILE_TYPES.SPIKE;
                        // Small chance for adjacent spikes
                        if (Math.random() < 0.5 && clusterX + 1 < GAME_CONFIG.CHUNK_WIDTH) {
                            chunk.tiles[clusterY][clusterX + 1] = TILE_TYPES.SPIKE;
                        }
                    }
                }
                break;
                  case 'chaotic':
                // Random spike placement in mid-air (no more glitches)
                for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
                    const randX = Math.floor(Math.random() * GAME_CONFIG.CHUNK_WIDTH);
                    const randY = Math.floor(Math.random() * (GAME_CONFIG.CHUNK_HEIGHT - 2));
                    if (chunk.tiles[randY][randX] === TILE_TYPES.EMPTY && Math.random() < 0.3) {
                        chunk.tiles[randY][randX] = TILE_TYPES.SPIKE;
                    }
                }
                break;
                
            case 'platformHeavy':
                // Add extra data packets on platforms
                for (let y = 0; y < GAME_CONFIG.CHUNK_HEIGHT; y++) {
                    for (let x = 0; x < GAME_CONFIG.CHUNK_WIDTH; x++) {
                        if (chunk.tiles[y][x] === TILE_TYPES.PLATFORM && Math.random() < 0.15) {
                            // Add data packet above platform
                            if (y > 0 && chunk.tiles[y - 1][x] === TILE_TYPES.EMPTY) {
                                chunk.tiles[y - 1][x] = TILE_TYPES.DATA_PACKET;
                            }
                        }
                    }
                }
                break;
        }
    }
    
    cleanupOldChunks(camera) {
        const currentChunk = Math.floor(camera.x / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE));
        const minChunk = currentChunk - GAME_CONFIG.CLEANUP_DISTANCE;
        
        for (let [chunkX, chunk] of this.chunks) {
            if (chunkX < minChunk) {
                this.chunks.delete(chunkX);
            }
        }
    }
      getTileAt(worldX, worldY) {
        const chunkX = Math.floor(worldX / GAME_CONFIG.CHUNK_WIDTH);
        const chunk = this.chunks.get(chunkX);
        
        if (!chunk) return TILE_TYPES.EMPTY;
        
        const tileX = worldX % GAME_CONFIG.CHUNK_WIDTH;
        const tileY = worldY;
        
        if (tileX < 0 || tileX >= GAME_CONFIG.CHUNK_WIDTH || tileY < 0 || tileY >= GAME_CONFIG.CHUNK_HEIGHT) {
            return TILE_TYPES.EMPTY;
        }
        
        return chunk.tiles[tileY][tileX];
    }
    
    setTileAt(worldX, worldY, tileType) {
        const chunkX = Math.floor(worldX / GAME_CONFIG.CHUNK_WIDTH);
        const chunk = this.chunks.get(chunkX);
        
        if (!chunk) return;
        
        const tileX = worldX % GAME_CONFIG.CHUNK_WIDTH;
        const tileY = worldY;
        
        if (tileX < 0 || tileX >= GAME_CONFIG.CHUNK_WIDTH || tileY < 0 || tileY >= GAME_CONFIG.CHUNK_HEIGHT) {
            return;
        }
        
        chunk.tiles[tileY][tileX] = tileType;
    }
    
    getTileAtPixel(pixelX, pixelY) {
        const tileX = Math.floor(pixelX / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(pixelY / GAME_CONFIG.TILE_SIZE);
        return this.getTileAt(tileX, tileY);
    }    draw(ctx, camera) {
        const startChunk = Math.floor(camera.x / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE)) - 1;
        const endChunk = Math.ceil((camera.x + ctx.canvas.width) / (GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE)) + 1;
        
        for (let chunkX = startChunk; chunkX <= endChunk; chunkX++) {
            this.drawChunk(ctx, camera, chunkX);
        }
    }
      drawChunk(ctx, camera, chunkX) {
        const chunk = this.chunks.get(chunkX);
        if (!chunk) return;
        
        const chunkPixelX = chunkX * GAME_CONFIG.CHUNK_WIDTH * GAME_CONFIG.TILE_SIZE;
        
        for (let y = 0; y < GAME_CONFIG.CHUNK_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.CHUNK_WIDTH; x++) {
                const tileType = chunk.tiles[y][x];
                if (tileType === TILE_TYPES.EMPTY) continue;
                
                const worldX = chunkPixelX + x * GAME_CONFIG.TILE_SIZE;
                const worldY = y * GAME_CONFIG.TILE_SIZE;
                const screenX = worldX - camera.x;
                const screenY = worldY - camera.y;
                
                if (screenX < -GAME_CONFIG.TILE_SIZE || screenX > ctx.canvas.width + GAME_CONFIG.TILE_SIZE) continue;
                
                this.tileRenderer.drawTile(ctx, tileType, screenX, screenY);
            }
        }
    }findSafeSpawnPosition() {
        if (!this.chunks.has(0)) {
            this.generateChunk(0);
        }
        
        const chunk = this.chunks.get(0);
        const safeDistance = 3;        const spawnGroundLevel = this.groundLevel; // Always use base ground level for spawn
        
        for (let x = 1; x < GAME_CONFIG.CHUNK_WIDTH - safeDistance; x++) {
            let isSafe = true;
              for (let checkX = x; checkX < x + safeDistance; checkX++) {
                const groundTile = chunk.tiles[spawnGroundLevel][checkX];
                const aboveTile = spawnGroundLevel > 0 ? chunk.tiles[spawnGroundLevel - 1][checkX] : TILE_TYPES.EMPTY;
                const aboveAboveTile = spawnGroundLevel > 1 ? chunk.tiles[spawnGroundLevel - 2][checkX] : TILE_TYPES.EMPTY;
                  // Check for solid ground, no spikes above ground, and no spikes at spawn position
                if (groundTile !== TILE_TYPES.FLOOR || 
                    aboveTile === TILE_TYPES.SPIKE || 
                    aboveAboveTile === TILE_TYPES.SPIKE) {
                    isSafe = false;
                    break;
                }
            }
            
            if (isSafe) {                const spawnX = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
                const spawnY = (spawnGroundLevel - 2) * GAME_CONFIG.TILE_SIZE;
                return {
                    x: spawnX,
                    y: spawnY
                };
            }
        }
          const fallbackX = GAME_CONFIG.TILE_SIZE * 2; // More reliable fallback position
        const fallbackY = (spawnGroundLevel - 2) * GAME_CONFIG.TILE_SIZE;
        return {
            x: fallbackX,
            y: fallbackY
        };
    }
      getDebugInfo() {
        return {
            chunksLoaded: this.chunks.size,
            lastGenerated: this.lastGeneratedChunk,
            difficulty: this.difficulty.toFixed(1),
            currentGroundLevel: this.currentGroundLevel,
            lastTerrainType: this.lastTerrainType,
            terrainSeed: this.terrainSeed.toFixed(2)
        };
    }
}
