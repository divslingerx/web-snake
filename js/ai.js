class AI {
  static getDirection(snake, foodPos, itemPos, wallMode, obstacles, allSnakes) {
    var target = foodPos;
    if (itemPos) {
      var foodDist = AI.manhattan(snake.head, foodPos);
      var itemDist = AI.manhattan(snake.head, itemPos);
      if (itemDist < foodDist) target = itemPos;
    }

    var directions = ["up", "down", "left", "right"];
    var scored = [];

    for (var i = 0; i < directions.length; i++) {
      var dir = directions[i];
      var next = AI.nextPos(snake.head, dir, wallMode);
      if (!next) continue;

      var safe = AI.isSafe(next, wallMode, obstacles, allSnakes, snake);
      var dist = AI.manhattan(next, target);

      scored.push({ dir: dir, dist: dist, safe: safe, pos: next });
    }

    scored.sort(function(a, b) {
      if (a.safe !== b.safe) return a.safe ? -1 : 1;
      return a.dist - b.dist;
    });

    if (scored.length > 0) return scored[0].dir;
    return snake.direction || "right";
  }

  static nextPos(head, dir, wallMode) {
    var x = head[0], y = head[1];
    switch (dir) {
      case "left":  x -= 1; break;
      case "up":    y -= 1; break;
      case "right": x += 1; break;
      case "down":  y += 1; break;
    }
    if (wallMode === "wrap") {
      x = (x + GRID_SIZE) % GRID_SIZE;
      y = (y + GRID_SIZE) % GRID_SIZE;
    } else {
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
    }
    return [x, y];
  }

  static isSafe(pos, wallMode, obstacles, allSnakes, self) {
    if (!pos) return false;
    if (obstacles && obstacles.isOccupied(pos[0], pos[1])) return false;
    for (var i = 0; i < allSnakes.length; i++) {
      var snake = allSnakes[i];
      if (!snake.alive) continue;
      for (var j = 0; j < snake.segments.length; j++) {
        if (snake !== self && j === snake.segments.length - 1 && !snake.pendingGrowth) continue;
        if (pos[0] === snake.segments[j][0] && pos[1] === snake.segments[j][1]) return false;
      }
    }
    return true;
  }

  static manhattan(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }
}
