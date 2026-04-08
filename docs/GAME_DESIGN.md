# Pretext Breaker — Game Design Document

## Overview

**Pretext Breaker** is a browser-based Breakout/Arkanoid-style game where the player destroys typographic words instead of bricks. Built with React, TypeScript, Canvas API, and `@chenglou/pretext` for all text measurement.

---

## Architecture (Feature-Sliced Design)

```
src/
├── app/                          # Application entry point
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # React DOM mount
│   └── styles/global.css         # Global reset & base styles
│
├── pages/
│   └── game/
│       ├── GamePage.tsx          # Composes HUD + Board + Footer
│       └── GamePage.module.css
│
├── widgets/
│   ├── game-board/
│   │   ├── GameBoard.tsx         # Canvas wrapper
│   │   └── GameBoard.module.css
│   ├── hud/
│   │   ├── HUD.tsx              # Score, lives, level, sound, power-ups
│   │   └── HUD.module.css
│   └── footer/
│       ├── Footer.tsx           # Controls help text
│       └── Footer.module.css
│
├── features/
│   └── game-engine/
│       ├── engine.ts            # Game state, physics, collisions, bg word system
│       ├── renderer.ts          # Canvas rendering (draw calls inlined)
│       ├── use-game.ts          # React hook bridging engine ↔ UI
│       └── index.ts             # Public API
│
├── entities/                     # Domain types
│   ├── ball/types.ts
│   ├── paddle/types.ts
│   ├── word/types.ts
│   └── power-word/types.ts
│
└── shared/
    ├── config/constants.ts       # All game tuning parameters
    ├── types/index.ts            # Shared interfaces (Vector2, Rect, GameState)
    └── lib/
        ├── text.ts              # @chenglou/pretext wrapper (measureWidth)
        └── sound.ts             # Web Audio API sound effects
```

---

## Game Elements

### 1. Ball (Glyph)

- **Visual**: Golden circle (8px radius) with glow effect and dotted trail.
- **Physics**: Constant speed, angle-based reflection. Speed clamped between 80% base and max (9 px/frame).
- **Behavior**: Bounces off walls, paddle, and target words. Falls below the play area = lost.

### 2. Paddle

- **Visual**: Dark bar with segmented lines and bracket edges `[=====]`.
- **Position**: 40px from the bottom of the play area.
- **Controls**:
  - **Mouse**: Tracks cursor X with smooth interpolation (20% per frame).
  - **Keyboard**: Arrow Left/Right or A/D.
  - **Touch**: Touch position on canvas.
- **Power-up**: `[WIDEN]` widens paddle by 1.8x for 11 seconds.

### 3. Target Words

- **Layout**: 16 words in phrase-structured rows (5 / 7 / 4).
- **Sizing**: Font size scales inversely with word length (50px for ≤3 chars, 32px for 8+).
- **Colors**: 16-color palette, one per word.
- **Hit detection**: AABB collision. On hit, word disappears, score +10.
- **Repulsion zone**: Each alive word pushes background text away (22px padding).
- **Levels**: 3 levels with different word sets.

### 4. Power Words

- **Spawn**: ~35% chance on word destruction.
- **Types**:
  - **[MULTI]**: Spawns 2 extra balls at random angles.
  - **[WIDEN]**: Widens paddle 1.8x for 11 seconds (countdown in HUD).
- **Visual**: Falling rectangle with bracket label, dark fill, colored border.
- **Catch**: Must hit paddle to activate. Score +50.

### 5. Background Text — Scrolling Rows with Scatter

The signature visual — background words scroll in rows and scatter away from game objects.

- **Structure**: ~800 word particles arranged in horizontal rows filling the play area.
- **Scrolling**: Each row scrolls continuously in alternating directions (even rows → right, odd → left) at varied speeds (0.15–0.45 px/frame). Words wrap seamlessly when they exit one edge.
- **Spacing**: Proper 7px gap between words for readability.
- **Repulsion / Scatter**: Every frame, each visible word checks proximity to:
  - **Balls** (circular, radius 70px): Words scatter radially away from the ball.
  - **Target words** (rectangular, 22px padding): Words pushed out of the target word's bounding box.
- **Spring-back**: Displacement smoothly decays toward zero (12% per frame).
- **Visual feedback**: Displaced words brighten (alpha 0.22 → 0.42) to show the "wake".
- **Pretext**: All word widths measured via `prepareWithSegments()` + `layoutWithLines()` from `@chenglou/pretext`. No `canvas.measureText` used anywhere.

### 6. HUD

- **Title**: "PRETEXT BREAKER" in Orbitron font with glow.
- **Score**: 5-digit zero-padded.
- **Lives**: ♥ / ♡ symbols.
- **Level**: 2-digit zero-padded.
- **Sound Toggle**: "SND ON/OFF" button.
- **Info Line**: Remaining word count + instructions.
- **Power-Up Status**: Active power-ups with timers.

### 7. Footer

Control instructions in an amber-tinted bordered bar.

---

## Game Flow

```
┌─────────────┐    Launch     ┌─────────────┐
│  READY      │──────────────>│  PLAYING     │
│ (waiting)   │  UP/tap/click │  (running)   │
└─────────────┘               └──────┬───────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │               │               │
               Ball falls      All words hit    Lives = 0
                     │               │               │
                     v               v               v
              ┌──────────┐   ┌──────────────┐  ┌───────────┐
              │ LIFE LOST│   │LEVEL COMPLETE│  │ GAME OVER │
              │ -1 life  │   │              │  │           │
              └────┬─────┘   └──────┬───────┘  └─────┬─────┘
                   │                │                 │
                   v                v                 v
              Back to READY    Next Level         Restart
```

1. **Initial**: Words laid out, ball not launched.
2. **Launch**: Ball spawns above paddle with slight random angle.
3. **Playing**: Ball bounces, words break, power words fall, background scrolls.
4. **Life Lost**: All balls gone. If lives remain → ready state.
5. **Level Complete**: All 16 words destroyed → next level.
6. **Game Over**: 0 lives → restart from level 1.

---

## Scoring

| Event | Points |
|---|---|
| Destroy target word | 10 |
| Catch power word | 50 |

---

## Collision System

| Pair | Detection | Response |
|---|---|---|
| Ball ↔ Wall | Edge check + clamp | Reflect velocity component |
| Ball ↔ Paddle | AABB + downward check | Angle based on hit position (±60°) |
| Ball ↔ Word | AABB | Reflect on min-overlap axis, kill word |
| Power Word ↔ Paddle | Center-rect overlap | Deactivate, apply effect |
| BgWord ↔ Ball | Distance < 70px | Radial scatter displacement |
| BgWord ↔ Target | Inside padded rect | Normalized push-out displacement |

---

## Sound System

Web Audio API synthesis (no audio files):

| Sound | Waveform | Frequency | Duration |
|---|---|---|---|
| Wall bounce | Square | 300 Hz | 50ms |
| Paddle bounce | Square | 500 Hz | 80ms |
| Word hit | Sine | 800 Hz | 120ms |
| Power-up | Sine | 600→900 Hz | 100+150ms |
| Life lost | Sawtooth | 200 Hz | 300ms |
| Game over | Sawtooth | 400→300→200 Hz | 3×200ms |
| Level complete | Sine | 500→700→900 Hz | 3×100ms |

Toggle: SND button or M key. Off by default.

---

## Controls

| Action | Mouse | Keyboard | Touch |
|---|---|---|---|
| Move paddle | Cursor | ← → / A D | Drag |
| Launch ball | Click | ↑ / Space / W | Tap |
| Toggle sound | SND button | M | SND button |

---

## Tech Stack

| Library | Purpose |
|---|---|
| React 19 | UI composition via hooks |
| TypeScript | Type safety |
| Vite | Dev server & build |
| `@chenglou/pretext` | All text width measurement (single `measureWidth` function) |
| Canvas API | Game rendering at 60fps |
| Web Audio API | Procedural sound effects |
| CSS Modules | Scoped component styles |

---

## Configuration

All tuning parameters in `src/shared/config/constants.ts`:

- Canvas: `GAME_WIDTH` (1100), `GAME_HEIGHT` (700)
- Ball: speed (5), max speed (9), radius (8), trail length (8)
- Paddle: width (140), height (14), widen factor (1.8x)
- Repulsion: ball radius (70px), strength (55), word padding (22px)
- Background: return speed (0.12), space width (7px)
- Levels: 3 word sets of 16 words each
- Power-ups: widen duration (11s), multiball count (3)
