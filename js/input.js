var SWIPE_THRESHOLD = 30;

var KEY_MAPS = {
  arrows: {
    ArrowLeft: "left", ArrowUp: "up", ArrowRight: "right", ArrowDown: "down"
  },
  wasd: {
    a: "left", A: "left",
    w: "up",   W: "up",
    d: "right", D: "right",
    s: "down",  S: "down"
  }
};

var GAME_KEYS = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown",
                 " ", "a", "A", "w", "W", "d", "D", "s", "S"];

class InputManager {
  constructor(canvas, onRestart, onPause) {
    this.snakes = [];
    this.game = null;
    this.onRestart = onRestart;
    this.onPause = onPause;
    this.canvas = canvas;
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.bindKeyboard();
    this.bindTouch();
  }

  setSnakes(snakes, game) {
    this.snakes = snakes;
    this.game = game;
  }

  bindKeyboard() {
    var self = this;
    document.addEventListener("keydown", function(e) {
      if (GAME_KEYS.indexOf(e.key) !== -1) {
        e.preventDefault();
      }

      if (self.game && self.game.state === "gameover") {
        if (e.key === " ") self.onRestart();
        return;
      }

      if (e.key === " ") {
        self.onPause();
        return;
      }

      for (var i = 0; i < self.snakes.length; i++) {
        var snake = self.snakes[i];
        if (snake.isAI) continue;
        var keyMap = KEY_MAPS[snake.controlType];
        if (keyMap && keyMap[e.key]) {
          snake.setDirection(keyMap[e.key]);
          if (self.game && self.game.state === "paused") {
            self.game.state = "running";
          }
          if (self.game && self.game.state === "idle") {
            self.game.state = "running";
          }
          return;
        }
      }
    });
  }

  bindTouch() {
    var self = this;
    this.canvas.addEventListener("touchstart", function(e) {
      self.touchStartX = e.touches[0].clientX;
      self.touchStartY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener("touchend", function(e) {
      var dx = e.changedTouches[0].clientX - self.touchStartX;
      var dy = e.changedTouches[0].clientY - self.touchStartY;

      if (self.game && self.game.state === "gameover") {
        self.onRestart();
        e.preventDefault();
        return;
      }

      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

      var p1 = self.snakes[0];
      if (!p1 || p1.isAI) return;

      var dir;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? "right" : "left";
      } else {
        dir = dy > 0 ? "down" : "up";
      }
      p1.setDirection(dir);

      if (self.game && self.game.state === "paused") self.game.state = "running";
      if (self.game && self.game.state === "idle") self.game.state = "running";

      e.preventDefault();
    }, { passive: false });
  }
}
