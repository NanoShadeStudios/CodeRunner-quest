/**
 * GameDialogs - Handles all dialog screens and menus
 */

import { GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';

export class GameDialogs {    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this.difficultyHitAreas = [];
        this.tabHitAreas = [];
        this.resetDialogHitAreas = [];
        this.shopHitAreas = [];
    }    /**
     * Draw the difficulty selection screen
     */
    drawDifficultySelection(difficultyHitAreas, hoveredDifficulty, difficultyKeys) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Animated gradient background
        const time = Date.now() * 0.001;
        const gradient = ctx.createRadialGradient(
            width/2 + Math.sin(time * 0.5) * 50, 
            height/2 + Math.cos(time * 0.3) * 30, 
            0, 
            width/2, height/2, 
            Math.max(width, height) * 0.8
        );
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.95)');
        gradient.addColorStop(0.3, 'rgba(30, 41, 59, 0.98)');
        gradient.addColorStop(0.7, 'rgba(21, 32, 43, 0.96)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Enhanced animated particles system
        this.drawDifficultyParticles(ctx, width, height, time);
        
        // Game title with glow effect
        this.drawEnhancedTitle(ctx, width, time);
        
        // Subtitle with typewriter effect
        this.drawSubtitle(ctx, width, time);
        
        // Check if there's a saved game and show continue option
        if (this.game.hasSavedGame()) {
            this.drawSavedGameNotice(ctx, width, time);
        }
        
        // Instructions with animated glow
        this.drawInstructions(ctx, width, time);
        
        // Enhanced difficulty options
        this.drawEnhancedDifficultyOptions(ctx, width, height, difficultyHitAreas, hoveredDifficulty, difficultyKeys, time);
        
        // Footer with version info
        this.drawFooter(ctx, width, height, time);
        
        ctx.restore();
    }
    
    /**
     * Draw enhanced particle system for difficulty screen
     */
    drawDifficultyParticles(ctx, width, height, time) {
        // Primary floating particles
        for (let i = 0; i < 12; i++) {
            const x = (Math.sin(time * 0.5 + i * 1.8) * 0.4 + 0.5) * width;
            const y = (Math.cos(time * 0.4 + i * 0.9) * 0.3 + 0.5) * height;
            const alpha = 0.15 + Math.sin(time * 2 + i) * 0.05;
            const size = 3 + Math.sin(time * 0.7 + i) * 2;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.shadowColor = 'rgba(88, 166, 255, 0.5)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Secondary particle trail
        for (let i = 0; i < 8; i++) {
            const x = (Math.cos(time * 0.3 + i * 2.2) * 0.6 + 0.5) * width;
            const y = (Math.sin(time * 0.6 + i * 1.1) * 0.4 + 0.5) * height;
            const alpha = 0.08 + Math.cos(time * 1.5 + i) * 0.03;
            const size = 1.5 + Math.cos(time * 0.9 + i) * 1;
            
            ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw enhanced title with glow effects
     */
    drawEnhancedTitle(ctx, width, time) {
        // Main title with animated glow
        const titleGlow = 0.3 + Math.sin(time * 2) * 0.1;
        ctx.shadowColor = 'rgba(88, 166, 255, ' + titleGlow + ')';
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT DIFFICULTY', width / 2, 80);
        
        // Add secondary glow layer
        ctx.shadowColor = 'rgba(168, 85, 247, ' + (titleGlow * 0.5) + ')';
        ctx.shadowBlur = 30;
        ctx.fillText('SELECT DIFFICULTY', width / 2, 80);
        
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw subtitle with effects
     */
    drawSubtitle(ctx, width, time) {
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        
        // Animated text with subtle glow
        const textAlpha = 0.8 + Math.sin(time * 1.5) * 0.2;
        ctx.fillStyle = `rgba(125, 133, 144, ${textAlpha})`;
        ctx.fillText('Choose your survival challenge level', width / 2, 110);
    }
    
    /**
     * Draw saved game notice
     */
    drawSavedGameNotice(ctx, width, time) {
        const pulseAlpha = 0.7 + Math.sin(time * 3) * 0.3;
        ctx.fillStyle = `rgba(86, 211, 100, ${pulseAlpha})`;
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        
        // Add glow to saved game notice
        ctx.shadowColor = 'rgba(86, 211, 100, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(`💾 Saved Game Available`, width / 2, 135);
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw instructions with animated effects
     */
    drawInstructions(ctx, width, time) {
        ctx.font = '14px Courier New';
        const instructionAlpha = 0.6 + Math.sin(time * 2.5) * 0.2;
        ctx.fillStyle = `rgba(88, 166, 255, ${instructionAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('Hover and click to select difficulty', width / 2, 155);
    }
    
    /**
     * Draw enhanced difficulty options with better visuals
     */
    drawEnhancedDifficultyOptions(ctx, width, height, difficultyHitAreas, hoveredDifficulty, difficultyKeys, time) {
        let y = 200;
        const spacing = 110;
        
        // Reset difficulty hit areas
        difficultyHitAreas.length = 0;
        
        difficultyKeys.forEach((diffKey, index) => {
            const difficulty = DIFFICULTY_LEVELS[diffKey];
            const isHovered = index === hoveredDifficulty;
            
            // Create enhanced hit area
            const hitArea = {
                x: width / 2 - 200,
                y: y - 25,
                width: 400,
                height: 95,
                index: index
            };
            difficultyHitAreas.push(hitArea);
            
            // Animated hover effects
            const hoverScale = isHovered ? 1.02 : 1;
            const hoverOffset = isHovered ? Math.sin(time * 4) * 2 : 0;
            
            ctx.save();
            ctx.translate(width / 2, y + 25);
            ctx.scale(hoverScale, hoverScale);
            ctx.translate(-width / 2, -(y + 25));
            
            // Enhanced background with gradient
            if (isHovered) {
                const hoverGradient = ctx.createLinearGradient(hitArea.x, hitArea.y, hitArea.x + hitArea.width, hitArea.y + hitArea.height);
                const rgbColor = this.hexToRgb(difficulty.color);
                hoverGradient.addColorStop(0, `rgba(${rgbColor}, 0.2)`);
                hoverGradient.addColorStop(0.5, `rgba(${rgbColor}, 0.35)`);
                hoverGradient.addColorStop(1, `rgba(${rgbColor}, 0.2)`);
                ctx.fillStyle = hoverGradient;
            } else {
                ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
            }
            
            // Draw enhanced rounded rectangle
            this.drawRoundedRect(ctx, hitArea.x, hitArea.y + hoverOffset, hitArea.width, hitArea.height, 12);
            ctx.fill();
            
            // Enhanced border with glow
            if (isHovered) {
                ctx.shadowColor = difficulty.color;
                ctx.shadowBlur = 15;
                ctx.strokeStyle = difficulty.color;
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = '#30363d';
                ctx.lineWidth = 1;
            }
            
            this.drawRoundedRect(ctx, hitArea.x, hitArea.y + hoverOffset, hitArea.width, hitArea.height, 12);
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Enhanced difficulty icon and name
            ctx.fillStyle = difficulty.color;
            ctx.font = isHovered ? 'bold 24px Courier New' : 'bold 20px Courier New';
            ctx.textAlign = 'left';
            
            // Draw icon with glow
            if (isHovered) {
                ctx.shadowColor = difficulty.color;
                ctx.shadowBlur = 10;
            }
            
            const iconX = width / 2 - 170;
            const nameX = width / 2 - 140;
            ctx.fillText(difficulty.emoji, iconX, y + 15 + hoverOffset);
            ctx.fillText(difficulty.name, nameX, y + 15 + hoverOffset);
            ctx.shadowBlur = 0;
            
            // Enhanced description with better formatting
            ctx.fillStyle = isHovered ? '#c9d1d9' : '#8b949e';
            ctx.font = isHovered ? 'bold 15px Courier New' : '14px Courier New';
            
            if (difficulty.healthRegenInterval > 0) {
                const minutes = Math.floor(difficulty.healthRegenInterval / 60000);
                const seconds = Math.floor((difficulty.healthRegenInterval % 60000) / 1000);
                const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                ctx.fillText(`❤️ Health regeneration: Every ${timeText}`, nameX, y + 40 + hoverOffset);
            } else {
                ctx.fillStyle = isHovered ? '#f85149' : '#da3633';
                ctx.fillText(`💀 No health regeneration - Extreme challenge!`, nameX, y + 40 + hoverOffset);
            }
            
            // Add difficulty rating stars
            this.drawDifficultyRating(ctx, nameX, y + 65 + hoverOffset, index + 1, isHovered, difficulty.color);
            
            ctx.restore();
            y += spacing;
        });
    }
    
    /**
     * Draw difficulty rating stars
     */
    drawDifficultyRating(ctx, x, y, level, isHovered, color) {
        ctx.font = isHovered ? '16px Courier New' : '14px Courier New';
        ctx.fillStyle = isHovered ? '#f0f6fc' : '#7d8590';
        ctx.fillText('Challenge: ', x, y);
        
        const starX = x + 85;
        for (let i = 0; i < 4; i++) {
            if (i < level) {
                ctx.fillStyle = color;
                if (isHovered) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 5;
                }
            } else {
                ctx.fillStyle = '#30363d';
                ctx.shadowBlur = 0;
            }
            ctx.fillText('★', starX + i * 20, y);
        }
        ctx.shadowBlur = 0;
    }
    
    /**
     * Draw footer with version info
     */
    drawFooter(ctx, width, height, time) {
        ctx.font = '12px Courier New';
        const footerAlpha = 0.4 + Math.sin(time * 1.5) * 0.1;
        ctx.fillStyle = `rgba(125, 133, 144, ${footerAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('Version v2.1.0 | June 2025', width / 2, height - 30);
        ctx.fillText('Click a difficulty to start the game', width / 2, height - 15);
    }
    
    /**
     * Draw the changelog with game updates and improvements
     */
    drawChangelog() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Animated background with gradient
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.98)');
        gradient.addColorStop(0.6, 'rgba(21, 32, 43, 0.95)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
          // Animated particles background
        const time = Date.now() * 0.001;
        
        // Floating particles
        for (let i = 0; i < 10; i++) {
            const x = (Math.sin(time * 0.2 + i * 1.8) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.3 + i * 0.9) * 0.5 + 0.5) * height;
            const alpha = 0.05 + Math.sin(time + i) * 0.02;
            const size = 1 + Math.sin(time * 0.7 + i) * 1;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
          // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 24px Courier New';        ctx.textAlign = 'center';
        ctx.fillText('CHANGELOG', width / 2, 60);
        
        // Version info
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#79c0ff';
        ctx.fillText(`Current Version: ${this.game.changelogData.version} - ${this.game.changelogData.lastUpdated}`, width / 2, 85);
        
        // Instructions
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.fillText('Press [C] or [Esc] to Return', width / 2, 110);
        
        // Changelog entries
        let y = 150;
        const maxHeight = height - 180;
        const lineHeight = 18;
        
        for (let entryIndex = 0; entryIndex < this.game.changelogData.entries.length && y < maxHeight; entryIndex++) {
            const entry = this.game.changelogData.entries[entryIndex];
            
            // Entry header
            ctx.fillStyle = '#f0f6fc';
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`${entry.version} - ${entry.date}`, 40, y);
            
            // Entry title
            ctx.fillStyle = '#79c0ff';
            ctx.font = '16px Courier New';
            ctx.fillText(entry.title, 40, y + 25);
            
            y += 45;
            
            // Entry changes
            ctx.fillStyle = '#8b949e';
            ctx.font = '14px Courier New';
            
            for (let i = 0; i < entry.changes.length && y < maxHeight; i++) {
                const change = entry.changes[i];
                ctx.fillText(change, 60, y);
                y += lineHeight;
            }
            
            y += 20; // Space between entries
        }
        
        ctx.restore();
    }
      /**
     * Draw the leaderboard with smooth animations
     */
    drawLeaderboard(leaderboardSystem, tabHitAreas) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Animated background with gradient (similar to other screens)
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.98)');
        gradient.addColorStop(0.6, 'rgba(21, 32, 43, 0.95)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
          // Animated particles in background
        const time = Date.now() * 0.001;
        
        // Primary particles
        for (let i = 0; i < 8; i++) {
            const x = (Math.sin(time * 0.3 + i * 1.5) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.2 + i * 0.7) * 0.5 + 0.5) * height;
            const alpha = 0.05 + Math.sin(time + i) * 0.03;
            const size = 2 + Math.sin(time * 0.7 + i) * 1;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }          // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 LEADERBOARD', width / 2, 60);// Draw difficulty tabs
        if (!tabHitAreas) {
            tabHitAreas = [];
        }
        this.drawDifficultyTabs(ctx, width, tabHitAreas);          // Online/Offline status indicator
        const statusText = this.game.leaderboardSystem.isOnline ? `🌐 Online` : `💾 Offline`;
        const statusColor = this.game.leaderboardSystem.isOnline ? '#40d158' : '#f85149';
        ctx.font = '12px Courier New';
        ctx.fillStyle = statusColor;
        ctx.textAlign = 'right';
        ctx.fillText(statusText, width - 20, 30);
        
        // Instructions        ctx.font = '14px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        let instructionText = `ESC: Return to menu • E: Upload score`;
        
        // Add additional instructions if player has options available
        if (this.game.leaderboardSystem.hasPlayerEntryInCurrentDifficulty()) {
            instructionText += ` • DEL: Delete entry`;
        }
        if (this.game.leaderboardSystem.getSavedPlayerName()) {
            instructionText += ` • N: Change name`;
        }
        
        ctx.fillText(instructionText, width / 2, 130);
        
        // Display the leaderboard entries
        const entries = this.game.leaderboardSystem.getLeaderboard(this.game.leaderboardSystem.selectedDifficulty);
        const tableWidth = 600; // Reduced width since we removed Date column
        const tableX = (width - tableWidth) / 2;
        let tableY = 170;          // Table header
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'left';
        ctx.font = '16px Courier New';        ctx.fillText('Rank', tableX, tableY);
        ctx.fillText('Name', tableX + 100, tableY);
        ctx.fillText('Score', tableX + 350, tableY);
        ctx.fillText('Time', tableX + 500, tableY);
        
        tableY += 30;
          
        // Table rows
        entries.forEach((entry, index) => {
            // Background for rows (alternating)
            ctx.fillStyle = index % 2 === 0 ? 'rgba(22, 27, 34, 0.7)' : 'rgba(33, 38, 45, 0.7)';
            
            // Highlight user's entry if it exists
            if (this.game.leaderboardSystem.uploadResult && 
                this.game.leaderboardSystem.uploadResult.success &&
                entry.id === this.game.leaderboardSystem.uploadResult.entryId) {
                ctx.fillStyle = 'rgba(62, 138, 64, 0.4)'; // Green highlight
            }
            
            ctx.fillRect(tableX - 20, tableY - 20, tableWidth, 40);
            
            // Rank with medal for top 3
            ctx.textAlign = 'left';
            let rankDisplay = `${index + 1}.`;
            
            if (index === 0) {
                rankDisplay = '🥇 1.';
                ctx.fillStyle = '#ffd700';
            } else if (index === 1) {
                rankDisplay = '🥈 2.';
                ctx.fillStyle = '#c0c0c0';
            } else if (index === 2) {
                rankDisplay = '🥉 3.';
                ctx.fillStyle = '#cd7f32';
            } else {
                ctx.fillStyle = '#f0f6fc';
            }
            
            ctx.font = index < 3 ? 'bold 16px Courier New' : '16px Courier New';
            ctx.fillText(rankDisplay, tableX, tableY);            // Draw profile picture if available
            const pixelSize = 1.5;  // Size of each pixel in the profile picture            // Calculate name width first to position elements properly
            ctx.fillStyle = '#f0f6fc';
            ctx.font = '16px Courier New';
            const displayName = entry.name.length > 16 ? entry.name.substring(0, 15) + '…' : entry.name;
            const nameWidth = ctx.measureText(displayName).width;
            
            // Name (draw it now)
            ctx.fillStyle = '#f0f6fc';
            ctx.font = '16px Courier New';
            ctx.fillText(displayName, tableX + 100, tableY);
              // Score with emphasis
            ctx.font = index < 3 ? 'bold 16px Courier New' : '16px Courier New';
            ctx.fillStyle = index < 3 ? '#ffd700' : '#f0f6fc';
            ctx.fillText(`${entry.score}`, tableX + 350, tableY);
            
            // Time (formatted)
            ctx.font = '16px Courier New';
            ctx.fillStyle = '#f0f6fc';
            const minutes = Math.floor(entry.survivalTime / 60);
            const seconds = Math.floor(entry.survivalTime % 60);
            const timeFormatted = `${minutes}m ${seconds}s`;
            ctx.fillText(timeFormatted, tableX + 500, tableY);
            
            tableY += 40;
        });
          // Display message if no entries
        if (entries.length === 0) {            ctx.fillStyle = '#8b949e';
            ctx.textAlign = 'center';
            ctx.font = '18px Courier New';
            ctx.fillText('No scores yet', width/2, 250);
            ctx.fillText('Be the first!', width/2, 280);
        }
        
        // Handle upload prompt display (name input)
        if (this.game.leaderboardSystem.showUploadPrompt) {
            this.drawUploadPrompt();
        }
        
        // Display upload result message if exists
        const result = this.game.leaderboardSystem.uploadResult;
        if (result && !this.game.leaderboardSystem.showUploadPrompt) {
            const messageColor = result.success ? '#40d158' : '#f85149';
            const messageY = entries.length > 0 ? tableY + 20 : 340;
            
            ctx.fillStyle = messageColor;
            ctx.textAlign = 'center';
            ctx.font = 'bold 16px Courier New';
            ctx.fillText(result.message, width/2, messageY);
        }
        
        ctx.restore();
    }
      /**
     * Draw difficulty tabs for leaderboard
     */
    drawDifficultyTabs(ctx, width, tabHitAreas) {
        const tabs = this.game.leaderboardSystem.getDifficultyTabs();
        const tabWidth = 120;
        const tabHeight = 30;
        const tabsStartX = width / 2 - ((tabWidth * tabs.length) / 2);
        const tabY = 85;
        
        // Clear previous hit areas - ensure array is initialized
        if (!tabHitAreas) {
            tabHitAreas = [];
        } else {
            tabHitAreas.length = 0;
        }
        
        // Draw tabs
        tabs.forEach((difficulty, index) => {
            const tabX = tabsStartX + (index * tabWidth);
            const difficultyInfo = DIFFICULTY_LEVELS[difficulty];
            const isSelected = this.game.leaderboardSystem.isTabSelected(difficulty);
            
            // Tab background
            ctx.fillStyle = isSelected ? 
                `rgba(${this.hexToRgb(difficultyInfo.color)}, 0.3)` : 
                'rgba(21, 32, 43, 0.5)';
            
            // Draw tab with rounded top
            ctx.beginPath();
            ctx.moveTo(tabX, tabY + tabHeight);
            ctx.lineTo(tabX, tabY + 5);
            ctx.quadraticCurveTo(tabX, tabY, tabX + 5, tabY);
            ctx.lineTo(tabX + tabWidth - 5, tabY);
            ctx.quadraticCurveTo(tabX + tabWidth, tabY, tabX + tabWidth, tabY + 5);
            ctx.lineTo(tabX + tabWidth, tabY + tabHeight);
            ctx.fill();
            
            // Tab border
            ctx.strokeStyle = isSelected ? difficultyInfo.color : '#30363d';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(tabX, tabY + tabHeight);
            ctx.lineTo(tabX, tabY + 5);
            ctx.quadraticCurveTo(tabX, tabY, tabX + 5, tabY);
            ctx.lineTo(tabX + tabWidth - 5, tabY);
            ctx.quadraticCurveTo(tabX + tabWidth, tabY, tabX + tabWidth, tabY + 5);
            ctx.lineTo(tabX + tabWidth, tabY + tabHeight);
            ctx.stroke();
            
            // Tab text
            ctx.fillStyle = isSelected ? difficultyInfo.color : '#8b949e';
            ctx.font = isSelected ? 'bold 14px Courier New' : '14px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`${difficultyInfo.emoji} ${difficultyInfo.name}`, tabX + tabWidth / 2, tabY + 20);
              // Store tab hit area for mouse interaction
            tabHitAreas.push({
                x: tabX,
                y: tabY,
                width: tabWidth,
                height: tabHeight,
                difficulty
            });
        });
    }
    
    /**
     * Draw the score upload prompt dialog
     */
    drawUploadPrompt() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Dialog box dimensions
        const dialogWidth = 400;
        const dialogHeight = 300;
        const dialogX = (width - dialogWidth) / 2;
        const dialogY = (height - dialogHeight) / 2;
        
        // Dialog background
        ctx.fillStyle = '#161b22';
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.stroke();
          // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Courier New';
        ctx.fillText('UPLOAD SCORE', width / 2, dialogY + 40);
        
        // Score info
        const { score, difficulty, survivalTime } = this.game.leaderboardSystem.currentUpload;
        const difficultyInfo = DIFFICULTY_LEVELS[difficulty];
        
        // Format survival time properly
        const minutes = Math.floor(survivalTime / 60);
        const seconds = Math.floor(survivalTime % 60);
        const timeFormatted = `${minutes}m ${seconds}s`;
        
        ctx.fillStyle = '#8b949e';
        ctx.font = '16px Courier New';
        ctx.fillText(`Score: ${score} - Difficulty: ${difficultyInfo.name} - Time: ${timeFormatted}`, width / 2, dialogY + 80);
        
        // Name input box
        const inputBoxWidth = 300;
        const inputBoxHeight = 40;
        const inputBoxX = (width - inputBoxWidth) / 2;
        const inputBoxY = dialogY + 120;
        
        ctx.fillStyle = '#21262d';
        this.drawRoundedRect(ctx, inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight, 4);
        ctx.fill();
        
        ctx.strokeStyle = this.game.leaderboardSystem.nameInputActive ? '#58a6ff' : '#30363d';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, inputBoxX, inputBoxY, inputBoxWidth, inputBoxHeight, 4);
        ctx.stroke();
        
        // Player name text
        ctx.fillStyle = '#f0f6fc';
        ctx.textAlign = 'left';
        ctx.font = '18px Courier New';
        
        const playerName = this.game.leaderboardSystem.playerName;
        const displayName = playerName.length > 0 ? playerName : 'Anonymous';
        ctx.fillText(displayName, inputBoxX + 10, inputBoxY + 27);
        
        // Input cursor blinking
        if (this.game.leaderboardSystem.nameInputActive) {
            const cursorX = inputBoxX + 10 + ctx.measureText(displayName).width + 2;
            const now = Date.now();
            if ((now % 1000) < 500) {
                ctx.fillStyle = '#58a6ff';
                ctx.fillRect(cursorX, inputBoxY + 7, 2, inputBoxHeight - 14);
            }
        }
          // Instructions
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'center';
        ctx.font = '14px Courier New';
        ctx.fillText('Press [U] to upload or [Esc] to cancel', width / 2, dialogY + 190);
        ctx.fillText('(Upload is optional)', width / 2, dialogY + 220);
    }    /**
     * Draw the reset confirmation dialog
     */
    drawResetConfirmationDialog() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Dialog box dimensions
        const dialogWidth = 500;
        const dialogHeight = 350;
        const dialogX = (width - dialogWidth) / 2;
        const dialogY = (height - dialogHeight) / 2;
        
        // Dialog background
        ctx.fillStyle = '#161b22';
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#f85149';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, dialogX, dialogY, dialogWidth, dialogHeight, 8);
        ctx.stroke();
          // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px Courier New';
        ctx.fillText('RESET PROGRESS', width / 2, dialogY + 50);
        
        // Warning subtitle
        ctx.fillStyle = '#f85149';
        ctx.font = '18px Courier New';
        ctx.fillText('⚠️  WARNING: This will permanently delete:', width / 2, dialogY + 85);
        
        // List of items that will be deleted
        ctx.fillStyle = '#7d8590';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        const itemsX = dialogX + 100;
        let itemY = dialogY + 115;        const items = [
            'Your current save game',
            'All upgrade progress',
            'All achievements',
            'Game statistics',
            'High scores'
        ];
        
        items.forEach(item => {
            ctx.fillText(item, itemsX, itemY);
            itemY += 25;
        });
        
        // Warning message
        ctx.fillStyle = '#f85149';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText('Type "RESET" to confirm or [Esc] to cancel', width / 2, dialogY + 230);
        
        // Buttons
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonSpacing = 40;
        const buttonY = dialogY + 280;
        
        // Cancel button
        const cancelX = width / 2 - buttonWidth - buttonSpacing / 2;
        
        ctx.fillStyle = '#21262d';
        this.drawRoundedRect(ctx, cancelX, buttonY, buttonWidth, buttonHeight, 4);
        ctx.fill();
        
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, cancelX, buttonY, buttonWidth, buttonHeight, 4);
        ctx.stroke();
          ctx.fillStyle = '#8b949e';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('CANCEL', cancelX + buttonWidth / 2, buttonY + 25);
        
        // Confirm button
        const confirmX = width / 2 + buttonSpacing / 2;
          ctx.fillStyle = 'rgba(218, 54, 51, 0.3)';
        this.drawRoundedRect(ctx, confirmX, buttonY, buttonWidth, buttonHeight, 4);
        ctx.fill();
        
        ctx.strokeStyle = '#f85149';
        this.drawRoundedRect(ctx, confirmX, buttonY, buttonWidth, buttonHeight, 4);
        ctx.stroke();
        
        ctx.fillStyle = '#f85149';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText('RESET', confirmX + buttonWidth / 2, buttonY + 25);// Store button hit areas for click handling
        // Ensure the game has resetDialogHitAreas initialized
        if (!this.game.resetDialogHitAreas) {
            this.game.resetDialogHitAreas = [];
        }
        
        this.game.resetDialogHitAreas.length = 0; // Clear existing hit areas
        this.game.resetDialogHitAreas.push(
            {
                x: cancelX,
                y: buttonY,
                width: buttonWidth,
                height: buttonHeight,
                action: 'cancel'
            },
            {
                x: confirmX,
                y: buttonY,
                width: buttonWidth,
                height: buttonHeight,
                action: 'confirm'
            }
        );
    }
    
    /**
     * Draw pause overlay with instructions and a semi-transparent background
     */
    drawPauseOverlay() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(13, 17, 23, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // Pause icon
        ctx.fillStyle = 'rgba(240, 246, 252, 0.8)';
        ctx.fillRect(width / 2 - 30, height / 2 - 50, 20, 60);
        ctx.fillRect(width / 2 + 10, height / 2 - 50, 20, 60);
          // Pause text
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', width / 2, height / 2 + 50);
        
        // Instructions
        ctx.fillStyle = '#8b949e';
        ctx.font = '16px Courier New';        ctx.fillText('Press [Space] to Resume', width / 2, height / 2 + 85);
        ctx.fillText('Click to Restart', width / 2, height / 2 + 115);
        ctx.fillText('Press [Escape] to Change Difficulty', width / 2, height / 2 + 145);
        ctx.fillText('Press [L] to View Leaderboards', width / 2, height / 2 + 175);
    }
    
    /**
     * Draw game over overlay with score and restart instructions
     */
    drawGameOverOverlay() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        const time = Date.now();
        const fadeStart = this.game.gameOverStartTime || time;
        const fadeProgress = Math.min(1, (time - fadeStart) / 1000); // 1 second fade in
        
        // Ease-in-cubic for smoother animation
        const easedProgress = fadeProgress < 0.5 ? 4 * fadeProgress * fadeProgress * fadeProgress : 1 - Math.pow(-2 * fadeProgress + 2, 3) / 2;
        
        // Semi-transparent overlay with animation
        ctx.fillStyle = `rgba(13, 17, 23, ${0.7 * easedProgress})`;
        ctx.fillRect(0, 0, width, height);
          // Game over text with fade in - use random death message
        const textAlpha = easedProgress;        ctx.fillStyle = `rgba(248, 81, 73, ${textAlpha})`;
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        const deathMessage = this.game.gameOverMessage || 'GAME OVER';
        ctx.fillText(deathMessage, width / 2, height / 2 - 50);
        
        // Death reason if available
        if (this.game.gameOverReason) {
            ctx.fillStyle = `rgba(240, 246, 252, ${textAlpha})`;
            ctx.font = '18px Courier New';
            ctx.fillText(`Cause: ${this.game.gameOverReason}`, width / 2, height / 2 - 20);
        }
            // Player stats
        if (this.game.player) {
            ctx.fillStyle = `rgba(88, 166, 255, ${textAlpha})`;            ctx.fillText(`Final Score: ${this.game.score}`, width / 2, height / 2 + 10);
            
            // Show survival time - use gameOverStartTime to stop counting after death
            const survivalTime = Math.floor((this.game.gameOverStartTime - this.game.startTime) / 1000);
            ctx.fillText(`Survival Time: ${survivalTime}s`, width / 2, height / 2 + 30);            // Show best score
            const difficultyBestScore = this.game.bestScores[this.game.selectedDifficulty] || 0;
            if (difficultyBestScore > 0) {
                ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
                ctx.fillText(`Best Score: ${difficultyBestScore}`, width / 2, height / 2 + 50);
            }
        }
            // Restart instructions (only show when fade is nearly complete)
        if (easedProgress > 0.7) {
            const instructionAlpha = Math.max(0, (easedProgress - 0.7) / 0.3);
            ctx.fillStyle = `rgba(86, 211, 100, ${instructionAlpha})`;
            ctx.font = '18px Courier New';
            ctx.fillText('Click to Restart', width / 2, height / 2 + 80);
              // Additional controls
            ctx.fillStyle = `rgba(121, 192, 255, ${instructionAlpha})`;
            ctx.font = '14px Courier New';
            ctx.fillText('Press [Escape] to Change Difficulty', width / 2, height / 2 + 100);
              
            ctx.font = '12px Courier New';
            ctx.fillStyle = `rgba(125, 133, 144, ${instructionAlpha})`;
            ctx.fillText('Press [P] to View Game Stats', width / 2, height / 2 + 120);
            
            // Upload score button (only if score is high enough and not already uploaded)
            if (this.game.score >= 100 && this.game.leaderboardSystem && 
                this.game.leaderboardSystem.canUploadForDifficulty(this.game.selectedDifficulty)) {
                ctx.fillStyle = `rgba(255, 215, 0, ${instructionAlpha})`;
                ctx.font = 'bold 14px Courier New';
                ctx.fillText('Press [U] to Upload Score', width / 2, height / 2 + 145);
            }
        }
        
        // High score celebration
        if (this.game.isNewHighScore) {
            this.drawHighScoreCelebration(time, easedProgress);
        }
    }
    
    /**
     * Draw flashy high score celebration animation
     */
    drawHighScoreCelebration(currentTime, baseAlpha = 1) {
        if (!this.game.gameOverStartTime) return;
        
        const ctx = this.ctx;
        const timeElapsed = currentTime - this.game.gameOverStartTime;
        
        // Only show celebration animations after a short delay
        if (timeElapsed < 500) return;
        
        const animTime = timeElapsed - 500; // Adjusted time for animation
        
        // New high score text with pulsing/glowing effect
        const pulseRate = 0.002; // Speed of the pulse
        const pulseIntensity = 0.2; // How much the pulse affects the size/color
        const pulseFactor = 1 + pulseIntensity * Math.sin(animTime * pulseRate);
        
        ctx.save();
        ctx.textAlign = 'center';
        
        // Shadow for glow effect
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 15 * pulseFactor;
          // High score text
        ctx.font = `bold ${32 * pulseFactor}px Courier New`;
        ctx.fillStyle = `rgba(255, 215, 0, ${baseAlpha})`;
        ctx.fillText('🎉 NEW HIGH SCORE! 🎉', this.canvas.width / 2, this.canvas.height / 3 - 20);
        
        // Show the score increase
        if (this.game.previousBestDistance > 0) {
            const increase = this.game.bestDistance - this.game.previousBestDistance;
            ctx.font = `${18 * pulseFactor}px Courier New`;
            ctx.fillStyle = `rgba(255, 160, 0, ${baseAlpha})`;
            ctx.fillText(`Improved by ${increase} meters!`, this.canvas.width / 2, this.canvas.height / 3 + 15);
        }
        
        ctx.restore();
        
        // Add celebratory particles
        this.drawCelebrationParticles(currentTime, baseAlpha);
        
        // Add fireworks effect at intervals
        if (timeElapsed % 1000 < 50) {
            this.drawFireworkBurst(
                this.canvas.width * (0.3 + Math.random() * 0.4), 
                this.canvas.height * (0.2 + Math.random() * 0.3),
                timeElapsed,
                baseAlpha
            );
        }
    }
    
    /**
     * Draw animated celebration particles
     */
    drawCelebrationParticles(currentTime, alpha) {
        const ctx = this.ctx;
        const time = currentTime * 0.001;
          // Confetti-like particles
        for (let i = 0; i < 10; i++) {
            const x = (Math.sin(time * 0.4 + i * 343.3) * 0.5 + 0.5) * this.canvas.width;
            const y = ((time * 0.05 + i * 0.1) % 1) * this.canvas.height;
            
            // Alternating confetti colors
            const colors = ['#ff6b6b', '#4cc9f0', '#ffd166', '#4361ee', '#7209b7', '#f72585'];
            ctx.fillStyle = `rgba(${this.hexToRgb(colors[i % colors.length])}, ${alpha * 0.7})`;
            
            // Rotation effect
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 2 + i);
            ctx.fillRect(-4, -2, 8, 4); // Rectangle confetti
            ctx.restore();
        }
    }
    
    /**
     * Draw firework burst effect
     */
    drawFireworkBurst(centerX, centerY, time, alpha) {
        const ctx = this.ctx;
        const particleCount = 30;
        const maxRadius = 70;
        const animationDuration = 1000; // milliseconds
        
        // Calculate current radius based on time
        const progress = (time % animationDuration) / animationDuration;
        const radius = maxRadius * progress;
        const fadeAlpha = alpha * (1 - progress); // Fade out as it expands
        
        // Draw particles radiating outward
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Color cycling
            const hue = (time * 0.05 + i * 5) % 360;
            ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${fadeAlpha})`;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Occasional trailing particles
            if (i % 3 === 0) {
                const trailX = centerX + Math.cos(angle) * (radius * 0.8);
                const trailY = centerY + Math.sin(angle) * (radius * 0.8);
                ctx.beginPath();
                ctx.arc(trailX, trailY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    /**
     * Create a utility method to draw rounded rectangles
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    /**
     * Convert hex color to rgb format
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse the RGB components
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }    /**
     * Draw the enhanced shop interface with improved layout and design
     */
    drawShop(shopHitAreas = []) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Clear hit areas
        shopHitAreas.length = 0;
        
        // Get scroll offset from game instance
        const scrollOffset = this.game.shopScrollOffset || 0;
        
        // Animated background with gradient (similar to other screens)
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.98)');
        gradient.addColorStop(0.6, 'rgba(21, 32, 43, 0.95)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Subtle animated particles
        const time = Date.now() * 0.001;
        for (let i = 0; i < 10; i++) {
            const x = (Math.sin(time * 0.2 + i * 1.8) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.15 + i * 0.9) * 0.5 + 0.5) * height;
            const alpha = 0.03 + Math.sin(time + i) * 0.02;
            const size = 1.5 + Math.sin(time * 0.6 + i) * 0.8;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Header panel
        const headerHeight = 80;
        ctx.fillStyle = 'rgba(22, 27, 34, 0.9)';
        ctx.fillRect(0, 0, width, headerHeight);
        ctx.strokeStyle = 'rgba(48, 54, 61, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, headerHeight - 1, width, 1);
          // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('UPGRADE SHOP', width / 2, 35);
        
        // Currency display with enhanced styling
        const currentCurrency = this.game.upgradeSystem ? this.game.upgradeSystem.getDataPackets() : 0;
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`Data Packets: ${currentCurrency}`, width / 2, 60);
          // Get shop system
        const shopSystem = this.game.shopSystem;
        if (!shopSystem) {
            ctx.fillStyle = '#f85149';
            ctx.fillText('Shop system not available', width / 2, height / 2);
            ctx.restore();
            return;
        }
          // Enhanced categories with better organization
        const categories = {            movement: { name: 'Movement Control', color: '#40d158', emoji: '🏃', bgColor: 'rgba(64, 209, 88, 0.1)' },
            score: { name: 'Score Collection', color: '#58a6ff', emoji: '📊', bgColor: 'rgba(88, 166, 255, 0.1)' },
            mechanics: { name: 'Game Mechanics', color: '#f85149', emoji: '⚙️', bgColor: 'rgba(248, 81, 73, 0.1)' },
            revive: { name: 'Survival & Revival', color: '#a5a5a5', emoji: '💚', bgColor: 'rgba(165, 165, 165, 0.1)' },
            cosmetic: { name: 'Cosmetic Effects', color: '#d2a8ff', emoji: '✨', bgColor: 'rgba(210, 168, 255, 0.1)' }
        };
          // Calculate layout
        const contentStartY = headerHeight + 20;
        const availableHeight = height - contentStartY - 60;
        const contentWidth = Math.min(1000, width - 40);
        const leftMargin = (width - contentWidth) / 2;
        
        // Setup scrollable content area clipping
        const scrollableAreaY = contentStartY;
        const scrollableAreaHeight = availableHeight;
        
        // Save context for clipping
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, scrollableAreaY, width, scrollableAreaHeight);
        ctx.clip();
          // Use grid layout for better organization
        const itemsPerRow = Math.floor(contentWidth / 320); // Each item is 300px + 20px margin
        const itemWidth = 300;
        const itemHeight = 120;
        const itemSpacing = 20;
        
        let currentY = contentStartY - scrollOffset;
        
        // CALCULATE STABLE CONTENT HEIGHT FIRST (independent of drawing)
        let totalContentHeight = contentStartY;
        Object.entries(categories).forEach(([categoryKey, categoryInfo]) => {
            const categoryUpgrades = shopSystem.getUpgradesByCategory(categoryKey);
            if (categoryUpgrades.length === 0) return;
            
            // Category header height
            totalContentHeight += 40 + 10; // sectionHeaderHeight + spacing
            
            // Calculate rows needed for this category
            const rowsNeeded = Math.ceil(categoryUpgrades.length / itemsPerRow);
            totalContentHeight += rowsNeeded * (itemHeight + itemSpacing);
            
            // Spacing between categories
            totalContentHeight += 40;
        });
        
        // Add consistent bottom padding to ensure all content is accessible and allow more scrolling
        totalContentHeight += -20; // Much larger bottom padding for extensive downward scrolling
          // Draw categories in organized sections
        Object.entries(categories).forEach(([categoryKey, categoryInfo]) => {
            const categoryUpgrades = shopSystem.getUpgradesByCategory(categoryKey);
            
            if (categoryUpgrades.length === 0) return;
            
            // Category section header
            const sectionHeaderHeight = 40;
            
            // Only draw if visible in viewport
            if (currentY + sectionHeaderHeight >= scrollableAreaY && currentY <= scrollableAreaY + scrollableAreaHeight) {
                ctx.fillStyle = categoryInfo.bgColor;
                ctx.fillRect(leftMargin, currentY, contentWidth, sectionHeaderHeight);
                
                // Category title
                ctx.fillStyle = categoryInfo.color;
                ctx.font = 'bold 18px Courier New';
                ctx.textAlign = 'left';
                ctx.fillText(`${categoryInfo.emoji} ${categoryInfo.name}`, leftMargin + 15, currentY + 25);
                  // Category upgrade count
                ctx.fillStyle = '#8b949e';
                ctx.font = '14px Courier New';
                ctx.textAlign = 'right';
                const ownedCount = categoryUpgrades.filter(upgrade => shopSystem.isOwned(upgrade.id)).length;
                ctx.fillText(`Owned: ${ownedCount}/${categoryUpgrades.length}`, leftMargin + contentWidth - 15, currentY + 25);
            }
            
            currentY += sectionHeaderHeight + 10;            // Draw upgrades in grid layout
            let currentX = leftMargin;
            let itemsInCurrentRow = 0;
            const categoryStartY = currentY;
            
            categoryUpgrades.forEach((upgrade, index) => {
                const isOwned = shopSystem.isOwned(upgrade.id);
                const canAfford = currentCurrency >= upgrade.price;
                
                // Move to next row if needed
                if (itemsInCurrentRow >= itemsPerRow) {
                    currentY += itemHeight + itemSpacing;
                    currentX = leftMargin;
                    itemsInCurrentRow = 0;
                }
                
                // Only draw if visible in viewport
                const itemVisible = currentY + itemHeight >= scrollableAreaY && currentY <= scrollableAreaY + scrollableAreaHeight;
                
                if (itemVisible) {
                    // Upgrade card background with enhanced styling
                    let bgColor, borderColor;
                    if (isOwned) {
                        bgColor = 'rgba(64, 209, 88, 0.15)';
                        borderColor = '#40d158';
                    } else if (canAfford) {
                        bgColor = 'rgba(33, 38, 45, 0.9)';
                        borderColor = categoryInfo.color;
                    } else {
                        bgColor = 'rgba(139, 148, 158, 0.2)';
                        borderColor = '#6e7681';
                    }
                    
                    // Card background
                    ctx.fillStyle = bgColor;
                    this.drawRoundedRect(ctx, currentX, currentY, itemWidth, itemHeight, 12);
                    ctx.fill();
                    
                    // Card border with glow effect for affordable items
                    if (canAfford && !isOwned) {
                        ctx.shadowColor = categoryInfo.color;
                        ctx.shadowBlur = 8;
                    } else {
                        ctx.shadowBlur = 0;
                    }
                    
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = isOwned ? 3 : canAfford ? 2 : 1;
                    this.drawRoundedRect(ctx, currentX, currentY, itemWidth, itemHeight, 12);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    // Status icon
                    const iconSize = 20;
                    const iconX = currentX + itemWidth - iconSize - 10;
                    const iconY = currentY + 10;
                    
                    if (isOwned) {
                        ctx.fillStyle = '#40d158';
                        ctx.font = '16px Courier New';
                        ctx.textAlign = 'center';
                        ctx.fillText('✓', iconX + iconSize/2, iconY + iconSize/2 + 5);
                    } else if (!canAfford) {
                        ctx.fillStyle = '#f85149';
                        ctx.font = '16px Courier New';
                        ctx.textAlign = 'center';
                        ctx.fillText('🔒', iconX + iconSize/2, iconY + iconSize/2 + 5);
                    }
                    
                    // Upgrade name
                    ctx.font = 'bold 16px Courier New';
                    ctx.fillStyle = isOwned ? '#40d158' : canAfford ? '#f0f6fc' : '#8b949e';
                    ctx.textAlign = 'left';
                    ctx.fillText(upgrade.name, currentX + 15, currentY + 30);
                      // Price display
                    ctx.font = '14px Courier New';
                    if (isOwned) {
                        ctx.fillStyle = '#40d158';
                        ctx.textAlign = 'right';
                        ctx.fillText('OWNED', currentX + itemWidth - 35, currentY + 30);} else {                        ctx.fillStyle = canAfford ? '#ffd700' : '#8b949e';
                        ctx.textAlign = 'right';
                        ctx.fillText(`${upgrade.price} 📦`, currentX + itemWidth - 35, currentY + 30);
                    }
                    
                    // Description with better formatting
                    ctx.font = '12px Courier New';
                    ctx.fillStyle = isOwned ? '#7d8590' : canAfford ? '#c9d1d9' : '#6e7681';
                    ctx.textAlign = 'left';
                    
                    // Wrap description text
                    const maxWidth = itemWidth - 30;
                    const words = upgrade.description.split(' ');
                    let line = '';
                    let lineY = currentY + 55;
                    const lineHeight = 14;
                    let linesDrawn = 0;
                    const maxLines = 3;
                    
                    for (let i = 0; i < words.length && linesDrawn < maxLines; i++) {
                        const testLine = line + words[i] + ' ';
                        const metrics = ctx.measureText(testLine);
                        
                        if (metrics.width > maxWidth && i > 0) {
                            ctx.fillText(line.trim(), currentX + 15, lineY);
                            line = words[i] + ' ';
                            lineY += lineHeight;
                            linesDrawn++;
                        } else {
                            line = testLine;
                        }
                    }
                    
                    if (linesDrawn < maxLines && line.trim()) {
                        // Add ellipsis if text was truncated
                        const finalLine = line.trim();
                        if (ctx.measureText(finalLine).width > maxWidth) {
                            let truncated = finalLine;
                            while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
                                truncated = truncated.slice(0, -1);
                            }
                            ctx.fillText(truncated + '...', currentX + 15, lineY);
                        } else {
                            ctx.fillText(finalLine, currentX + 15, lineY);
                        }
                    }
                }                // Debug logging for specific problematic upgrades (reduced frequency)
                if ((upgrade.id === 'score-multiplier' || upgrade.id === 'datapack-multiplier') && 
                    Math.random() < 0.1) { // Only log 10% of the time to reduce spam
                    
                }
                
                // Add hit area for purchasable upgrades (always add, scroll offset will be handled in click detection)
                if (!isOwned && canAfford) {
                    shopHitAreas.push({
                        x: currentX,
                        y: currentY,
                        width: itemWidth,
                        height: itemHeight,
                        upgradeId: upgrade.id,
                        action: 'buy'
                    });
                    
                    // Extra debug for problematic upgrades (reduced frequency)
                    if ((upgrade.id === 'score-multiplier' || upgrade.id === 'datapack-multiplier') && 
                        Math.random() < 0.1) { // Only log 10% of the time to reduce spam
                       
                    }
                } else if ((upgrade.id === 'score-multiplier' || upgrade.id === 'datapack-multiplier') && 
                          Math.random() < 0.1) { // Only log 10% of the time to reduce spam console.log(`❌ No hit area added for ${upgrade.id}: isOwned=${isOwned}, canAfford=${canAfford}`);
                }
                
                currentX += itemWidth + itemSpacing;
                itemsInCurrentRow++;
            });            // Calculate correct end position after processing all items in the category
            // If we have items in the current row, we need to account for the current row height
            if (itemsInCurrentRow > 0) {
                currentY += itemHeight + itemSpacing; // Add spacing after last row
            }
            
            // Move to next section with proper spacing
            currentY += 40; // Increased spacing between categories
        });
        
        // Content height is already calculated above - no need to recalculate here
        
        // Restore context (remove clipping)
        ctx.restore();// Calculate max scroll with proper bounds
        // Make sure we can scroll enough to see all content plus extra padding
        const maxScroll = Math.max(0, totalContentHeight - scrollableAreaHeight);
        
        // Use stable maxScroll value to prevent flickering and inconsistency
        this.game.shopMaxScroll = maxScroll;
        
        // Temporary debug logging to verify scroll bounds
        
        
        // Draw scroll indicators if content is scrollable
        if (maxScroll > 0) {
            const indicatorWidth = 4;
            const indicatorHeight = scrollableAreaHeight;
            const indicatorX = width - 20;
            const indicatorY = scrollableAreaY;
            
            // Scroll track
            ctx.fillStyle = 'rgba(139, 148, 158, 0.3)';
            ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
            
            // Scroll thumb
            const thumbHeight = Math.max(20, (scrollableAreaHeight / totalContentHeight) * indicatorHeight);
            const thumbY = indicatorY + (scrollOffset / maxScroll) * (indicatorHeight - thumbHeight);
            
            ctx.fillStyle = 'rgba(88, 166, 255, 0.8)';
            ctx.fillRect(indicatorX, thumbY, indicatorWidth, thumbHeight);
            
            // Scroll indicators text
            ctx.font = '12px Courier New';            ctx.fillStyle = '#7d8590';
            ctx.textAlign = 'right';
            if (scrollOffset > 0) {
                ctx.fillText('▲', width - 30, scrollableAreaY + 20);
            }
            if (scrollOffset < maxScroll) {
                ctx.fillText('▼', width - 30, scrollableAreaY + scrollableAreaHeight - 10);
            }
        }
          // Footer with instructions (always at bottom, not scrollable)
        const footerY = height - 40;
        ctx.fillStyle = 'rgba(22, 27, 34, 0.9)';
        ctx.fillRect(0, footerY, width, 40);
        ctx.strokeStyle = 'rgba(48, 54, 61, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, footerY, width, 1);        ctx.font = '14px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        const scrollText = maxScroll > 0 ? ' • Arrow Keys or Mouse Wheel: Scroll' : '';
        ctx.fillText('[Enter] to Purchase • [Tab] to Change Category • [S] or [Esc] to Exit', width / 2, footerY + 25);
        
        ctx.restore();
    }    /**
     * Utility method to draw a rounded rectangle (used for shop items)
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }    /**
     * Draw the home screen with play and credits buttons
     */
    drawHomeScreen(homeHitAreas, hoveredHomeButton) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Animated background with gradient
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.98)');
        gradient.addColorStop(0.6, 'rgba(21, 32, 43, 0.95)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
          // Animated particles in background
        const time = Date.now() * 0.001;
        for (let i = 0; i < 10; i++) {
            const x = (width * ((i * 37 + time * 0.5) % 1));
            const y = (height * ((i * 73 + time * 0.3) % 1));
            const alpha = Math.sin(time + i) * 0.5 + 0.5;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha * 0.1})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Main title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        
        // Add subtle glow effect to title
        ctx.shadowColor = '#58a6ff';
        ctx.shadowBlur = 20;
        ctx.fillText('CODE RUNNER', width / 2, 150);
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Subtitle
        ctx.font = '20px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.fillText('Escape the Digital Maze', width / 2, 190);
        
        // Clear hit areas and prepare for button drawing
        homeHitAreas.length = 0;
        
        // Button configuration
        const buttonWidth = 280;
        const buttonHeight = 60;
        const buttonSpacing = 20;
        const startY = height / 2 - 20;
        
        const buttons = [
            { text: 'PLAY GAME', action: 'play', color: '#40d158' },
            { text: 'CREDITS', action: 'credits', color: '#58a6ff' }
        ];
        
        buttons.forEach((button, index) => {
            const isHovered = index === hoveredHomeButton;
            const x = width / 2 - buttonWidth / 2;
            const y = startY + (buttonHeight + buttonSpacing) * index;
            
            // Store hit area
            homeHitAreas.push({
                x,
                y,
                width: buttonWidth,
                height: buttonHeight,
                action: button.action
            });
            
            // Button background with hover effect
            const alpha = isHovered ? 0.4 : 0.2;
            ctx.fillStyle = button.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.drawRoundedRect(ctx, x, y, buttonWidth, buttonHeight, 8);
            ctx.fill();
            
            // Button border with glow on hover
            if (isHovered) {
                ctx.shadowColor = button.color;
                ctx.shadowBlur = 15;
            }
            ctx.strokeStyle = button.color;
            ctx.lineWidth = isHovered ? 3 : 2;
            this.drawRoundedRect(ctx, x, y, buttonWidth, buttonHeight, 8);
            ctx.stroke();
            ctx.shadowBlur = 0;
              // Button text - always visible with high contrast
            ctx.fillStyle = isHovered ? '#ffffff' : '#f0f6fc';
            ctx.font = isHovered ? 'bold 20px Courier New' : 'bold 18px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(button.text, width / 2, y + buttonHeight / 2 + 8);
        });
        
        // Version info
        ctx.fillStyle = '#7d8590';
        ctx.font = '12px Courier New';
        ctx.fillText(`Version ${this.game.changelogData.version} | ${this.game.changelogData.lastUpdated}`, width / 2, height - 50);
        
        // Instructions
        ctx.fillStyle = '#58a6ff';
        ctx.font = '14px Courier New';
        ctx.fillText('Use mouse to navigate • ESC: Exit', width / 2, height - 25);
        
        ctx.restore();
    }

    /**
     * Draw the credits screen
     */
    drawCreditsScreen(creditsHitAreas) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Same background style as home screen
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.98)');
        gradient.addColorStop(0.6, 'rgba(21, 32, 43, 0.95)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.99)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#58a6ff';
        ctx.shadowBlur = 15;
        ctx.fillText('CREDITS', width / 2, 120);
        ctx.shadowBlur = 0;
        
        // Clear hit areas
        creditsHitAreas.length = 0;
          // Credits content
        const credits = [
            'NanoShade',
            'PixelPunk',
            'GhostPixel'
        ];
        
        ctx.font = '24px Courier New';
        ctx.fillStyle = '#40d158';
        
        let yOffset = 220;
        const lineSpacing = 50;
        
        credits.forEach((name, index) => {
            // Add subtle animation
            const time = Date.now() * 0.001;
            const animOffset = Math.sin(time + index * 0.5) * 2;
            
            ctx.fillText(name, width / 2, yOffset + animOffset);
            yOffset += lineSpacing;
        });
        
        // Back button
        const backButtonWidth = 200;
        const backButtonHeight = 50;
        const backButtonX = width / 2 - backButtonWidth / 2;
        const backButtonY = height - 120;
        
        creditsHitAreas.push({
            x: backButtonX,
            y: backButtonY,
            width: backButtonWidth,
            height: backButtonHeight,
            action: 'back'
        });
        
        // Draw back button
        ctx.fillStyle = 'rgba(88, 166, 255, 0.2)';
        this.drawRoundedRect(ctx, backButtonX, backButtonY, backButtonWidth, backButtonHeight, 8);
        ctx.fill();
        
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, backButtonX, backButtonY, backButtonWidth, backButtonHeight, 8);
        ctx.stroke();
        
        ctx.fillStyle = '#58a6ff';
        ctx.font = '18px Courier New';
        ctx.fillText('BACK TO HOME', width / 2, backButtonY + backButtonHeight / 2 + 6);
        
        // Instructions
        ctx.fillStyle = '#7d8590';
        ctx.font = '14px Courier New';
        ctx.fillText('Click BACK or press ESC to return', width / 2, height - 25);
        
        ctx.restore();
    }
    
    /**
     * Draw the post-animation popup with changelog and tutorial tips
     */
    drawPostAnimationPopup() {
       
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.save();
        
        // Animated background overlay
        const time = Date.now() * 0.001;
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, 'rgba(13, 17, 23, 0.95)');
        gradient.addColorStop(0.6, 'rgba(21, 32, 43, 0.92)');
        gradient.addColorStop(1, 'rgba(13, 17, 23, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Animated particles
        for (let i = 0; i < 15; i++) {
            const x = (Math.sin(time * 0.3 + i * 1.2) * 0.3 + 0.5) * width;
            const y = (Math.cos(time * 0.2 + i * 0.8) * 0.3 + 0.5) * height;
            const alpha = 0.1 + Math.sin(time + i) * 0.05;
            const size = 1 + Math.sin(time * 0.5 + i) * 0.5;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Main popup container
        const popupWidth = Math.min(800, width * 0.9);
        const popupHeight = Math.min(600, height * 0.8);
        const popupX = (width - popupWidth) / 2;
        const popupY = (height - popupHeight) / 2;
        
        // Popup background with border
        ctx.fillStyle = 'rgba(22, 27, 34, 0.95)';
        this.drawRoundedRect(ctx, popupX, popupY, popupWidth, popupHeight, 12);
        ctx.fill();
        
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 2;
        this.drawRoundedRect(ctx, popupX, popupY, popupWidth, popupHeight, 12);
        ctx.stroke();
        
        // Header
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 WELCOME TO CODERUNNER!', width / 2, popupY + 50);
        
        // Subtitle
        ctx.fillStyle = '#79c0ff';
        ctx.font = '18px Courier New';
        ctx.fillText('Quick Tips & Latest Updates', width / 2, popupY + 80);
        
        // Content area with scrolling
        const contentY = popupY + 110;
        const contentHeight = popupHeight - 180;
        
        // Setup clipping for content area
        ctx.save();
        ctx.beginPath();
        ctx.rect(popupX + 20, contentY, popupWidth - 40, contentHeight);
        ctx.clip();
        
        let currentY = contentY + 20;
        const lineHeight = 22;
        
        // Tutorial Tips Section
        ctx.fillStyle = '#40d158';
        ctx.font = 'bold 20px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('🚀 Quick Tutorial Tips:', popupX + 40, currentY);
        currentY += 35;
          const tips = [
            '• Use ARROW KEYS or WASD to move and jump',
            '• Avoid spikes, saws, and lasers to stay alive',
            '• Collect data packets (📦) to earn upgrade points',
            '• Press Q to open the upgrade shop anytime',
            '• Health regenerates over time (depends on difficulty)',
            '• Click anywhere to pause and view your progress',
            '• Try different difficulties for varied experiences!',
            '• 🎯 Pro Tip: Customize your controls in the settings menu'
        ];
        
        ctx.fillStyle = '#e6edf3';
        ctx.font = '16px Courier New';
        
        tips.forEach(tip => {
            ctx.fillText(tip, popupX + 60, currentY);
            currentY += lineHeight;
        });
        
        currentY += 25;
        
        // Latest Updates Section
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Courier New';
        ctx.fillText('✨ Latest Updates:', popupX + 40, currentY);
        currentY += 35;
        
        const updates = [
            '• Enhanced opening animation with Nanoshade Studios logo',
            '• Improved visual effects and particle systems',
            '• Better upgrade shop organization and UI',
            '• New obstacle types: rotating saws and laser turrets',
            '• Performance optimizations for smoother gameplay',
            '• Enhanced audio system with dynamic music',
            '• Leaderboard system with score uploading'
        ];
        
        ctx.fillStyle = '#e6edf3';
        ctx.font = '16px Courier New';
        
        updates.forEach(update => {
            ctx.fillText(update, popupX + 60, currentY);
            currentY += lineHeight;
        });
        
        // Restore clipping
        ctx.restore();
        
        // Close instructions
        ctx.fillStyle = '#7d8590';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Press [SPACE], [ENTER], or [ESC] to continue to main menu', width / 2, popupY + popupHeight - 40);
        
        // Additional hint
        ctx.fillStyle = '#58a6ff';
        ctx.font = '14px Courier New';
        ctx.fillText('💡 Tip: You can disable opening animations in settings', width / 2, popupY + popupHeight - 15);
        
        ctx.restore();
    }
}
