/**
 * Tile Renderer - Handles rendering of different tile types
 */

import { GAME_CONFIG, TILE_TYPES, COLORS } from '../utils/constants.js';

export class TileRenderer {
    constructor() {
        this.animationTime = 0;
    }
    
    update(deltaTime) {
        this.animationTime += deltaTime;
    }
      /**
     * Draw a tile based on its type
     */
    drawTile(ctx, tileType, screenX, screenY) {
        const time = this.animationTime * 0.001;
        
        switch (tileType) {
            case TILE_TYPES.FLOOR:
                this.drawFloorTile(ctx, screenX, screenY);
                break;
            case TILE_TYPES.PLATFORM:
                this.drawPlatformTile(ctx, screenX, screenY);
                break;            case TILE_TYPES.SPIKE:
                this.drawSpikeTile(ctx, screenX, screenY, time);
                break;            case TILE_TYPES.GLITCH:
                this.drawGlitchTile(ctx, screenX, screenY, time);
                break;            case TILE_TYPES.DATA_PACKET:
                this.drawDataPacket(ctx, screenX, screenY, time);
                break;
        }
    }
    
    /**
     * Draw floor tile
     */
    drawFloorTile(ctx, x, y) {
        // Main floor
        ctx.fillStyle = COLORS.FLOOR_MAIN;
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        
        // Highlight
        ctx.fillStyle = COLORS.FLOOR_HIGHLIGHT;
        ctx.fillRect(x + 2, y + 2, GAME_CONFIG.TILE_SIZE - 4, 4);
        
        // Grid lines
        ctx.strokeStyle = COLORS.FLOOR_BORDER;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    }
    
    /**
     * Draw platform tile
     */
    drawPlatformTile(ctx, x, y) {
        // Platform base
        ctx.fillStyle = COLORS.PLATFORM_BASE;
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, 6);
        
        // Platform highlight
        ctx.fillStyle = COLORS.PLATFORM_HIGHLIGHT;
        ctx.fillRect(x + 2, y + 2, GAME_CONFIG.TILE_SIZE - 4, 2);
        
        // Platform details - small rivets
        ctx.fillStyle = COLORS.PLATFORM_DETAILS;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 4 + i * 8, y + 4, 2, 2);
        }
        
        // Visual indicator for jump-through platform
        ctx.fillStyle = COLORS.PLATFORM_INDICATOR;
        ctx.fillRect(x + 2, y + 6, 2, 2);
        ctx.fillRect(x + GAME_CONFIG.TILE_SIZE - 4, y + 6, 2, 2);
    }
      /**
     * Draw spike tile - enhanced threatening design
     */
    drawSpikeTile(ctx, x, y, time) {
        const pulse = Math.sin(time * 4) * 0.3 + 0.7;
        const fastPulse = Math.sin(time * 8) * 0.1 + 0.9;
        const dangerGlow = Math.sin(time * 6) * 0.4 + 0.6;
        
        // Dark ominous base platform
        ctx.fillStyle = `rgba(33, 38, 45, ${pulse})`;
        ctx.fillRect(x + 2, y + GAME_CONFIG.TILE_SIZE - 8, GAME_CONFIG.TILE_SIZE - 4, 8);
        
        // Warning stripes on base (industrial look)
        ctx.fillStyle = `rgba(255, 193, 7, ${pulse * 0.8})`;
        for (let i = 0; i < 3; i++) {
            const stripeX = x + 6 + i * 8;
            ctx.fillRect(stripeX, y + GAME_CONFIG.TILE_SIZE - 6, 4, 2);
        }
        
        // Main spike structures - more threatening and varied
        const spikeConfigs = [
            { x: 4, height: 20, width: 6 },   // Tall left spike
            { x: 12, height: 24, width: 8 },  // Tallest center spike
            { x: 20, height: 18, width: 6 },  // Medium right spike
            { x: 26, height: 16, width: 4 }   // Smaller far right spike
        ];
        
        spikeConfigs.forEach((spike, index) => {
            const spikeX = x + spike.x;
            const spikeHeight = spike.height + Math.sin(time * 3 + index) * 2; // Slight height variation
            const spikeTop = y + GAME_CONFIG.TILE_SIZE - 8 - spikeHeight;
            
            // Main spike body with gradient effect
            const gradient = ctx.createLinearGradient(spikeX, spikeTop, spikeX, y + GAME_CONFIG.TILE_SIZE - 8);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${fastPulse})`);
            gradient.addColorStop(0.3, `rgba(248, 81, 73, ${pulse})`);
            gradient.addColorStop(1, `rgba(139, 69, 19, ${pulse})`);
            
            ctx.fillStyle = gradient;
            
            // Draw sharp, menacing spike shape
            ctx.beginPath();
            ctx.moveTo(spikeX + spike.width / 2, spikeTop); // Sharp tip
            ctx.lineTo(spikeX + spike.width - 1, y + GAME_CONFIG.TILE_SIZE - 8); // Right edge
            ctx.lineTo(spikeX + 1, y + GAME_CONFIG.TILE_SIZE - 8); // Left edge
            ctx.closePath();
            ctx.fill();
            
            // Add metallic edge highlights
            ctx.strokeStyle = `rgba(255, 255, 255, ${dangerGlow * 0.7})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spikeX + 1, y + GAME_CONFIG.TILE_SIZE - 8);
            ctx.lineTo(spikeX + spike.width / 2, spikeTop);
            ctx.stroke();
            
            // Deadly tip glow
            ctx.fillStyle = `rgba(255, 255, 255, ${dangerGlow})`;
            ctx.fillRect(spikeX + spike.width / 2 - 1, spikeTop, 2, 2);
            
            // Blood-red drip effect for extra menace
            if (Math.sin(time * 2 + index * 1.5) > 0.3) {
                ctx.fillStyle = `rgba(139, 0, 0, ${pulse * 0.8})`;
                const dripY = spikeTop + spikeHeight * 0.6 + Math.sin(time * 4 + index) * 2;
                ctx.fillRect(spikeX + spike.width / 2 - 1, dripY, 2, 3);
            }
        });
        
        // Danger zone indicator - pulsing warning glow around entire spike area
        ctx.shadowBlur = 8 * dangerGlow;
        ctx.shadowColor = `rgba(255, 0, 0, ${dangerGlow * 0.5})`;
        ctx.strokeStyle = `rgba(255, 0, 0, ${dangerGlow * 0.3})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + GAME_CONFIG.TILE_SIZE - 28, GAME_CONFIG.TILE_SIZE - 2, 28);
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw glitch tile
     */
    drawGlitchTile(ctx, x, y, time) {
        const glitch = Math.sin(time * 8) * 0.3 + 0.7;
        
        // Glitch block
        ctx.fillStyle = COLORS.GLITCH_BASE.replace('{alpha}', glitch);
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        
        // Glitch pattern
        ctx.fillStyle = COLORS.GLITCH_PATTERN.replace('{alpha}', glitch);
        const offset = Math.floor(time * 10) % 4;
        for (let i = 0; i < 4; i++) {
            const lineY = y + 4 + i * 6 + offset;
            ctx.fillRect(x + 2, lineY, GAME_CONFIG.TILE_SIZE - 4, 2);
        }
          // Digital noise
        if (Math.random() < 0.1) {
            ctx.fillStyle = COLORS.GLITCH_NOISE.replace('{alpha}', glitch);
            ctx.fillRect(
                x + Math.random() * GAME_CONFIG.TILE_SIZE, 
                y + Math.random() * GAME_CONFIG.TILE_SIZE, 
                4, 4
            );
        }
    }

    /**
     * Draw data packet collectible
     */    drawDataPacket(ctx, x, y, time) {
        const centerX = x + GAME_CONFIG.TILE_SIZE / 2;
        const centerY = y + GAME_CONFIG.TILE_SIZE / 2;
        const floatOffset = Math.sin(time * 3) * 3; // Floating animation
        const currentY = centerY + floatOffset;
        
        // Normal data packet - green/cyan
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 6;
        
        // Draw main packet (diamond shape)
        ctx.save();
        ctx.translate(centerX, currentY);
        ctx.rotate(time * 2);
        
        const size = 8 + Math.sin(time * 4) * 2; // Pulsing size
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = '#34d399';
        const innerSize = size * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -innerSize);
        ctx.lineTo(innerSize, 0);
        ctx.lineTo(0, innerSize);
        ctx.lineTo(-innerSize, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}
