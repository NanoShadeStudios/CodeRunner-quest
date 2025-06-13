// This is a reference implementation for the leaderboard methods

/**
 * Handle leaderboard confirm action
 */
function handleLeaderboardConfirm() {
    if (this.leaderboardSystem.showUploadPrompt) {
        // Handle name submission or cancel upload
        if (this.leaderboardSystem.playerName.trim()) {
            this.leaderboardSystem.submitScore(this.leaderboardSystem.playerName);
        } else {
            this.leaderboardSystem.cancelUpload();
        }
    }
}

/**
 * Draw the leaderboard with smooth animations
 */
function drawLeaderboard() {
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
    for (let i = 0; i < 30; i++) {
        const x = (Math.sin(time * 0.5 + i * 0.1) * 0.5 + 0.5) * width;
        const y = (Math.cos(time * 0.3 + i * 0.15) * 0.5 + 0.5) * height;
        const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;
        const size = 1 + Math.sin(time + i) * 0.5;
        
        ctx.fillStyle = `rgba(79, 172, 254, ${alpha})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Trophy icons
    for (let i = 0; i < 8; i++) {
        const x = (Math.sin(time * 0.2 + i * 0.8) * 0.7 + 0.5) * width;
        const y = (Math.cos(time * 0.15 + i * 0.6) * 0.8 + 0.5) * height;
        const alpha = 0.05 + Math.sin(time * 2.5 + i) * 0.03;
        
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.font = '16px Courier New';
        ctx.fillText('🏆', x, y);
    }
    
    // Main title with pulsing effect
    const pulse = Math.sin(time * 3) * 0.1 + 1;
    ctx.fillStyle = '#f0f6fc';
    ctx.font = `bold ${32 * pulse}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText('LEADERBOARD', width / 2, 60);
    
    // Current difficulty display
    const difficultyInfo = DIFFICULTY_LEVELS[this.leaderboardSystem.selectedDifficulty];
    ctx.font = '20px Courier New';
    ctx.fillStyle = difficultyInfo.color;
    ctx.fillText(`${difficultyInfo.emoji} ${difficultyInfo.name}`, width / 2, 100);
    
    // Instructions
    ctx.font = '14px Courier New';
    ctx.fillStyle = '#7d8590';
    ctx.fillText('↑/↓: Change Difficulty   L/Esc: Return to Game', width / 2, 130);
    
    // Display the leaderboard entries
    const entries = this.leaderboardSystem.getLeaderboard(this.leaderboardSystem.selectedDifficulty);
    const tableWidth = 800;
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
    ctx.fillText('Date', tableX + 600, tableY);
    
    tableY += 30;
    
    // Table rows
    entries.forEach((entry, index) => {
        // Background for rows (alternating)
        ctx.fillStyle = index % 2 === 0 ? 'rgba(22, 27, 34, 0.7)' : 'rgba(33, 38, 45, 0.7)';
        
        // Highlight user's entry if it exists
        if (this.leaderboardSystem.uploadResult && 
            this.leaderboardSystem.uploadResult.success &&
            entry.id === this.leaderboardSystem.uploadResult.entryId) {
            ctx.fillStyle = 'rgba(62, 138, 64, 0.4)'; // Green highlight
        }
        
        ctx.fillRect(tableX - 20, tableY - 20, tableWidth, 30);
        
        // Rank with medal for top 3
        ctx.fillStyle = '#f0f6fc';
        ctx.textAlign = 'left';
        ctx.font = '16px Courier New';
        
        let rankDisplay = `${index + 1}`;
        if (index === 0) rankDisplay = '🥇 1';
        else if (index === 1) rankDisplay = '🥈 2';
        else if (index === 2) rankDisplay = '🥉 3';
        
        ctx.fillText(rankDisplay, tableX, tableY);
        
        // Name (truncate if too long)
        const displayName = entry.name.length > 15 ? entry.name.substring(0, 12) + '...' : entry.name;
        ctx.fillText(displayName, tableX + 100, tableY);
          // Score with emphasis
        ctx.font = index < 3 ? 'bold 16px Courier New' : '16px Courier New';
        ctx.fillStyle = index < 3 ? '#ffd700' : '#f0f6fc';
        ctx.fillText(`${entry.score}`, tableX + 350, tableY);
        
        // Time (formatted)
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#f0f6fc';
        const minutes = Math.floor(entry.survivalTime / 60);
        const seconds = entry.survivalTime % 60;
        const timeFormatted = `${minutes}m ${seconds}s`;
        ctx.fillText(timeFormatted, tableX + 500, tableY);
        
        // Date (formatted)
        const date = new Date(entry.timestamp);
        const dateFormatted = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
        ctx.fillText(dateFormatted, tableX + 600, tableY);
        
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
    if (this.leaderboardSystem.showUploadPrompt) {
        this.drawUploadPrompt();
    }
    
    // Display upload result message if exists
    const result = this.leaderboardSystem.uploadResult;
    if (result && !this.leaderboardSystem.showUploadPrompt) {
        const messageColor = result.success ? '#40d158' : '#f85149';
        const messageY = entries.length > 0 ? tableY + 20 : 340;
        
        ctx.fillStyle = messageColor;
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText(result.message, width/2, messageY);
        
        // Show additional rank info
        if (result.success && result.rank) {
            ctx.fillText(`Your rank: #${result.rank}`, width/2, messageY + 30);
        }
    }
    
    ctx.restore();
}

/**
 * Draw the score upload prompt dialog
 */
function drawUploadPrompt() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    // Dialog box
    const dialogWidth = 500;
    const dialogHeight = 250;
    const dialogX = (width - dialogWidth) / 2;
    const dialogY = (height - dialogHeight) / 2;
    
    // Background with gradient
    const gradient = ctx.createLinearGradient(dialogX, dialogY, dialogX, dialogY + dialogHeight);
    gradient.addColorStop(0, '#161b22');
    gradient.addColorStop(1, '#0d1117');
    ctx.fillStyle = gradient;
    
    // Draw rounded rectangle
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
    const { score, difficulty, survivalTime } = this.leaderboardSystem.currentUpload;
    const difficultyInfo = DIFFICULTY_LEVELS[difficulty];
    
    ctx.fillStyle = '#7d8590';
    ctx.font = '14px Courier New';
    ctx.fillText(`${difficultyInfo.emoji} ${difficultyInfo.name} - ${score} - ${Math.floor(survivalTime / 60)}m ${survivalTime % 60}s`, width / 2, dialogY + 70);
    
    // Input field
    const inputWidth = 300;
    const inputX = (width - inputWidth) / 2;
    const inputY = dialogY + 110;
    
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(inputX, inputY, inputWidth, 40);
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(inputX, inputY, inputWidth, 40);
    
    // Player name text with cursor
    ctx.fillStyle = '#f0f6fc';
    ctx.textAlign = 'left';
    ctx.font = '18px Courier New';
    
    const playerName = this.leaderboardSystem.playerName;
    const textX = inputX + 10;
    ctx.fillText(playerName, textX, inputY + 26);
    
    // Blinking cursor
    if (this.leaderboardSystem.nameInputActive && Math.floor(Date.now() / 500) % 2 === 0) {
        const textWidth = ctx.measureText(playerName).width;
        ctx.fillStyle = '#f0f6fc';
        ctx.fillRect(textX + textWidth + 2, inputY + 8, 2, 24);
    }
    
    // Instructions
    ctx.fillStyle = '#7d8590';
    ctx.textAlign = 'center';
    ctx.font = '14px Courier New';
    ctx.fillText('Enter your name and press ENTER to submit', width / 2, dialogY + 170);
    ctx.fillText('Press ESC to cancel', width / 2, dialogY + 190);
    
    // Loading state
    if (this.leaderboardSystem.isUploading) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        ctx.fillStyle = '#56d364';
        ctx.font = '18px Courier New';
        ctx.fillText('Uploading score...', width / 2, height / 2);
        
        // Animated upload indicator
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
            const dotAlpha = 0.3 + 0.7 * Math.sin(time + i * 2);
            ctx.fillStyle = `rgba(86, 211, 100, ${dotAlpha})`;
            ctx.fillRect(width / 2 + (i - 1) * 15, height / 2 + 20, 8, 8);
        }
    }
}
