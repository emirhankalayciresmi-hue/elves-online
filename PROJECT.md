# Project: Elves Online

## Architecture
Elves Online is a browser-based MMORPG (React 19, Vite, Tailwind CSS, Supabase PostgreSQL).
The project is restructured into a strict 6-layer domain-driven architecture:
1. `src/app/` — Application root, layout shell (Desktop & Mobile), routing and global providers.
2. `src/core/` — Foundation layer: static game configs (`src/core/config/`), centralized type-safe LocalStorage manager (`src/core/storage/`), and Supabase client initialization (`src/core/supabase/`).
3. `src/domain/` — Pure game mechanics and business logic (zero React, zero Supabase, zero LocalStorage side-effects). Handles combat calculations, inventory mutations, leveling formulas, and stat aggregations. Fully unit-testable in isolation.
4. `src/services/` — Network and persistence layer. Scoped Supabase queries, mutations, auth operations, and Realtime WebSocket channel management.
5. `src/hooks/` — Custom React lifecycle hooks, stabilized timer loops, and performance-optimized context consumers.
6. `src/components/` & `src/views/` — Modular UI component library and lazy-loaded route views (`React.lazy` + `Suspense`).

### Path Aliases
Standardized path alias `@/` mapped to `src/` configured in `vite.config.js` and `jsconfig.json`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Path Aliases & Toolchain Setup | Setup `@/` path alias in Vite and JSConfig | M1 | Survey (Explorer 1) |
| F02 | 6-Layer Modular Directory Structure | Establish `app`, `core`, `domain`, `services`, `hooks`, `components`, `views` | M1 | Survey (Explorer 1) |
| F03 | Pure Domain Extraction | Decouple game rules, combat ticks, and leveling from UI and Storage into `src/domain/` | M1 | Survey (Explorer 1) |
| F04 | Centralized Storage Manager | Create `src/core/storage/storageManager.js` and purge localStorage leaks from configs | M1 | Survey (Explorer 1) |
| F05 | Dead Code Elimination | Remove unused assets (`hero.png`, `react.svg`, `vite.svg`) and dead stub `App.css` | M1 | Survey (Explorer 1) |
| F06 | HeaderStatusBar Rules of Hooks Fix | Move early returns after all 14 hook declarations in HeaderStatusBar | M2 | Survey (Explorer 1 & 2) |
| F07 | Potion Function Renaming | Rename `usePotion` to `consumePotion` across codebase to satisfy React compiler rules | M2 | Survey (Explorer 1 & 2) |
| F08 | DungeonView Crash Resolution | Fix undeclared `claimCelebration` modal state and `_isCompleted` vs `isCompleted` | M2 | Survey (Explorer 1 & 2) |
| F09 | Ore Selling Parameter Fix | Pass `sellPrice` correctly through Metin2Inventory to gameEngine to award gold and complete quests | M2 | Survey (Explorer 2) |
| F10 | Market Purchase Gold Accounting | Credit seller account when items are bought; prevent buyer gold annihilation | M2 | Survey (Explorer 2) |
| F11 | Market Offer Gold Accounting | Debit buyer on offer creation; prevent counterfeit gold generation on accept | M2 | Survey (Explorer 2) |
| F12 | Negative Value & Quantity Exploits | Guard potion purchasing and item selling against negative quantities and exploit pricing | M2 | Survey (Explorer 2) |
| F13 | Party Expedition Deadlock Fix | Clear `activeExpedition` on party leave/disband to prevent permanent `isBusy` lock | M2 | Survey (Explorer 2) |
| F14 | Guild State Limbo Fix | Clean up `player.guild.id` on disband/kick so members can join or create new guilds | M2 | Survey (Explorer 2) |
| F15 | Boss Level Requirement Guard | Add `isPlayerLevelReady` check to Boss fight button disabled state | M2 | Survey (Explorer 2) |
| F16 | Group Boss Category Alignment | Align `category: 'group'` with quest and badge progress target `boss_party` | M2 | Survey (Explorer 2) |
| F17 | Non-Dungeon Level-Up Stat Points | Award 6 stat points on Boss victories and Party expedition level-ups; fix statPoints priority | M2 | Survey (Explorer 2) |
| F18 | Party Drop Equipment Slot Fix | Guarantee dropped equipment in party expeditions has valid `slot` metadata | M2 | Survey (Explorer 2) |
| F19 | Badge Progression Multi-Tier Fix | Use `while` loop instead of `if` to handle multi-tier badge threshold jumps | M2 | Survey (Explorer 2) |
| F20 | Metin2Inventory 48-Slot Overflow | Implement capacity checks and pagination bounds to prevent invisible item loss | M2 | Survey (Explorer 2) |
| F21 | Non-blocking Modal Dialogs | Replace blocking `window.alert` and `window.confirm` with non-blocking UI notifications | M2 | Survey (Explorer 1 & 2) |
| F22 | Throttled Mouse Tracking in Tooltips | Throttle or RAF `onMouseMove` in inventory to eliminate 120-240Hz mouse stutter | M3 | Survey (Explorer 1, 2, 3) |
| F23 | PlayerProfileContext Memoization | Wrap context provider value in `useMemo` to stop cascading re-renders on every hover | M3 | Survey (Explorer 1 & 3) |
| F24 | Timer Churn Elimination | Stabilize `useGameTimers` dependencies and interval refs to stop continuous re-subscription | M3 | Survey (Explorer 1 & 3) |
| F25 | Route-Level Code Splitting | Split heavy tabs (`GuildView`, `PartyView`, `MarketView`, etc.) using `React.lazy` to cut bundle size | M3 | Survey (Explorer 1) |
| F26 | Decoupled Cloud Combat Sync | Stop 3.5s combat loop cloud upsert spam; sync on milestone events or throttled intervals | M4 | Survey (Explorer 1 & 3) |
| F27 | Realtime Chat Duplicate Echo Fix | Fix client optimistic ID vs Postgres UUID mismatch to eliminate duplicate message bubbles | M4 | Survey (Explorer 3) |
| F28 | Realtime Channel Lifecycle Cleanup | Ensure all Realtime subscriptions return clean teardowns (`removeChannel`) on unmount | M4 | Survey (Explorer 1 & 3) |
| F29 | Market Realtime Query Throttling | Eliminate 50-row full table re-fetches on global market updates; debounce stall upserts | M4 | Survey (Explorer 1 & 3) |
| F30 | Supabase Mutation Payload Trimming | Remove `.select()` double-bandwidth overhead on character upserts and specify minimal columns | M4 | Survey (Explorer 3) |
| F31 | Automated Quality & Verification Suite | Add automated tests for domain rules, defect regressions, Supabase safety, and build/lint | M5 | Survey (Explorer 1 & 2) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Architecture & Modular Structure | Toolchain alias, 6-layer layout, storage centralization, dead code cleanup (F01-F05) | none | PLANNED |
| M2 | Bug Audit & Defect Remediation | Fix all 22 cataloged runtime exceptions, exploits, deadlocks, and logic bugs (F06-F21) | M1 | PLANNED |
| M3 | Performance Optimization & Lag Elimination | Mouse throttle, context memoization, timer stabilization, lazy loading (F22-F25) | M2 | PLANNED |
| M4 | Supabase Resource Guard & Memory Optimization | Combat loop sync decoupling, chat echo fix, Realtime teardown, query throttling (F26-F30) | M2 | PLANNED |
| M5 | Automated Quality Checks & Final Gate | Vitest / Node test harness, regression assertions, lint & production build validation (F31) | M3, M4 | PLANNED |

---

## Interface Contracts

### `src/core/storage/storageManager.js`
- `getItem(key, defaultValue)`: Reads JSON from LocalStorage safely with fallback.
- `setItem(key, value)`: Serializes and saves with error suppression.
- `removeItem(key)`: Deletes key safely.

### `src/domain/gameEngine.js` ↔ UI Components
- `consumePotion(player, potionType)`: Pure function returning `{ updatedPlayer, success, message }`.
- `discardOrSellItem(player, instanceId, sellPrice)`: Pure function returning `{ player, goldEarned, itemRemoved }`.
- `calculateLevelAndExp(currentLevel, currentExp, expGained)`: Returns `{ level, exp, statPointsGained, didLevelUp }`.
- `calculatePlayerStats(player)`: Returns computed stats with proper baseline, equipment bonuses, and allocated points.

### `src/services/cloudCharacterService.js` ↔ `src/app/App.jsx`
- `debouncedSyncPlayerToCloud(player, userId, forceImmediate)`: Throttled cloud sync (minimum 30s interval or event-driven upon dungeon exit/level-up/manual save). Does not use `.select()`.
- `saveCharacterToCloud(player, userId)`: Performs minimal-column upsert.

### `src/services/chatService.js` ↔ Realtime WebSocket
- `sendChatMessageToCloud(msg)`: Sends message with client-persisted UUID.
- `subscribeToRealtimeChat(onNewMessage)`: Returns cleanup function `() => supabase.removeChannel(channel)`.

### `src/services/marketService.js` ↔ Realtime WebSocket
- `subscribeToRealtimeMarket(onUpdate)`: Subscribes with dedicated channel name, returns cleanup function `() => supabase.removeChannel(channel)`.
- `buyMarketItemService(buyer, stallId, stallItemId)`: Transfers item and credits seller gold.

---

## Code Layout
```
src/
├── main.jsx
├── index.css
├── app/
│   ├── App.jsx
│   ├── providers/
│   │   └── PlayerProfileProvider.jsx
│   └── layout/
│       ├── DesktopShell.jsx
│       ├── MobileShell.jsx
│       └── Navigation.jsx
├── core/
│   ├── config/
│   │   ├── gameData.js
│   │   ├── bossData.js
│   │   ├── dungeonData.js
│   │   ├── itemsData.js
│   │   ├── miningData.js
│   │   ├── questData.js
│   │   ├── guildData.js
│   │   ├── partyData.js
│   │   └── marketData.js
│   ├── storage/
│   │   └── storageManager.js
│   └── supabase/
│       └── supabaseClient.js
├── domain/
│   ├── gameEngine.js
│   ├── combatEngine.js
│   ├── characterStats.js
│   ├── inventoryEngine.js
│   └── questEngine.js
├── services/
│   ├── authService.js
│   ├── chatService.js
│   ├── cloudCharacterService.js
│   ├── guildService.js
│   ├── marketService.js
│   ├── partyService.js
│   └── playerProfileService.js
├── hooks/
│   ├── useGameTimers.js
│   └── useDebounce.js
├── components/
│   ├── common/
│   ├── navigation/
│   └── inventory/
└── views/
    ├── LandingPortal/
    ├── Onboarding/
    └── Tabs/
```
