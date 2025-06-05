// This file contains code patches for the leaderboard system
// To be manually integrated into the Game.js file

// 1. Add to createSystems method
this.tabHitAreas = [];
this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

// 2. Add this new method for handling tab clicks
/**
 * Handle canvas mouse clicks (for leaderboard tabs)
 */
handleCanvasClick(e) {
    if (this.gameState !== GAME_STATES.LEADERBOARD || !this.tabHitAreas.length) return;
    
    // Get click position relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if any tab was clicked
    for (const tab of this.tabHitAreas) {
        if (x >= tab.x && x <= tab.x + tab.width && 
            y >= tab.y && y <= tab.y + tab.height) {
            this.leaderboardSystem.selectTab(tab.difficulty);
            break;
        }
    }
}

// 3. Add this new method for drawing tabs
/**
 * Draw difficulty tabs for leaderboard
 */
drawDifficultyTabs(ctx, width) {
    const tabs = this.leaderboardSystem.getDifficultyTabs();
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
        const isSelected = this.leaderboardSystem.isTabSelected(difficulty);
        
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

// 4. Add this utility method for color conversion
/**
 * Convert hex color to rgb format
 */
hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse r, g, b values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}
