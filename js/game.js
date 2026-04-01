class Game {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.settings = settings;
    this.renderer = new Renderer(canvas);
    this.obstacles = new ObstacleManager();
    this.foodManager = new FoodManager();
    this.snakes = [];
    this.state = "idle"; // idle, running, paused, gameover
    this.lastTimestamp = 0;
    this.animFrameId = null;
    this.highScores = {
      "1p": parseInt(localStorage.getItem("snakeHighScore1P")) || 0,
      "2p": parseInt(localStorage.getItem("snakeHighScore2P")) || 0
    };
    this.winner = null;

    this.init();
  }

  init() {
    var cfg = this.settings;

    this.snakes = [];
    var p1Start = [Math.floor(GRID_SIZE / 3), Math.floor(GRID_SIZE / 2)];
    var p1 = new Snake(p1Start[0], p1Start[1], "#4CAF50", "#388E3C", "arrows");
    this.snakes.push(p1);

    if (cfg.players === 2) {
      var p2Start = [Math.floor(GRID_SIZE * 2 / 3), Math.floor(GRID_SIZE / 2)];
      var controlType = cfg.player2Type === "ai" ? "ai" : "wasd";
      var p2 = new Snake(p2Start[0], p2Start[1], "#2196F3", "#1565C0", controlType);
      this.snakes.push(p2);
    }

    if (cfg.obstacles) {
      this.obstacles.generate(this.snakes);
    } else {
      this.obstacles.clear();
    }

    this.foodManager = new FoodManager();
    this.foodManager.spawnFood(this.snakes, cfg.obstacles ? this.obstacles : null, null);

    this.state = "idle";
    this.winner = null;
    this.updateScoreDisplay();
    this.updateHighScoreDisplay();

    if (cfg.bonuses) {
      this.renderer.drawLegend(cfg.enabledItems, cfg.players === 2);
      document.getElementById("legendPanel").style.display = "";
    } else {
      document.getElementById("legendPanel").style.display = "none";
    }
  }

  reset() {
    this.init();
  }

  start() {
    var self = this;
    this.lastTimestamp = 0;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    function frame(timestamp) {
      self.frame(timestamp);
      self.animFrameId = requestAnimationFrame(frame);
    }
    self.animFrameId = requestAnimationFrame(frame);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  frame(timestamp) {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.render();
      return;
    }
    var dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (dt > 200) dt = 200;

    if (this.state === "running") {
      this.update(dt);
    }

    this.render();
  }

  update(dt) {
    var cfg = this.settings;

    for (var i = 0; i < this.snakes.length; i++) {
      this.snakes[i].updateTimers(dt);
    }

    if (cfg.bonuses) {
      this.foodManager.updateItemTimers(
        dt, cfg.enabledItems, this.snakes,
        cfg.obstacles ? this.obstacles : null,
        cfg.players === 2
      );
    }

    for (var i = 0; i < this.snakes.length; i++) {
      var snake = this.snakes[i];
      if (!snake.alive) continue;

      snake.elapsed += dt;
      if (snake.elapsed < snake.stepInterval) continue;
      snake.elapsed -= snake.stepInterval;

      if (snake.isAI) {
        var itemPos = this.foodManager.activeItem ? this.foodManager.activeItem.pos : null;
        var dir = AI.getDirection(
          snake, this.foodManager.food, itemPos,
          cfg.wallMode, cfg.obstacles ? this.obstacles : null, this.snakes
        );
        snake.setDirection(dir);
      }

      var result = snake.tick(
        cfg.wallMode,
        cfg.obstacles ? this.obstacles : null,
        this.snakes
      );

      if (result === "died") {
        this.checkGameOver();
        continue;
      }
      if (result === "shieldUsed" || result === null) continue;

      var newHead = result;

      var foodValue = this.foodManager.checkFoodCollision(newHead[0], newHead[1]);
      if (foodValue > 0) {
        snake.score += foodValue;
        snake.grow(foodValue);
        var magnetSnake = null;
        for (var j = 0; j < this.snakes.length; j++) {
          if (this.snakes[j].magnetActive) { magnetSnake = this.snakes[j]; break; }
        }
        this.foodManager.spawnFood(this.snakes, cfg.obstacles ? this.obstacles : null, magnetSnake);
      }

      snake.removeTail();

      if (cfg.bonuses) {
        var itemType = this.foodManager.checkItemCollision(newHead[0], newHead[1]);
        if (itemType) {
          var otherSnake = this.snakes.length > 1 ?
            this.snakes[i === 0 ? 1 : 0] : null;
          this.foodManager.applyItem(itemType, snake, otherSnake);
        }
      }

      this.updateScoreDisplay();
    }

    if (this.snakes.length === 2 && this.snakes[0].alive && this.snakes[1].alive) {
      var h0 = this.snakes[0].head, h1 = this.snakes[1].head;
      if (h0[0] === h1[0] && h0[1] === h1[1]) {
        this.snakes[0].alive = this.snakes[0].handleLethalCollision() === "shieldUsed";
        this.snakes[1].alive = this.snakes[1].handleLethalCollision() === "shieldUsed";
        if (!this.snakes[0].alive || !this.snakes[1].alive) {
          this.checkGameOver();
        }
      }
    }
  }

  checkGameOver() {
    var aliveCount = 0;
    var aliveIndex = -1;
    for (var i = 0; i < this.snakes.length; i++) {
      if (this.snakes[i].alive) { aliveCount++; aliveIndex = i; }
    }

    if (this.snakes.length === 1 && aliveCount === 0) {
      this.state = "gameover";
      this.winner = null;
      this.saveHighScore();
    } else if (this.snakes.length === 2) {
      if (aliveCount === 0) {
        this.state = "gameover";
        this.winner = "draw";
        this.saveHighScore();
      } else if (aliveCount === 1) {
        this.state = "gameover";
        this.winner = "P" + (aliveIndex + 1);
        this.saveHighScore();
      }
    }

    if (this.state === "gameover") {
      var audio = document.getElementById("myAudio");
      audio.pause();
      document.getElementById("restart").classList.remove("hide");
    }
  }

  saveHighScore() {
    var key = this.snakes.length === 1 ? "1p" : "2p";
    var storageKey = this.snakes.length === 1 ? "snakeHighScore1P" : "snakeHighScore2P";
    for (var i = 0; i < this.snakes.length; i++) {
      if (this.snakes[i].score > this.highScores[key]) {
        this.highScores[key] = this.snakes[i].score;
        localStorage.setItem(storageKey, this.highScores[key]);
      }
    }
    this.updateHighScoreDisplay();
  }

  updateScoreDisplay() {
    var el = document.getElementById("scoreDisplay");
    if (!el) return;
    if (this.snakes.length === 1) {
      el.textContent = "Score: " + this.snakes[0].score;
    } else {
      el.textContent = "P1: " + this.snakes[0].score + "  P2: " + (this.snakes[1] ? this.snakes[1].score : 0);
    }
  }

  updateHighScoreDisplay() {
    var el = document.getElementById("highScoreDisplay");
    if (!el) return;
    var key = this.snakes.length === 1 ? "1p" : "2p";
    el.textContent = "Best: " + this.highScores[key];
  }

  render() {
    this.renderer.clear();
    this.renderer.drawBorder();
    this.renderer.drawObstacles(this.obstacles);
    this.renderer.drawFood(this.foodManager.food, this.foodManager.foodIs2x);

    if (this.settings.bonuses) {
      this.renderer.drawItem(this.foodManager.activeItem);
    }

    for (var i = 0; i < this.snakes.length; i++) {
      this.renderer.drawSnake(this.snakes[i]);
    }

    for (var i = 0; i < this.snakes.length; i++) {
      if (this.snakes[i].fogTimer > 0 && this.snakes[i].alive) {
        this.renderer.drawFog(this.snakes[i]);
      }
    }

    if (this.state === "idle") {
      this.renderer.drawOverlay("SNAKE", "Press an arrow key to start");
    } else if (this.state === "paused") {
      this.renderer.drawOverlay("PAUSED", "Press any arrow key to resume");
    } else if (this.state === "gameover") {
      if (this.snakes.length === 1) {
        this.renderer.drawOverlay("GAME OVER", "Score: " + this.snakes[0].score + " \u2022 Press Space to restart");
      } else if (this.winner === "draw") {
        this.renderer.drawOverlay("DRAW!", "Press Space to restart");
      } else {
        this.renderer.drawOverlay(this.winner + " WINS!", "Press Space to restart");
      }
    }
  }
}
