Phase 3 — Unique Gameplay Systems (FINAL DETAILED VERSION)
This phase introduces three original systems that make CodeRunner stand out and keep the gameplay non-repetitive, skill-based, and addictive across long runs.

⚙️ SYSTEM 1: Time-Swap Mechanic (Parallel Timeline Glitching)
Overview
The player presses E to switch between two realities: the "Normal Timeline" and a "Corrupted Timeline." Each has different tiles, hazards, collectibles, and secrets.

Design Goals
Add decision-making and memorization to the speed.

Make glitch-based gameplay a core identity.

Build levels with dual-purpose design.

Task Breakdown
1. Core Architecture

 Define currentTimeline as a global state variable.

 Create two tilemap layers per segment (e.g. tiles_normal, tiles_corrupt)

 Build tile rendering logic to only draw the active layer.

 Load both versions into memory at start (don't re-fetch on swap).

 Add timeline tags to hazards/coins so they only activate in the right layer.

2. Swap Mechanism

 On E key press, toggle timeline.

 Animate glitch swap: use CRT screen distortion, 1-frame color inversion, then a hue shift.

 Add glitchy SFX (glitch-swap.ogg).

 Cancel jump momentum briefly during swap to avoid unfair movement bugs.

3. Cooldown & Timer System

 Add a 5-second max limit in corrupted timeline.

 Show countdown bar on top of screen (color-coded).

 When time ends, auto-swap and trigger "overheat" warning effect.

 Prevent player from swapping again for 3 seconds after overheating.

4. Timeline-Specific Differences

 Breakable walls only visible in corrupted version.

 Bonus coins only available in normal version.

 Corrupted version = more hazards but also short-cut tiles.

 Add one enemy type (e.g. glitch drone) that only exists in corrupted space.

5. UX/Visual Feedback

 Top-right icon: timeline state ("N"/"C" with color tint)

 Change background palette slightly between timelines.

 Add screen corner glitching as overlay for 0.3s during transition.

🧠 SYSTEM 2: Memory Maze Zone
Overview
At key distances (every 1000m), player enters a memory zone: spikes are revealed briefly, then hidden. Must recall safe path under pressure.

Design Goals
Add a moment of slow-paced tension.

Train short-term memory and visual learning.

Make survival feel satisfying and rare.

Task Breakdown
1. Trigger & Level Logic

 Check for player reaching 1000m, 2000m, etc.

 Lock camera and insert custom tilemap for memory room (10x10 layout).

 Temporarily disable distance counter during this room.

2. Maze Layouts

 Make 6 layouts stored in JSON or JS objects (tiles + trap positions).

 Design spike tiles to blink red before disappearing.

 Add false paths and misdirection tiles.

3. Reveal and Hide Phase

 Phase 1: All spike tiles visible for 3 seconds.

 Phase 2: Flash of glitch overlay → hide all spikes.

 Phase 3: Player moves normally, spikes still active but hidden.

4. Gameplay Consequences

 If player survives, reward with:

300 bonus coins,

exclusive “Memory Chip” collectible,

temporary stat buff (10s speed boost).

 If hit: trigger glitch death with memory echo animation and reset to title.

 Log total maze wins/losses in player profile.

5. Visual Polish

 Apply color drain effect while inside memory maze.

 Mute music + overlay heartbeat SFX or ambient tension.

 Flash warning icon: “MEMORY ZONE ENTERED”

🔧 SYSTEM 3: Risky Hack Upgrades (Glitched Buffs)
Overview
Every 500m, time freezes and offers 3 random buffs — but each has a corrupted drawback. These stack until the run ends.

Design Goals
Create build variety.

Increase replayability with random choices.

Make runs feel unique every time.

Task Breakdown
1. Trigger and Flow

 Detect player hitting 500m, 1000m, etc.

 Stop game: freeze enemies, stop timer.

 Show overlay: “Hack Access Granted…”

2. Hack Upgrade UI

 Show 3 hack cards (randomly picked).

 Add card names, icons, animated borders.

 Each shows:

 One main buff

 One visual or gameplay glitch downside

 Player can click/select one card.

3. Effect System

 On select, apply effect to player stats.

 Add downside effects to background systems (e.g. increase spike spawn rate).

 Stack effects across hacks using array tracking system.

 Show current hacks in HUD: use small icons with hover tooltip.

4. Upgrade Pool (10+ Examples)

 Overclock Legs: +20% move speed / Causes camera jitter every 8s

 Phase Fragment: Pass through enemies / Lose double coins on hit

 Rapid Reload: Shorter cooldown on swaps / UI briefly freezes every 15s

 Double Dash: Extra midair dash / Controls randomly invert for 0.2s once per 20s

 Nano Scanner: Hidden traps pulse red / Distorts HUD visuals

 Quantum Boots: Jump twice as high / Floor tiles flicker when landing

 Hardlight Shield: Absorb 1 hit / Drops framerate artificially for 0.5s when hit

 Clone Flicker: Fake player trail / Can trigger fake coins

 Glitch Cannon: Every 4th jump causes explosion / Short screen flash

 Scrambled Radar: Auto-detect memory maze layout / Occasionally hides timeline icon

5. Balance & Replayability

 Add 1 in 4 chance of getting a legendary hack (very powerful)

 Randomize names and descriptions slightly for flavor

 Log chosen hacks in run summary screen





🏆 Core Progress Achievements
These reward distance and survival milestones:

Booted Up
Make your first run.
➤ Unlock when the player starts the game for the first time.

Packet Runner
Reach 500m in a single run.

Mainframe Breaker
Reach 2000m in one run.

Infinite Loop
Survive 5 memory mazes.

Glitch Master
Complete a full run without dying once (reach the distance cap or final zone if you add one).

⚡ Skill-Based Achievements
Rewards for doing well with timing, survival, or risk:

Perfect Sync
Survive a memory maze without stepping on a single trap.

Data Phantom
Swap timelines 10 times in one run.

Firewall Jumper
Dodge 50 hazards in one run.

Risk Taker
Take 3 hack upgrades in a single run.

Echo Runner
Trigger a speed glitch (dash + timeline swap combo).

💀 Death-Based Achievements
Funny or ironic ones for dying:

404 – Skill Not Found
Die within the first 100m.

Fatal Exception
Die in the memory maze 3 times.

System Crash
Trigger 5 traps in one run and survive anyway.

🎨 Customization Achievements
Encourage exploring player features:

Style.exe
Equip a cosmetic skin.

Pixel You
Draw and save a custom profile picture.

Title Hacker
Set your display name from the profile screen.

🧠 Meta Achievements
Cool stuff that shows deep play:

All the Hacks
Unlock and use every available hack upgrade.

Debugging Champ
Finish a full run in debug mode.

Collector Glitch
Collect 10,000 coins total across all runs.

Data Godspeed
Reach 1000m in under 2 minutes.