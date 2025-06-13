/**
 * Shop System - Handles upgrade purchases and management
 */

export class ShopSystem {
    constructor(game) {
        this.game = game;
        this.ownedUpgrades = new Set();
        this.upgradeData = this.initializeUpgradeData();
        this.loadOwnedUpgrades();
    }    initializeUpgradeData() {
        return {
            // Movement Upgrades
            'double-jump': {
                name: 'Double Jump',
                price: 50,
                category: 'movement',
                description: 'Adds a second jump in mid-air to reach higher platforms and avoid obstacles.',
                effect: { type: 'doubleJump', value: true }
            },
            'shield': {
                name: 'Shield',
                price: 35,
                category: 'movement',
                description: 'Blocks one hit or obstacle, giving you a second chance when you make a mistake.',
                effect: { type: 'shield', value: 1 }
            },
            'magnet': {
                name: 'Magnet',
                price: 30,
                category: 'movement',
                description: 'Pulls coins or pickups toward the player for a limited time, making collection easier.',
                effect: { type: 'magnet', value: true }
            },
            'hover-boots': {
                name: 'Hover Boots',
                price: 45,
                category: 'movement',
                description: 'Float for a short time after jumping or falling, allowing precise landings.',
                effect: { type: 'hover', value: true }
            },
            'health-upgrade': {
                name: 'Health Upgrade',
                price: 60,
                category: 'movement',
                description: 'Increases maximum health, allowing you to take more hits before game over.',
                effect: { type: 'maxHealth', value: 1 }
            },

            // Score & Data Upgrades
            'datapack-multiplier': {
                name: 'Datapack Multiplier',
                price: 75,
                category: 'score',
                description: 'Doubles all datapacks collected, significantly boosting your earning potential.',
                effect: { type: 'datapackMultiplier', value: 2 }
            },
            'score-multiplier': {
                name: 'Score Multiplier',
                price: 80,
                category: 'score',
                description: 'Increases score gained over time, helping you climb the leaderboards faster.',
                effect: { type: 'scoreMultiplier', value: 1.25 }
            },
            'combo-bonus': {
                name: 'Combo Bonus',
                price: 65,
                category: 'score',
                description: 'Rewards long streaks of running, jumping, or collecting with bonus points.',
                effect: { type: 'comboBonus', value: true }
            },
            'streak-saver': {
                name: 'Streak Saver',
                price: 55,
                category: 'score',
                description: 'Keeps your combo alive after a mistake, maintaining your scoring momentum.',
                effect: { type: 'streakSaver', value: true }
            },

            // Game-Changing Mechanics
            'ally-drone': {
                name: 'Ally Drone',
                price: 120,
                category: 'mechanics',
                description: 'A small helper that shoots or clears obstacles ahead of you automatically.',
                effect: { type: 'allyDrone', value: true }
            },
            'extra-lane': {
                name: 'Extra Lane',
                price: 150,
                category: 'mechanics',
                description: 'Temporarily opens a new running path with more rewards and fewer obstacles.',
                effect: { type: 'extraLane', value: true }
            },

            // Revive/Retry Upgrades
            'second-chance': {
                name: 'Second Chance',
                price: 100,
                category: 'revive',
                description: 'Revive once per run after dying, giving you another opportunity to continue.',
                effect: { type: 'secondChance', value: 1 }
            },
            'rewind': {
                name: 'Rewind',
                price: 90,
                category: 'revive',
                description: 'Go back a few seconds after a mistake, like a time bubble that undoes errors.',
                effect: { type: 'rewind', value: 3 }
            },

            // Cosmetic Unlocks
            'trail-effects': {
                name: 'Trail Effects',
                price: 20,
                category: 'cosmetic',
                description: 'Cool effects behind the character while running, making you look more stylish.',
                effect: { type: 'trailEffects', value: true }
            },
            'glowing-outfit': {
                name: 'Glowing Outfit',
                price: 50,
                category: 'cosmetic',
                description: 'Cosmetic skin that activates after reaching high scores, showing your achievements.',
                effect: { type: 'glowingOutfit', value: true }
            },
            'custom-animations': {
                name: 'Custom Animations',
                price: 35,
                category: 'cosmetic',
                description: 'Change running, jumping, or dashing animations for a personalized character.',
                effect: { type: 'customAnimations', value: true }
            }
        };
    }

    buyUpgrade(upgradeId) {
        const upgrade = this.upgradeData[upgradeId];
        if (!upgrade) {
            console.warn(`Unknown upgrade: ${upgradeId}`);
            return false;
        }

        if (this.isOwned(upgradeId)) {
            console.warn(`Upgrade already owned: ${upgradeId}`);
            return false;
        }

        const currentCurrency = this.game.upgradeSystem.getDataPackets();
        if (currentCurrency < upgrade.price) {
            console.warn(`Insufficient funds for ${upgradeId}. Need ${upgrade.price}, have ${currentCurrency}`);
            return false;
        }

        // Deduct currency
        this.game.upgradeSystem.spendDataPackets(upgrade.price);

        // Add to owned upgrades
        this.ownedUpgrades.add(upgradeId);
        this.saveOwnedUpgrades();        // Apply upgrade effect
        this.applyUpgradeEffect(upgradeId, upgrade);
        
        return true;
    }    applyUpgradeEffect(upgradeId, upgrade) {
        const player = this.game.player;
        
        // Convert hyphenated IDs to camelCase for player methods
        const playerUpgradeId = this.convertToPlayerUpgradeId(upgradeId);
          if (player && player.applyShopUpgrade) {
            player.applyShopUpgrade(playerUpgradeId);
        } else {
            // Skip applying upgrade if player not available
        }
    }
    
    /**
     * Convert hyphenated upgrade IDs to camelCase for player compatibility
     */    convertToPlayerUpgradeId(upgradeId) {
        const idMap = {
            'double-jump': 'doubleJump',
            'shield': 'shield',
            'magnet': 'magnet',
            'hover-boots': 'hoverBoots',
            'health-upgrade': 'healthUpgrade',
            'datapack-multiplier': 'datapackMultiplier',
            'score-multiplier': 'scoreMultiplier',
            'combo-bonus': 'comboBonus',
            'streak-saver': 'streakSaver',
            'ally-drone': 'allyDrone',
            'extra-lane': 'extraLane',
            'second-chance': 'secondChance',
            'rewind': 'rewind',
            'trail-effects': 'trailEffects',
            'glowing-outfit': 'glowingOutfit',
            'custom-animations': 'customAnimations'
        };
        
        return idMap[upgradeId] || upgradeId;
    }

    isOwned(upgradeId) {
        return this.ownedUpgrades.has(upgradeId);
    }

    getOwnedUpgrades() {
        return Array.from(this.ownedUpgrades);
    }

    getUpgradesByCategory(category) {
        return Object.entries(this.upgradeData)
            .filter(([id, upgrade]) => upgrade.category === category)
            .map(([id, upgrade]) => ({ id, ...upgrade }));
    }

    saveOwnedUpgrades() {
        try {
            const upgradesArray = Array.from(this.ownedUpgrades);
            localStorage.setItem('coderunner_owned_upgrades', JSON.stringify(upgradesArray));
        } catch (error) {
            console.warn('Failed to save owned upgrades:', error);
        }
    }    loadOwnedUpgrades() {
        try {
            const saved = localStorage.getItem('coderunner_owned_upgrades');
            if (saved) {                const upgradesArray = JSON.parse(saved);
                this.ownedUpgrades = new Set(upgradesArray);
            }        } catch (error) {
            // Failed to load owned upgrades
            this.ownedUpgrades = new Set();
        }
    }

    reset() {
        this.ownedUpgrades.clear();
        this.saveOwnedUpgrades();
    }

    getDebugInfo() {
        return {
            ownedCount: this.ownedUpgrades.size,
            totalUpgrades: Object.keys(this.upgradeData).length,
            ownedUpgrades: Array.from(this.ownedUpgrades)
        };
    }
    
    /**
     * Apply all owned upgrades to the current player
     */    applyAllOwnedUpgrades() {
        if (!this.game.player) {
            return;
        }
        
        this.ownedUpgrades.forEach(upgradeId => {
            const upgrade = this.upgradeData[upgradeId];
            if (upgrade) {
                this.applyUpgradeEffect(upgradeId, upgrade);
            }
        });
    }

    // For backward compatibility with old code
    purchaseUpgrade(upgradeId) {
        return this.buyUpgrade(upgradeId);
    }
}
