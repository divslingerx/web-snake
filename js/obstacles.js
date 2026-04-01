var OBSTACLE_COLOR = "#607D8B";
var OBSTACLE_COUNT = 8;

class ObstacleManager {
  constructor() {
    this.positions = [];
  }

  generate(snakes) {
    this.positions = [];
    var forbidden = [];

    for (var s = 0; s < snakes.length; s++) {
      var hx = snakes[s].head[0];
      var hy = snakes[s].head[1];
      for (var dx = -3; dx <= 3; dx++) {
        for (var dy = -3; dy <= 3; dy++) {
          forbidden.push([hx + dx, hy + dy]);
        }
      }
    }

    for (var i = 0; i < OBSTACLE_COUNT; i++) {
      var x, y, valid;
      var attempts = 0;
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
        valid = true;
        for (var f = 0; f < forbidden.length; f++) {
          if (forbidden[f][0] === x && forbidden[f][1] === y) {
            valid = false;
            break;
          }
        }
        if (valid) {
          for (var o = 0; o < this.positions.length; o++) {
            if (this.positions[o][0] === x && this.positions[o][1] === y) {
              valid = false;
              break;
            }
          }
        }
        attempts++;
      } while (!valid && attempts < 100);

      if (valid) {
        this.positions.push([x, y]);
      }
    }
  }

  isOccupied(x, y) {
    for (var i = 0; i < this.positions.length; i++) {
      if (this.positions[i][0] === x && this.positions[i][1] === y) return true;
    }
    return false;
  }

  clear() {
    this.positions = [];
  }
}
