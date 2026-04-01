var ITEM_TYPES = {
  // Positive
  speedBoost: { name: "Speed Boost", category: "positive", color: "#F44336", icon: "arrow-up", duration: 4000 },
  shield:     { name: "Shield",      category: "positive", color: "#00BCD4", icon: "ring",     duration: 10000 },
  magnet:     { name: "Magnet",      category: "positive", color: "#FFFFFF", icon: "magnet",   duration: 8000 },
  // Negative
  bomb:       { name: "Bomb",        category: "negative", color: "#FF9800", icon: "bomb",     duration: 0 },
  slow:       { name: "Slow",        category: "negative", color: "#2196F3", icon: "arrow-down", duration: 4000 },
  reverse:    { name: "Reverse",     category: "negative", color: "#FFEB3B", icon: "reverse",  duration: 0 },
  fog:        { name: "Fog",         category: "negative", color: "#9E9E9E", icon: "cloud",    duration: 5000 },
  // Competitive
  gift:       { name: "Gift",        category: "competitive", color: "#E91E63", icon: "gift",  duration: 0 },
  freeze:     { name: "Freeze",      category: "competitive", color: "#B3E5FC", icon: "snowflake", duration: 2000 }
};

var FOOD_COLOR = "#FF5722";
var FOOD_2X_COLOR = "#FFD700";
var FOOD_RADIUS_RATIO = 0.4;

class FoodManager {
  constructor() {
    this.food = null;
    this.foodIs2x = false;
    this.activeItem = null;
    this.itemSpawnTimer = 0;
    this.nextItemSpawnDelay = 0;
    this.resetItemTimer();
  }

  resetItemTimer() {
    this.nextItemSpawnDelay = 8000 + Math.random() * 4000;
    this.itemSpawnTimer = 0;
  }

  spawnFood(snakes, obstacles, magnetSnake) {
    var x, y, blocked;
    var attempts = 0;
    do {
      if (magnetSnake && magnetSnake.magnetActive && attempts < 50) {
        var hx = magnetSnake.head[0];
        var hy = magnetSnake.head[1];
        x = hx + Math.floor(Math.random() * 11) - 5;
        y = hy + Math.floor(Math.random() * 11) - 5;
        x = ((x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
        y = ((y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
      } else {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      }
      blocked = false;
      for (var i = 0; i < snakes.length; i++) {
        if (snakes[i].occupies(x, y)) { blocked = true; break; }
      }
      if (!blocked && obstacles && obstacles.isOccupied(x, y)) blocked = true;
      if (!blocked && this.activeItem && this.activeItem.pos[0] === x && this.activeItem.pos[1] === y) blocked = true;
      attempts++;
    } while (blocked);

    this.food = [x, y];
    this.foodIs2x = Math.random() < 0.15;
  }

  spawnItem(enabledItems, snakes, obstacles, is2Player) {
    var pool = [];
    for (var key in enabledItems) {
      if (!enabledItems[key]) continue;
      if (ITEM_TYPES[key] && ITEM_TYPES[key].category === "competitive" && !is2Player) continue;
      if (ITEM_TYPES[key]) pool.push(key);
    }
    if (pool.length === 0) return;

    var type = pool[Math.floor(Math.random() * pool.length)];
    var x, y, blocked;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
      blocked = false;
      for (var i = 0; i < snakes.length; i++) {
        if (snakes[i].occupies(x, y)) { blocked = true; break; }
      }
      if (!blocked && obstacles && obstacles.isOccupied(x, y)) blocked = true;
      if (!blocked && this.food && this.food[0] === x && this.food[1] === y) blocked = true;
    } while (blocked);

    this.activeItem = { type: type, pos: [x, y], timer: 5000 };
  }

  updateItemTimers(dt, enabledItems, snakes, obstacles, is2Player) {
    if (this.activeItem) {
      this.activeItem.timer -= dt;
      if (this.activeItem.timer <= 0) {
        this.activeItem = null;
        this.resetItemTimer();
      }
    }

    if (!this.activeItem && enabledItems) {
      this.itemSpawnTimer += dt;
      if (this.itemSpawnTimer >= this.nextItemSpawnDelay) {
        this.spawnItem(enabledItems, snakes, obstacles, is2Player);
        this.itemSpawnTimer = 0;
      }
    }
  }

  checkFoodCollision(headX, headY) {
    if (this.food && headX === this.food[0] && headY === this.food[1]) {
      return this.foodIs2x ? 2 : 1;
    }
    return 0;
  }

  checkItemCollision(headX, headY) {
    if (this.activeItem &&
        headX === this.activeItem.pos[0] && headY === this.activeItem.pos[1]) {
      var type = this.activeItem.type;
      this.activeItem = null;
      this.resetItemTimer();
      return type;
    }
    return null;
  }

  applyItem(itemType, snake, otherSnake) {
    switch (itemType) {
      case "speedBoost":
        snake.speedModifier = 1.5;
        snake.speedTimer = 4000;
        break;
      case "shield":
        snake.shielded = true;
        snake.shieldTimer = 10000;
        break;
      case "magnet":
        snake.magnetActive = true;
        snake.magnetTimer = 8000;
        break;
      case "bomb":
        snake.shrink(3);
        break;
      case "slow":
        snake.speedModifier = 0.6;
        snake.speedTimer = 4000;
        break;
      case "reverse":
        snake.reverse();
        break;
      case "fog":
        snake.fogTimer = 5000;
        break;
      case "gift":
        if (otherSnake) {
          var transfer = Math.min(3, snake.segments.length - 1);
          snake.shrink(transfer);
          otherSnake.grow(transfer);
        }
        break;
      case "freeze":
        if (otherSnake) {
          otherSnake.frozen = true;
          otherSnake.frozenTimer = 2000;
        }
        break;
    }
  }
}
