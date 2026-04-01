const GRID_SIZE = 30;
const BASE_INTERVAL = 120;

class Snake {
  constructor(startX, startY, color, headColor, controlType) {
    this.color = color;
    this.headColor = headColor;
    this.controlType = controlType; // "arrows", "wasd", "ai"
    this.isAI = controlType === "ai";
    this.reset(startX, startY);
  }

  reset(startX, startY) {
    this.segments = [[startX, startY]];
    this.direction = null;
    this.nextDirection = null;
    this.alreadyMoved = false;
    this.alive = true;
    this.score = 0;
    this.elapsed = 0;
    this.pendingGrowth = 0;

    // Status effects
    this.speedModifier = 1.0;
    this.speedTimer = 0;
    this.shielded = false;
    this.shieldTimer = 0;
    this.magnetActive = false;
    this.magnetTimer = 0;
    this.fogTimer = 0;
    this.frozen = false;
    this.frozenTimer = 0;
  }

  get head() {
    return this.segments[0];
  }

  get stepInterval() {
    return BASE_INTERVAL / this.speedModifier;
  }

  setDirection(dir) {
    var opposites = { left: "right", right: "left", up: "down", down: "up" };
    if (dir === opposites[this.direction]) return;
    if (this.alreadyMoved) return;
    this.nextDirection = dir;
    this.alreadyMoved = true;
  }

  tick(wallMode, obstacles, allSnakes) {
    if (!this.alive || this.frozen) return null;
    if (!this.nextDirection && !this.direction) return null;

    if (this.nextDirection) {
      this.direction = this.nextDirection;
    }
    this.alreadyMoved = false;

    var newHead = [this.head[0], this.head[1]];
    switch (this.direction) {
      case "left":  newHead[0] -= 1; break;
      case "up":    newHead[1] -= 1; break;
      case "right": newHead[0] += 1; break;
      case "down":  newHead[1] += 1; break;
      default: return null;
    }

    // Wall handling
    if (wallMode === "wrap") {
      newHead[0] = (newHead[0] + GRID_SIZE) % GRID_SIZE;
      newHead[1] = (newHead[1] + GRID_SIZE) % GRID_SIZE;
    } else {
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE ||
          newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        return this.handleLethalCollision();
      }
    }

    // Obstacle collision
    if (obstacles && obstacles.isOccupied(newHead[0], newHead[1])) {
      return this.handleLethalCollision();
    }

    // Other snake collision (skip head — head-on is handled separately in Game)
    for (var i = 0; i < allSnakes.length; i++) {
      var other = allSnakes[i];
      if (other === this || !other.alive) continue;
      for (var j = 1; j < other.segments.length; j++) {
        if (newHead[0] === other.segments[j][0] && newHead[1] === other.segments[j][1]) {
          return this.handleLethalCollision();
        }
      }
    }

    // Self collision (check before adding new head)
    for (var i = 1; i < this.segments.length; i++) {
      if (newHead[0] === this.segments[i][0] && newHead[1] === this.segments[i][1]) {
        return this.handleLethalCollision();
      }
    }

    this.segments.unshift(newHead);
    return newHead;
  }

  handleLethalCollision() {
    if (this.shielded) {
      this.shielded = false;
      this.shieldTimer = 0;
      return "shieldUsed";
    }
    this.alive = false;
    return "died";
  }

  grow(amount) {
    this.pendingGrowth = (this.pendingGrowth || 0) + amount;
  }

  removeTail() {
    if (this.pendingGrowth && this.pendingGrowth > 0) {
      this.pendingGrowth--;
    } else {
      this.segments.pop();
    }
  }

  shrink(amount) {
    for (var i = 0; i < amount; i++) {
      if (this.segments.length > 1) {
        this.segments.pop();
      }
    }
  }

  reverse() {
    this.segments.reverse();
    // Update direction to match new head orientation
    if (this.segments.length > 1) {
      var head = this.segments[0];
      var neck = this.segments[1];
      var dx = head[0] - neck[0];
      var dy = head[1] - neck[1];
      if (dx === 1 || dx === -(GRID_SIZE - 1)) this.direction = "right";
      else if (dx === -1 || dx === (GRID_SIZE - 1)) this.direction = "left";
      else if (dy === 1 || dy === -(GRID_SIZE - 1)) this.direction = "down";
      else if (dy === -1 || dy === (GRID_SIZE - 1)) this.direction = "up";
    }
    this.nextDirection = this.direction;
    this.alreadyMoved = false;
  }

  updateTimers(dt) {
    if (this.speedTimer > 0) {
      this.speedTimer -= dt;
      if (this.speedTimer <= 0) {
        this.speedModifier = 1.0;
        this.speedTimer = 0;
      }
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldTimer <= 0) {
        this.shielded = false;
        this.shieldTimer = 0;
      }
    }
    if (this.magnetTimer > 0) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.magnetActive = false;
        this.magnetTimer = 0;
      }
    }
    if (this.fogTimer > 0) {
      this.fogTimer -= dt;
      if (this.fogTimer <= 0) {
        this.fogTimer = 0;
      }
    }
    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0) {
        this.frozen = false;
        this.frozenTimer = 0;
      }
    }
  }

  occupies(x, y) {
    return this.segments.some(function(s) { return s[0] === x && s[1] === y; });
  }
}
