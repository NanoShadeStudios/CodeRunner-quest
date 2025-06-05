Game Title: CodeRunner-Quest
Theme/Focus:
You’re a digital explorer inside a glitched computer world. The game is a 2D infinite “code stream” platformer, where you run through never-ending streams of data made of code fragments, memory blocks, and digital traps. Instead of hand-made maps, everything is procedurally generated—so it’s always fresh, never repetitive.

You must dodge bugs, collect data packets, solve short logic puzzles while running, and shift between "Debug Mode" and "Live Mode" to interact with different types of obstacles. It’s fast, satisfying, and full of cool mini-challenges and upgrades as you progress.

Phase 1: Core Systems + Infinite Stream Demo ✅ COMPLETED
Goal: Build a playable demo where:

✅ The player moves and jumps

✅ The world scrolls infinitely

✅ Tiles and obstacles generate automatically

✅ You can switch modes (Debug/Live) to avoid different traps

SECTION 1: Project Setup ✅ COMPLETED
✅ Create folders:

src/ – all game code

assets/ – placeholder sprites (boxes, icons)

data/ – if needed for configs

✅ Make index.html with <canvas>

✅ Make game.js with a working game loop:

update() for logic

draw() for rendering

requestAnimationFrame() for timing

SECTION 2: Player System ✅ COMPLETED
✅ Create a player object with:

x, y position

vx, vy velocity

width, height

mode = "live" or "debug"

✅ Handle keyboard input:

Left/right to move

Space to jump

Tab (or Shift) to swap modes

✅ Add gravity and floor collision

SECTION 3: World Generator ✅ COMPLETED
✅ Create a 2D array buffer that stores generated tiles

✅ Each new row randomly spawns:

Safe floor tiles

Gaps (fall traps)

Spikes (only visible in Live mode)

Glitches (only passable in Debug mode)

✅ Continuously shift the world leftward as the player "runs"

✅ Generate new chunks as the old ones go off screen

SECTION 4: Mode-Swap System ✅ COMPLETED✅ Add a simple toggle between Live and Debug

✅ In Live mode:

Spikes are visible and dangerous

Glitch blocks don’t appear

✅ In Debug mode:

Spikes disappear

Glitch blocks appear and are solid

✅ Add a short cooldown to prevent spamming mode switch

SECTION 5: Basic Collision + Game Over ✅ COMPLETED
✅ Detect when the player touches:

Spikes (in Live mode) → lose

Falls into gap → lose

✅ Simple game over screen and restart key

================================================================================
🚀 STARTING PHASE 2: Gameplay Depth + Progression Systems
================================================================================
Date Started: May 30, 2025

Phase 2: Gameplay Depth + Progression Systems 🎯 IN PROGRESS
Goal: Make the game feel deeper and more rewarding. Add things to keep the player coming back: scoring, upgrades, mini-challenges, and more dynamic obstacles.

SECTION 6: Scoring & Combo System ✅ COMPLETED
✅ Add a score variable that increases over time and with item pickups

✅ Show score in a corner (HUD)

✅ Add a combo system:

✅ Staying in Live Mode longer without dying increases combo multiplier

✅ Breaking the streak resets combo

✅ Display multiplier on screen

SECTION 7: Data Packets & Pickups ✅ COMPLETED
✅ Generate collectible "data packets" that appear in the stream

✅ In Debug Mode, show corrupted ones that give bonus points

✅ Add a simple animation when collected

✅ Store total pickups for future upgrades

✅ Implemented floating point animations for collected packets

✅ Added visual rendering with green (normal) and purple (corrupted) effects

✅ Connected to scoring system with combo multipliers

SECTION 8: Temporary Power-Ups ✅ COMPLETED
✅ Create power-ups like:

✅ Slow-Mo Chip: slows scrolling for 5 seconds

✅ Invis-Wipe: makes spikes harmless for a few seconds

✅ Auto-Debug: auto-switches to the correct mode before a trap

✅ Show power-up timer on HUD

✅ Implemented visual power-up spawning in world chunks

✅ Added animated power-up collection and effects

✅ Enhanced player visual feedback when power-ups are active

SECTION 9: Enemy Types (No AI yet) ✅ COMPLETED
📋 Add simple "bug" enemies that move side to side

Only visible in one mode

Touching them causes damage or instant death

 Create hitboxes and basic collisions

 Leave room for “purging” them later

SECTION 10: Mini-Challenges in Stream ✅ COMPLETED
✅ Randomly generate mini logic puzzles that pause the runner flow:

✅ "Fix the broken loop" – re-order lines of fake code

✅ "Binary gate lock" – select correct path based on code shown

✅ Optional: reward score bonus or power-up when solved

✅ Skip button available, but costs points

✅ Implemented comprehensive challenge system with two challenge types
✅ Added time limits and visual feedback for challenges
✅ Integrated challenge system with main game loop and pause mechanics
✅ Added debug triggers for testing (C for random, 1 for code loop, 2 for binary gate)

SECTION 11: Basic Upgrade Menu (not permanent yet) ✅ COMPLETED
✅ At game start or game over, show a basic menu:

✅ Upgrade jump height

✅ Increase score multiplier

✅ Extend power-up time

✅ Use data packets (collected in-game) as currency

✅ Upgrades reset when restarting game (save later in Phase 3)

✅ Enhanced animated upgrade menu with visual effects
✅ Menu navigation with arrow keys (↑/↓), Enter/Space to purchase
✅ Real-time cost calculation with scaling prices
✅ Visual feedback for purchases and insufficient funds
✅ Accessible via 'U' key during gameplay

================================================================================
🎯 DIFFICULTY SELECTION SYSTEM COMPLETED - June 2, 2025
================================================================================

SECTION 12: Difficulty Selection & Health Regeneration ✅ COMPLETED
✅ Implemented difficulty selection screen at game start:

🔹 Easy: Fast regeneration - Player health recovers every 1 minute
   Perfect for casual players or those new to the game

🔸 Medium: Moderate regeneration - Health recovers every 3 minutes  
   Balanced rate designed for players with some experience

🔴 Hard: Slow regeneration - Health regenerates every 7 minutes
   For experienced players who want a challenge

❌ Extreme: No regeneration - Health does not regenerate at all
   Ultimate survival challenge for hardcore players

✅ Enhanced UI features:
   - Beautiful difficulty selection screen with animated particles
   - Color-coded difficulty indicators with emojis
   - Real-time regeneration timer display during gameplay
   - Difficulty indicator shown in top-left corner during play
   - Updated health regeneration system based on selected difficulty

✅ Technical Implementation:
   - Added DIFFICULTY_LEVELS constants with regeneration intervals
   - Created navigateDifficultyUp/Down methods for menu navigation
   - Updated health regeneration system to use difficulty-based timing
   - Enhanced UI to display appropriate regeneration information
   - Integrated difficulty selection into game state management

================================================================================
🔧 MAJOR CODE REFACTORING COMPLETED - May 30, 2025
================================================================================

✅ SYNTAX ERRORS FIXED: Resolved all JavaScript syntax errors in game.js (missing braces, method declarations)

✅ MODULAR ARCHITECTURE: Refactored monolithic game.js (1210 lines) into organized modules:
   - camera.js: Camera system for smooth player following
   - scoringSystem.js: Scoring, combos, and data packet collection
   - inputHandler.js: Keyboard input management  
   - renderer.js: All drawing and UI rendering functions
   - game.js: Clean main game engine (reduced to ~280 lines)

✅ IMPROVED CODE ORGANIZATION:
   - Separated concerns into logical modules
   - Eliminated code duplication
   - Enhanced maintainability and readability
   - Added proper error handling

✅ ENHANCED PERFORMANCE:
   - Optimized rendering pipeline
   - Improved camera smoothing algorithms
   - Better memory management for animations

✅ GAMEPLAY IMPROVEMENTS:
   - Smooth and responsive controls
   - Enhanced visual feedback for data packet collection
   - Improved health regeneration system (30-second intervals)
   - Better game over screen with fade effects



   Phase: Debug Mode
🎯 Goal:
Create a dedicated debug mode that helps you:

Track bugs while playing

Toggle important info on screen

Log useful output to the console

Easily activate/deactivate debug mode

🧱 Core Structure (Enable/Disable)
 1. Add a Global Debug Toggle
 In main.js or config.js, add a variable:

js
Copy
Edit
let debugMode = true; // Set to false when publishing
 Add a keyboard shortcut to toggle it:

js
Copy
Edit
window.addEventListener("keydown", (e) => {
  if (e.key === "F1") {
    debugMode = !debugMode;
    console.log("Debug mode:", debugMode);
  }
});
📊 On-Screen Debug Info
 2. Draw Player Stats on Screen
 In your render loop (or draw() function), add this inside:

js
Copy
Edit
if (debugMode) {
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";
  ctx.fillText(`x: ${player.x.toFixed(2)}`, 10, 20);
  ctx.fillText(`y: ${player.y.toFixed(2)}`, 10, 35);
  ctx.fillText(`speed: ${player.speed.toFixed(2)}`, 10, 50);
  ctx.fillText(`distance: ${player.distance.toFixed(0)}`, 10, 65);
}
 Add more debug data as needed (tile positions, background offset, etc.)

🧪 Debug Tools for Bugs
 3. Console Log Key Events
 Log when certain things happen:

js
Copy
Edit
if (debugMode) console.log("Tiles spawned:", tiles.length);
if (debugMode) console.log("Player died at distance:", player.distance);
 Log input states (left/right/jump/etc.) to detect lag or missing input:

js
Copy
Edit
if (debugMode) console.log("Input:", input);
🚦 Visual Debug Indicators
 4. Show Collision Boxes
 In your render() or draw() function:

js
Copy
Edit
if (debugMode) {
  ctx.strokeStyle = "red";
  ctx.strokeRect(player.x, player.y, player.width, player.height);
  
  tiles.forEach(tile => {
    ctx.strokeStyle = "yellow";
    ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
  });
}
🐛 Optional Debug Features
 5. Add Slow-Motion Debug Mode
 Inside your update() loop:

js
Copy
Edit
if (debugMode && slowMotionEnabled) {
  deltaTime *= 0.25; // Slow everything down
}
 Press F2 to toggle slow motion:

js
Copy
Edit
let slowMotionEnabled = false;
window.addEventListener("keydown", (e) => {
  if (e.key === "F2") {
    slowMotionEnabled = !slowMotionEnabled;
    console.log("Slow motion:", slowMotionEnabled);
  }
});
 6. Add “Force Die” Shortcut
 Use F3 to simulate game over:

js
Copy
Edit
window.addEventListener("keydown", (e) => {
  if (e.key === "F3") {
    if (debugMode) {
      player.health = 0;
      console.log("Forced death triggered (F3)");
    }
  }
});
7. Add FPS Counter
 Track and draw FPS:

js
Copy
Edit
let lastTime = performance.now();
let fps = 0;

function updateFPS() {
  const now = performance.now();
  const delta = now - lastTime;
  fps = 1000 / delta;
  lastTime = now;
}

function drawFPS(ctx) {
  if (debugMode) {
    ctx.fillStyle = "lime";
    ctx.font = "12px monospace";
    ctx.fillText(`FPS: ${fps.toFixed(0)}`, 10, 80);
  }
}
 Call updateFPS() and drawFPS(ctx) in your game loop.

🧼 Cleanup on Release
 8. Disable for Public Builds
 Before publishing the game:

Set debugMode = false

Remove any heavy logging

Keep shortcuts but make them do nothing if debugMode === false

