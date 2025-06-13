/**
 * GameDialogs - Handles all dialog screens and menus
 */

import { GAME_STATES, DIFFICULTY_LEVELS } from '../utils/constants.js';

export class GameDialogs {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this.difficultyHitAreas = [];
        this.tabHitAreas = [];
        this.resetDialogHitAreas = [];
    }

    /**
     * Draw the difficulty selection screen
     */
    drawDifficultySelection() {
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
        
        // Primary particles
        for (let i = 0; i < 15; i++) {
            const x = (Math.sin(time * 0.5 + i * 1.8) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.4 + i * 0.9) * 0.5 + 0.5) * height;
            const alpha = 0.1 + Math.sin(time + i) * 0.03;
            const size = 2 + Math.sin(time * 0.7 + i) * 1;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Title screen header
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT DIFFICULTY', width / 2, 80);
        
        // Subtitle
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.fillText('Choose your health regeneration rate', width / 2, 110);
        
        // Instructions
        ctx.font = '14px Courier New';
        ctx.fillText('Hover and Click to Start Game', width / 2, 140);
        
        // Difficulty options
        let y = 200;
        
        // Reset difficulty hit areas
        this.difficultyHitAreas = [];
          
        this.game.difficultyKeys.forEach((diffKey, index) => {
            const difficulty = DIFFICULTY_LEVELS[diffKey];
            const isHovered = index === this.game.hoveredDifficulty;
            
            // Create hit area for this difficulty
            const hitArea = {
                x: width / 2 - 150,
                y: y - 20,
                width: 300,
                height: 90,
                index: index
            };
            this.difficultyHitAreas.push(hitArea);
            
            // Background for difficulty option
            ctx.fillStyle = isHovered ? 
                `rgba(${this.hexToRgb(difficulty.color)}, 0.3)` : 
                'rgba(13, 17, 23, 0.7)';
            
            // Draw rounded rectangle with border
            this.drawRoundedRect(ctx, hitArea.x, hitArea.y, hitArea.width, hitArea.height, 8);
            ctx.fill();
            
            ctx.strokeStyle = isHovered ? difficulty.color : '#30363d';
            ctx.lineWidth = isHovered ? 2 : 1;
            this.drawRoundedRect(ctx, hitArea.x, hitArea.y, hitArea.width, hitArea.height, 8);
            ctx.stroke();
            
            // Difficulty name
            ctx.fillStyle = difficulty.color;
            ctx.font = isHovered ? 'bold 20px Courier New' : '18px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`${difficulty.emoji} ${difficulty.name}`, width / 2 - 120, y + 10);
            
            // Health regeneration description
            ctx.fillStyle = '#8b949e';
            ctx.font = '14px Courier New';
            if (difficulty.healthRegenInterval > 0) {
                const minutes = Math.floor(difficulty.healthRegenInterval / 60000);
                const seconds = Math.floor((difficulty.healthRegenInterval % 60000) / 1000);
                const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                ctx.fillText(`Health +1 every ${timeText}`, width / 2 - 120, y + 35);
            } else {
                ctx.fillText('No health regeneration', width / 2 - 120, y + 35);
            }
            
            y += 110;
        });
        
        ctx.restore();
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
        for (let i = 0; i < 20; i++) {
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
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
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
    drawLeaderboard() {
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
        for (let i = 0; i < 15; i++) {
            const x = (Math.sin(time * 0.3 + i * 1.5) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.2 + i * 0.7) * 0.5 + 0.5) * height;
            const alpha = 0.05 + Math.sin(time + i) * 0.03;
            const size = 2 + Math.sin(time * 0.7 + i) * 1;
            
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Title
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('LEADERBOARD', width / 2, 60);
          
        // Draw difficulty tabs
        this.drawDifficultyTabs(ctx, width);
        
        // Online/Offline status indicator
        const statusText = this.game.leaderboardSystem.isOnline ? '🌐 ONLINE' : '💾 OFFLINE';
        const statusColor = this.game.leaderboardSystem.isOnline ? '#40d158' : '#f85149';
        ctx.font = '12px Courier New';
        ctx.fillStyle = statusColor;
        ctx.textAlign = 'right';
        ctx.fillText(statusText, width - 20, 30);
        
        // Instructions
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#7d8590';
        ctx.textAlign = 'center';
        let instructionText = 'Click tabs to change difficulty • L/Esc: Return to Game';
        
        // Add additional instructions if player has options available
        if (this.game.leaderboardSystem.hasPlayerEntryInCurrentDifficulty()) {
            instructionText += ' • DEL: Delete Entry';
        }
        if (this.game.leaderboardSystem.getSavedPlayerName()) {
            instructionText += ' • N: Change Name';
        }
        
        ctx.fillText(instructionText, width / 2, 130);
        
        // Display the leaderboard entries
        const entries = this.game.leaderboardSystem.getLeaderboard(this.game.leaderboardSystem.selectedDifficulty);
        const tableWidth = 600; // Reduced width since we removed Date column
        const tableX = (width - tableWidth) / 2;
        let tableY = 170;
        
        // Table header
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'left';
        ctx.font = '16px Courier New';
        ctx.fillText('Rank', tableX, tableY);
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
            ctx.fillText(rankDisplay, tableX, tableY);
            
            // Name (truncated if too long)
            ctx.fillStyle = '#f0f6fc';
            ctx.font = '16px Courier New';
            const displayName = entry.name.length > 16 ? entry.name.substring(0, 15) + '…' : entry.name;
            ctx.fillText(displayName, tableX + 100, tableY);
            
            // Score with emphasis
            ctx.font = index < 3 ? 'bold 16px Courier New' : '16px Courier New';
            ctx.fillStyle = index < 3 ? '#ffd700' : '#f0f6fc';
            ctx.fillText(`${entry.score}m`, tableX + 350, tableY);
            
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
        if (entries.length === 0) {
            ctx.fillStyle = '#8b949e';
            ctx.textAlign = 'center';
            ctx.font = '18px Courier New';
            ctx.fillText('No scores recorded for this difficulty level yet.', width/2, 250);
            ctx.fillText('Be the first to set a record!', width/2, 280);
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
    drawDifficultyTabs(ctx, width) {
        const tabs = this.game.leaderboardSystem.getDifficultyTabs();
        const tabWidth = 120;
        const tabHeight = 30;
        const tabsStartX = width / 2 - ((tabWidth * tabs.length) / 2);
        const tabY = 85;
        
        // Clear previous hit areas
        this.tabHitAreas = [];
        
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
            this.tabHitAreas.push({
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
        ctx.fillText('Upload Your Score', width / 2, dialogY + 40);
        
        // Score info
        const { score, difficulty, survivalTime } = this.game.leaderboardSystem.currentUpload;
        const difficultyInfo = DIFFICULTY_LEVELS[difficulty];
        
        // Format survival time properly
        const minutes = Math.floor(survivalTime / 60);
        const seconds = Math.floor(survivalTime % 60);
        const timeFormatted = `${minutes}m ${seconds}s`;
        
        ctx.fillStyle = '#8b949e';
        ctx.font = '16px Courier New';
        ctx.fillText(`Score: ${score}m - Difficulty: ${difficultyInfo.name} - Time: ${timeFormatted}`, width / 2, dialogY + 80);
        
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
        ctx.fillText('Enter your name and press Enter to submit', width / 2, dialogY + 190);
        ctx.fillText('Press Escape to cancel', width / 2, dialogY + 220);
    }
    
    /**
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
        ctx.fillText('Reset All Game Data?', width / 2, dialogY + 50);
        
        // Warning subtitle
        ctx.fillStyle = '#f85149';
        ctx.font = '18px Courier New';
        ctx.fillText('This action cannot be undone!', width / 2, dialogY + 85);
        
        // List of items that will be deleted
        ctx.fillStyle = '#7d8590';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';
        const itemsX = dialogX + 100;
        let itemY = dialogY + 115;
        const items = [
            '• All shop upgrades and owned items',
            '• Profile information (name, picture, stats)',
            '• Leaderboard entries and scores',
            '• Upload history and player data',
            '• All game progress and achievements'
        ];
        
        items.forEach(item => {
            ctx.fillText(item, itemsX, itemY);
            itemY += 25;
        });
        
        // Warning message
        ctx.fillStyle = '#f85149';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText('Are you sure you want to reset all game data?', width / 2, dialogY + 230);
        
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
        ctx.fillText('Cancel', cancelX + buttonWidth / 2, buttonY + 25);
        
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
        ctx.fillText('Reset', confirmX + buttonWidth / 2, buttonY + 25);
        
        // Store button hit areas for click handling
        this.resetDialogHitAreas = [
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
        ];
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
        ctx.font = '16px Courier New';
        ctx.fillText('Press P to Resume', width / 2, height / 2 + 85);
        ctx.fillText('Press R to Restart', width / 2, height / 2 + 115);
        ctx.fillText('Press D for Difficulty Selection', width / 2, height / 2 + 145);
        ctx.fillText('Press L for Leaderboards', width / 2, height / 2 + 175);
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
        
        // Game over text with fade in
        const textAlpha = easedProgress;
        ctx.fillStyle = `rgba(248, 81, 73, ${textAlpha})`;
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 50);
        
        // Death reason if available
        if (this.game.gameOverReason) {
            ctx.fillStyle = `rgba(240, 246, 252, ${textAlpha})`;
            ctx.font = '18px Courier New';
            ctx.fillText(`Cause: ${this.game.gameOverReason}`, width / 2, height / 2 - 20);
        }
          
        // Player stats
        if (this.game.player) {
            ctx.fillStyle = `rgba(88, 166, 255, ${textAlpha})`;
            ctx.fillText(`Final Distance: ${this.game.score}m`, width / 2, height / 2 + 10);
            
            // Show survival time - use gameOverStartTime to stop counting after death
            const survivalTime = Math.floor((this.game.gameOverStartTime - this.game.startTime) / 1000);
            ctx.fillText(`Survival Time: ${survivalTime}s`, width / 2, height / 2 + 30);
            
            // Show best distance
            if (this.game.bestDistance > 0) {
                ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
                ctx.fillText(`Best Distance: ${this.game.bestDistance}m`, width / 2, height / 2 + 50);
            }
        }
          
        // Restart instructions (only show when fade is nearly complete)
        if (easedProgress > 0.7) {
            const instructionAlpha = Math.max(0, (easedProgress - 0.7) / 0.3);
            ctx.fillStyle = `rgba(86, 211, 100, ${instructionAlpha})`;
            ctx.font = '18px Courier New';
            ctx.fillText('Press [R] to Restart Current Game', width / 2, height / 2 + 80);
            
            // Additional controls
            ctx.fillStyle = `rgba(121, 192, 255, ${instructionAlpha})`;
            ctx.font = '14px Courier New';
            ctx.fillText('Press [D] for Difficulty Selection', width / 2, height / 2 + 100);
              
            ctx.font = '12px Courier New';
            ctx.fillStyle = `rgba(125, 133, 144, ${instructionAlpha})`;
            ctx.fillText('Press [P] to Pause/Resume', width / 2, height / 2 + 120);
            
            // Upload score button (only if score is high enough and not already uploaded)
            if (this.game.score >= 100 && this.game.leaderboardSystem && 
                this.game.leaderboardSystem.canUploadForDifficulty(this.game.selectedDifficulty)) {
                ctx.fillStyle = `rgba(255, 215, 0, ${instructionAlpha})`;
                ctx.font = 'bold 14px Courier New';
                ctx.fillText('Press [E] to Upload Score to Leaderboard', width / 2, height / 2 + 145);
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
        ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 3 - 20);
        
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
        for (let i = 0; i < 20; i++) {
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
    }
}
