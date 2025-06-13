Debugging.md – CodeRunner Debug Phase
Goal: Go through each part of the game and fix any bugs, glitches, or polish issues. Each section is broken into detailed, small tasks.

SECTION 1: Movement Bugs
 Check if the player sometimes clips into the floor or ceiling during jumps

 Confirm gravity is consistent and resets correctly after mode switch

 Fix any jittery movement when landing

 Test if player can get stuck on the side of glitch blocks

 Make sure jump height doesn’t change randomly when switching modes mid-air

SECTION 2: Camera Issues
 Make sure camera always moves at the same speed as the player

 Confirm player stays locked to the correct x-position (like 1/3 of screen)

 Fix any jitter when camera moves between frames

 Make sure world elements stay in sync with camera movement (e.g., background, pickups)

 Test camera in both Live and Debug Mode — no snapping or lag

SECTION 3: Mode Swap Problems
 Check if the player dies unfairly right after swapping modes

 Confirm glitch blocks only appear in Debug Mode and are solid

 Confirm spikes only deal damage in Live Mode

 Fix any flickering or weird frame delay when switching modes

 Check if power-ups carry across mode swap properly

SECTION 4: Object Spawning & Infinite Generation
 Make sure platforms and hazards spawn ahead of the camera

 Confirm they despawn after leaving the screen (avoid memory leaks)

 Fix any overlapping object spawns (like spikes inside blocks)

 Double-check object types that should only appear in one mode

 Test if scroll speed scaling over time messes with spawn timing

SECTION 5: UI + Score
 Make sure score updates smoothly without frame drops

 Confirm combo multiplier resets properly on hit or mode fail

 Fix UI overlap when in fullscreen or different resolutions

 Check if HUD elements like power-up timers fade out cleanly

 Test that the score doesn't bug out during mini-puzzles

SECTION 6: Power-Ups
 Confirm timers work and count down accurately

 Fix any power-up effects that stay after they expire

 Check collisions on pickup items — no clipping

 Test edge cases (e.g. switching modes mid-power-up)

 Make sure power-ups can’t be collected off-screen or during paused events

SECTION 7: Enemies & Puzzles
 Test that enemies only appear in the correct mode

 Fix any broken enemy hitboxes

 Make sure puzzles don’t soft-lock the player or appear too fast

 Confirm skip button in puzzles works and subtracts points correctly

 Check puzzle UI scaling with screen size

SECTION 8: Misc & Polish
 Test key inputs — no sticky keys or double presses

 Confirm player can’t exit boundaries or fall forever

 Smooth out any jarring animations or frame hiccups

 Play with music/sound sync — nothing should desync after mode switch

 Test full game loop: start > run > die > restart

---

# CodeRunner - Debugging & Bug Fixes

## Recent Fixes
✅ **FIXED (2025-06-03)**: Player teleportation bug during jumping
- **Issue**: Player would randomly teleport to distant platforms when jumping
- **Root Cause**: Collision detection returned first collision found instead of most appropriate one
- **Solution**: Implemented smart collision selection based on movement direction and proximity validation
- **Files Modified**: `src/physics/PhysicsEngine.js`