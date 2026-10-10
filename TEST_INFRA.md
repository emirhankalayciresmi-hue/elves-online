# E2E Test Infra: Elves Online

## Test Philosophy
- Opaque-box, requirement-driven. Derived from `ORIGINAL_REQUEST.md`.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.
- Zero reliance on implementation hacks or internal state bypasses.

## Test Architecture
- Test Runner: Automated Node/Vitest test runner script `tests/runAllTests.mjs` or `npm test`.
- Assertions: Clean exit code 0 on success, informative diagnostics on failure.
- Scope: Validates core MMORPG economy, combat, leveling, inventory, quests, Supabase safety contracts, and clean build/lint.

## Test Tiers & Coverage

### Tier 1: Feature Coverage (Isolation Happy-Path)
- T1.1: Character level calculation & stat point allocation formulas.
- T1.2: Equipment equipping, unequipping, and Metin2 inventory slot manipulation.
- T1.3: Item selling and gold crediting (`discardOrSellItem`).
- T1.4: Potion consumption (`consumePotion`) restores HP/MP without exceeding maximums.
- T1.5: Quest progress recording (`applyQuestProgress`) and badge rank achievements.
- T1.6: Dungeon combat tick simulation & reward distribution.
- T1.7: Boss victory cooldown recording and quest classification (`group` -> `boss_party`).
- T1.8: Market stall item listing and purchase gold transfer.
- T1.9: Party creation, role assignment, and clean disbanding.
- T1.10: Guild creation, gold donation, and clean disbanding.

### Tier 2: Boundary & Corner Cases
- T2.1: Negative gold / negative price / negative quantity exploit prevention.
- T2.2: Metin2Inventory 48-slot overflow and boundary handling.
- T2.3: Zero HP / death handling in combat tick.
- T2.4: Multi-tier badge threshold jumps (while loop vs single step).
- T2.5: Leaving party or disbanding guild during active expedition cleans up all state flags.

### Tier 3: Cross-Feature Interactions (Pairwise)
- T3.1: Inventory selling -> Gold increase -> Quest `ore_sell` progress -> Badge unlocked.
- T3.2: Defeating Group Boss -> Party quest progress -> Badge progression -> Stat points awarded.
- T3.3: Market buy -> Buyer gold deducted & item added -> Seller gold credited & item removed.

### Tier 4: Real-World Workload Scenarios
- T4.1: Complete player lifecycle: Character creation -> Dungeon crawl -> Loot drop -> Equip weapon -> Sell extra items -> Level up -> Allocate stats.
- T4.2: Guild & Social lifecycle: Create guild -> Invite member -> Donate gold -> Disband guild -> Confirm members can join another guild.
- T4.3: High-frequency combat loop simulation: 100 ticks without runaway cloud sync or timer drift.

## Coverage Goals
- All 31 inventoried features covered across Tiers 1-4.
- Automated execution via command: `node tests/runAllTests.mjs`.
