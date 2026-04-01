# Web Snake

A configurable snake game for your web browser, written in pure JavaScript and HTML5 Canvas. No dependencies, no build tools — just open `index.html` and play.

## Play

Visit [this page](https://ourtigarage.github.io/web-snake/) or open `index.html` locally.

## Features

- **1 or 2 players** — play solo or with a friend (WASD) or against an AI opponent
- **Wall modes** — solid walls (classic) or wrap-around (Snake 2 style)
- **Obstacles** — optional random blocks on the board
- **10 power-up items** across 3 categories:
  - **Positive** — Speed Boost, Shield, Magnet
  - **Negative** — Bomb, Slow, Reverse, Fog
  - **Competitive** (2P only) — Gift, Freeze
- **2x Fruit** — golden food worth double points (15% chance)
- **Settings panel** — toggle every option, pick which items to include, settings persist across sessions
- **High scores** — tracked separately for 1P and 2P via localStorage
- **Mobile support** — swipe to move, tap to restart
- **Sound toggle** — background music on/off (defaults to off)

## Controls

| Action | Player 1 | Player 2 (Human) |
|--------|----------|-------------------|
| Move | Arrow keys | W / A / S / D |
| Pause | Space | Space |
| Restart | Space (on game over) | Space (on game over) |

Mobile: swipe to move, tap to restart.

## Settings

Click the **Settings** tab to configure before playing:

- **Players** — 1 or 2
- **Player 2 Type** — Human (WASD) or AI
- **Walls** — Solid or Wrap
- **Obstacles** — On or Off
- **Moving Bonuses** — On or Off (expand to toggle individual items)

Settings apply when you return to the Game tab.

## Item Reference

### Positive (green border)
| Item | Effect |
|------|--------|
| Speed Boost | 1.5x speed for 4 seconds |
| Shield | Survive one lethal collision (lasts 10s or until used) |
| Magnet | Next food spawns within 5 tiles of you (lasts 8s) |

### Negative (red border)
| Item | Effect |
|------|--------|
| Bomb | Instantly lose 3 segments |
| Slow | 0.6x speed for 4 seconds |
| Reverse | Snake reverses direction instantly |
| Fog | Vision limited to area around your head for 5 seconds |

### Competitive (purple border, 2P only)
| Item | Effect |
|------|--------|
| Gift | Transfer 3 of your segments to the other player |
| Freeze | Freeze the other player in place for 2 seconds |

## Architecture

Zero dependencies. 9 JS files loaded via script tags:

```
js/
  snake.js       — Snake class (movement, status effects, collision)
  food.js        — Food spawning, item types, item effects
  obstacles.js   — Random obstacle placement
  ai.js          — Greedy pathfinding AI
  settings.js    — Settings UI binding and localStorage persistence
  renderer.js    — All canvas drawing
  input.js       — Keyboard and touch input handling
  game.js        — Game loop (requestAnimationFrame + delta time)
  main.js        — Entry point, tab switching, restart
```

## Contributing

Pull requests welcome. Fork the repo, make your changes, and submit a PR.

## License

MIT — see [LICENSE](LICENSE) for details.
