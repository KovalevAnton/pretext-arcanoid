# Pretext Breaker — Game Design Document

## Overview

**Pretext Breaker** is a browser-based Breakout/Arkanoid-style game where the player destroys typographic words instead of bricks. The game is built with React, TypeScript, Canvas API, and the `@chenglou/pretext` library for text measurement and layout.

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
│       ├── GamePage.tsx          # Main game page — composes HUD + Board + Footer
│       └── GamePage.module.css
│
├── widgets/                      # Composite UI blocks
│   ├── game-board/
│   │   ├── GameBoard.tsx         # Canvas wrapper component
│   │   └── GameBoard.module.css
│   ├── hud/
│   │   ├── HUD.tsx              # Score, lives, level, sound toggle, power-up indicators
│   │   └── HUD.module.css
│   └── footer/
│       ├── Footer.tsx           # Controls help text
│       └── Footer.module.css
│
├── features/
│   └── game-engine/
│       ├── engine.ts            # Core game state & logic (pure functions)
│       ├── renderer.ts          # Canvas rendering (all draw calls)
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
        ├── canvas-utils.ts       # Low-level drawing primitives
        ├── pretext-layout.ts     # @chenglou/pretext integration
        └── sound.ts              # Web Audio API sound effects
```

---

## Game Elements

### 1. Ball (Glyph)

- **Visual**: Golden circle (8px radius) with a glow effect and dotted trail.
- **Physics**: Constant speed with angle-based reflection. Speed is clamped between 80% base and max.
- **Behavior**: Bounces off walls, paddle, and target words. Falls off the bottom = lost.

### 2. Paddle

- **Visual**: Dark rectangular bar with segmented lines and bracket edges `[=====]`.
- **Position**: Near the bottom of the play area (40px offset).
- **Controls**:
  - **Mouse**: Paddle tracks cursor X position with smooth interpolation (20% per frame).
  - **Keyboard**: Arrow Left/Right or A/D move the target position.
  - **Touch**: Touch position on canvas controls paddle.
- **Power-up**: "WIDEN" doubles paddle width for 11 seconds.

### 3. Target Words

- **Layout**: 16 words arranged in phrase-structured rows (5 / 7 / 4) for natural reading flow.
- **Sizing**: Font size scales inversely with word length (50px for ≤3 chars, 32px for 8+).
- **Colors**: Each word gets a distinct color from a 16-color palette (red, yellow, green, blue, orange, purple, teal, pink, etc.).
- **Hit detection**: Axis-aligned bounding box (AABB) collision with the ball. On hit, the word disappears and score increases.
- **Repulsion zone**: Each alive target word pushes surrounding background text away, creating a visible clearing around it.
- **Levels**: Each level loads a different set of 16 words. 3 levels are defined.

### 4. Power Words

- **Spawn**: ~35% chance to drop from a destroyed target word.
- **Types**:
  - **[MULTI]** (`multiBall`): Spawns 2 additional balls from the current ball's position at random angles.
  - **[WIDEN]** (`widen`): Widens the paddle by 1.8x for 11 seconds with a countdown timer shown in HUD.
- **Visual**: Falling rectangle with bracket label `[MULTI]` / `[WIDEN]`, dark background, colored border.
- **Catch**: Player must catch the power word with the paddle to activate it.

### 5. Background Text — "Moses Effect"

This is the signature visual mechanic and the core use of the `@chenglou/pretext` library.

- **Structure**: ~700 individual word particles laid out in a text-flow grid covering the entire play area.
- **Pretext Integration**: Each word's width is measured using `prepare()` + `layout()` from `@chenglou/pretext` for accurate per-word positioning and line wrapping.
- **Repulsion physics**: Every frame, each background word is checked against:
  - **Balls** (circular repulsion, radius 70px): Text parts like water around the ball — the "Moses" effect.
  - **Target words** (rectangular repulsion, 22px padding): Background text flows around the colored target words, leaving clear space.
- **Smooth return**: When no force applies, words glide back to their home positions with spring-like interpolation (12% per frame).
- **Visual feedback**: Displaced words become slightly brighter (alpha increases from 0.22 → 0.42) to subtly highlight the wake.
- **Content**: Typography terms ("pretext", "layout", "measure", "cursor", "glyph", "reflow", "bidi", "kern", etc.) that reinforce the typographic theme.

### 6. HUD (Heads-Up Display)

- **Title**: "PRETEXT BREAKER" in Orbitron font with glow.
- **Score**: 5-digit zero-padded number.
- **Lives**: Heart symbols (♥ filled, ♡ empty).
- **Level**: 2-digit zero-padded.
- **Sound Toggle**: "SND ON/OFF" button.
- **Info Line**: Shows remaining word count and instructions.
- **Power-Up Status**: Shows active power-ups with timers (e.g., "WIDEN 8s").

### 7. Footer

- **Content**: Control instructions displayed in a bordered bar.
- **Style**: Amber/gold tinted background to match screenshot.

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

### State Transitions

1. **Initial**: Game loads with words laid out. Ball is not launched. Overlay says "Press UP / tap to launch the glyph".
2. **Launch**: Player presses UP, taps, or clicks. Ball spawns above paddle with slight random angle.
3. **Playing**: Ball bounces, words break, power words fall. Score updates in real-time.
4. **Life Lost**: When all balls fall below the play area. If lives remain, return to step 1. Paddle resets.
5. **Level Complete**: All 12 words destroyed. Overlay shows "LEVEL N COMPLETE". Player action loads next level.
6. **Game Over**: 0 lives remaining. Overlay shows "GAME OVER". Player action restarts from level 1.

---

## Scoring

| Event | Points |
|---|---|
| Destroy a target word | 10 |
| Catch a power word | 50 |

---

## Collision System

### Ball ↔ Wall
- Left/Right/Top walls: Reflect velocity component along the wall's normal.
- Ball position is clamped to stay inside the border.

### Ball ↔ Paddle
- Only when ball is moving downward (`vel.y > 0`).
- Hit position along the paddle (0.0 = left edge, 1.0 = right edge) determines reflection angle.
- Angle range: -90° ± 60° (steeper at edges, flatter in the center).
- Speed is preserved from pre-collision velocity.

### Ball ↔ Word
- AABB (Axis-Aligned Bounding Box) intersection test.
- Bounce direction determined by minimum overlap axis (horizontal or vertical).
- Word is immediately marked as dead.

### Power Word ↔ Paddle
- Center-to-rect overlap test.
- Power word deactivates and effect applies.

---

## Sound System

Synthesized via Web Audio API (no audio files needed):

| Sound | Waveform | Frequency | Duration |
|---|---|---|---|
| Wall bounce | Square | 300 Hz | 50ms |
| Paddle bounce | Square | 500 Hz | 80ms |
| Word hit | Sine | 800 Hz | 120ms |
| Power-up | Sine | 600→900 Hz | 100+150ms |
| Life lost | Sawtooth | 200 Hz | 300ms |
| Game over | Sawtooth | 400→300→200 Hz | 3×200ms |
| Level complete | Sine | 500→700→900 Hz | 3×100ms |

Toggle with the "SND" button or M key. Off by default.

---

## Controls

| Action | Mouse | Keyboard | Touch |
|---|---|---|---|
| Move paddle | Move cursor | ← → / A D | Touch & drag |
| Launch ball | Click | ↑ / Space / W | Tap |
| Toggle sound | SND button | M | SND button |

---

## Visual Design

- **Color scheme**: Dark navy/black background (#060a10, #0a0e17) with cyan/blue UI accents.
- **Fonts**: "Orbitron" for headings and target words, "Share Tech Mono" for HUD and background text.
- **Effects**: Glow shadows on balls and words, dotted trails, corner bracket decorations.
- **Responsive**: Canvas scales to fit viewport width while maintaining 1100:700 aspect ratio.

---

## Tech Stack

| Library | Purpose |
|---|---|
| React 19 | UI composition, state management via hooks |
| TypeScript | Type safety across all game logic |
| Vite | Dev server & build tooling |
| `@chenglou/pretext` | Text measurement & layout for background text |
| Canvas API | Game rendering (60fps loop via requestAnimationFrame) |
| Web Audio API | Procedural sound effects |
| CSS Modules | Scoped component styles |

---

## Configuration

All game parameters are centralized in `src/shared/config/constants.ts`:

- Canvas dimensions, paddle size, ball speed, lives count
- Word sets for each level
- Color palette
- Power-up durations and multipliers
- Background word list

This makes tuning straightforward — change a constant, see the effect immediately.
