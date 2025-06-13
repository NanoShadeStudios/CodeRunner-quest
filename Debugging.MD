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

# Platform Floating Bug Fix (December 2024)

## Issue
Players were experiencing floating behavior on platforms - they would sometimes hover slightly above platforms instead of standing solidly on them.

## Root Cause
The platform collision logic in `PhysicsEngine.js` was:
```javascript
case TILE_TYPES.PLATFORM:
    return direction === 1 && !playerDropping;
```

This meant platforms were only solid when moving DOWN (direction === 1). When a player was standing still or moving very slowly on a platform, their movement direction would be 0, making the platform non-solid and causing floating.

## Solution
Updated the platform collision logic to:
```javascript
case TILE_TYPES.PLATFORM:
    // Platforms are solid when:
    // - Moving down (falling onto platform) AND not dropping through
    // - Standing still (direction 0) AND not dropping through  
    // Platforms are NOT solid when:
    // - Moving up (jumping through from below)
    // - Dropping through (playerDropping === true)
    return (direction >= 0) && !playerDropping;
```

## Logic Explanation
- `direction >= 0` means direction is 0 (standing still) or 1 (falling down) - both should make platforms solid
- `direction === -1` (jumping up) makes platforms non-solid, allowing players to jump through from below
- `playerDropping === true` makes platforms non-solid regardless of direction, enabling drop-through mechanism

## Files Modified
- `src/physics/PhysicsEngine.js` - Fixed `isTileSolid()` method for TILE_TYPES.PLATFORM

## Testing and Verification

After implementing the fix, platform collision behavior should now work as follows:

### Expected Behavior:
1. **Standing Still (direction = 0)**: Platform should be SOLID ✓
   - Player can stand on platforms without floating
   - Platform remains solid when player is not moving

2. **Falling Down (direction = 1)**: Platform should be SOLID ✓  
   - Player falls onto platform and lands normally
   - No teleportation through platforms

3. **Jumping Up (direction = -1)**: Platform should be NON-SOLID ✓
   - Player can jump through platforms from below
   - Platforms don't block upward movement

4. **Drop-Through (isPressingDown = true)**: Platform should be NON-SOLID ✓
   - Player can drop through platforms by holding down key
   - Works regardless of movement direction

### Implementation Details:
The key change was in `PhysicsEngine.js` `isTileSolid()` method:
- **Old logic**: `return direction === 1 && !playerDropping;`
- **New logic**: `return (direction >= 0) && !playerDropping;`

This change allows platforms to be solid when `direction >= 0` (standing still OR falling down) instead of only when `direction === 1` (falling down only).

### Additional Considerations:
- The enhanced teleportation prevention system includes special handling for platforms with more lenient thresholds
- Platform collision validation uses larger tolerances (40px vs 20px for regular tiles)
- Substep collision detection processes large movements in 16-pixel increments to prevent tunneling

### Performance Impact:
- Minimal - only a simple logical operator change
- No additional computational overhead
- Existing teleportation prevention optimizations remain active

---

## ✅ **FIXED (December 2024)**: Platform Floating and Drop-Through Issues

### Issue
- Players were floating above platforms when walking or standing still
- Players couldn't drop through platforms when pressing S/Down key
- Players would float at platform level when walking off edges

### Root Cause
Complex platform collision logic was causing edge cases where platforms weren't detected properly.

### Solution
Simplified and fixed platform collision logic in `PhysicsEngine.js`:

```javascript
case TILE_TYPES.PLATFORM:
    // Simple, robust platform logic:
    if (playerDropping) {
        return false; // Allow drop-through when pressing down
    }
    return direction >= 0; // Solid for falling down (1) and standing still (0)
```

### Fixed Behaviors:
1. ✅ **Standing Still**: Platforms are now solid when player isn't moving
2. ✅ **Falling Down**: Platforms catch falling players properly  
3. ✅ **Jumping Up**: Players can jump through platforms from below
4. ✅ **Drop-Through**: S/Down key now works to drop through platforms
5. ✅ **Walking Off**: Players fall immediately when walking off platform edges

### Files Modified:
- `src/physics/PhysicsEngine.js` - Simplified `isTileSolid()` for platforms
- Removed complex `isPlatformSolid()` method that caused edge cases

This fix resolves all reported platform collision issues with a much simpler and more reliable approach.