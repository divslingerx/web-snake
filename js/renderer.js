var BOARD_BG_COLOR = "#1a1a2e";
var BOARD_BORDER_COLOR = "#16213e";

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  get tileW() { return this.canvas.width / GRID_SIZE; }
  get tileH() { return this.canvas.height / GRID_SIZE; }

  drawBorder() {
    this.ctx.strokeStyle = BOARD_BORDER_COLOR;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSnake(snake) {
    if (!snake.alive && !snake.segments) return;
    var tw = this.tileW, th = this.tileH;
    for (var i = 0; i < snake.segments.length; i++) {
      var seg = snake.segments[i];
      this.ctx.fillStyle = i === 0 ? snake.headColor : snake.color;
      this.ctx.fillRect(seg[0] * tw + 0.5, seg[1] * th + 0.5, tw - 1, th - 1);
    }
    if (snake.shielded) {
      var head = snake.head;
      this.ctx.strokeStyle = "#00BCD4";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(head[0] * tw + tw / 2, head[1] * th + th / 2, tw * 0.7, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    if (snake.frozen) {
      this.ctx.fillStyle = "rgba(180, 220, 255, 0.4)";
      for (var i = 0; i < snake.segments.length; i++) {
        var seg = snake.segments[i];
        this.ctx.fillRect(seg[0] * tw + 0.5, seg[1] * th + 0.5, tw - 1, th - 1);
      }
    }
  }

  drawFood(food, is2x) {
    if (!food) return;
    var tw = this.tileW, th = this.tileH;
    var fx = food[0] * tw + tw / 2;
    var fy = food[1] * th + th / 2;
    var fr = tw * FOOD_RADIUS_RATIO;
    this.ctx.beginPath();
    this.ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    this.ctx.fillStyle = is2x ? FOOD_2X_COLOR : FOOD_COLOR;
    this.ctx.fill();
    if (is2x) {
      this.ctx.font = "bold " + Math.floor(tw * 0.5) + "px monospace";
      this.ctx.fillStyle = "#000";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("2", fx, fy);
      this.ctx.textBaseline = "alphabetic";
      this.ctx.textAlign = "start";
    }
  }

  drawItem(item) {
    if (!item) return;
    var tw = this.tileW, th = this.tileH;
    var cx = item.pos[0] * tw + tw / 2;
    var cy = item.pos[1] * th + th / 2;
    var size = tw * 0.45;
    var info = ITEM_TYPES[item.type];

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(Math.PI / 4);
    this.ctx.fillStyle = info.color;
    this.ctx.fillRect(-size / 2, -size / 2, size, size);

    var borderColor = info.category === "positive" ? "#4CAF50" :
                      info.category === "negative" ? "#F44336" : "#9C27B0";
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-size / 2, -size / 2, size, size);
    this.ctx.restore();

    var letter = this.getItemLetter(item.type);
    this.ctx.font = "bold " + Math.floor(tw * 0.4) + "px monospace";
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(letter, cx, cy);
    this.ctx.textBaseline = "alphabetic";
    this.ctx.textAlign = "start";
  }

  getItemLetter(type) {
    var letters = {
      speedBoost: "\u2191", shield: "\u25CB", magnet: "M",
      bomb: "X", slow: "\u2193", reverse: "\u21C4", fog: "\u2601",
      gift: "G", freeze: "*"
    };
    return letters[type] || "?";
  }

  drawObstacles(obstacles) {
    if (!obstacles) return;
    var tw = this.tileW, th = this.tileH;
    this.ctx.fillStyle = OBSTACLE_COLOR;
    for (var i = 0; i < obstacles.positions.length; i++) {
      var pos = obstacles.positions[i];
      this.ctx.fillRect(pos[0] * tw + 0.5, pos[1] * th + 0.5, tw - 1, th - 1);
    }
  }

  drawFog(snake) {
    var tw = this.tileW, th = this.tileH;
    var hx = snake.head[0] * tw + tw / 2;
    var hy = snake.head[1] * th + th / 2;
    var radius = tw * 5;

    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.moveTo(hx + radius, hy);
    this.ctx.arc(hx, hy, radius, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawOverlay(text, subtext) {
    var w = this.canvas.width, h = this.canvas.height;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.font = "bold " + Math.floor(w * 0.08) + "px monospace";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, w / 2, h / 2 - 10);
    if (subtext) {
      this.ctx.font = Math.floor(w * 0.03) + "px monospace";
      this.ctx.fillText(subtext, w / 2, h / 2 + 30);
    }
    this.ctx.textAlign = "start";
  }

  drawLegend(enabledItems, is2Player) {
    var container = document.getElementById("legendPanel");
    if (!container) return;
    container.innerHTML = "";

    var categories = [
      { key: "positive", label: "Positive", color: "#4CAF50" },
      { key: "negative", label: "Negative", color: "#F44336" }
    ];
    if (is2Player) {
      categories.push({ key: "competitive", label: "Competitive", color: "#9C27B0" });
    }

    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];
      var hasItems = false;
      var section = document.createElement("div");
      section.className = "legend-category";
      var header = document.createElement("div");
      header.className = "legend-header";
      header.style.color = cat.color;
      header.textContent = cat.label;
      section.appendChild(header);

      for (var key in ITEM_TYPES) {
        if (ITEM_TYPES[key].category !== cat.key) continue;
        if (!enabledItems[key]) continue;
        if (ITEM_TYPES[key].category === "competitive" && !is2Player) continue;
        hasItems = true;
        var row = document.createElement("div");
        row.className = "legend-item";
        var swatch = document.createElement("span");
        swatch.className = "legend-swatch";
        swatch.style.backgroundColor = ITEM_TYPES[key].color;
        swatch.textContent = this.getItemLetter(key);
        row.appendChild(swatch);
        var label = document.createElement("span");
        label.textContent = " " + ITEM_TYPES[key].name;
        row.appendChild(label);
        section.appendChild(row);
      }

      if (hasItems) container.appendChild(section);
    }
  }
}
