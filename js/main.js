var game = null;
var settings = null;
var inputManager = null;
var soundEnabled = false;

function initApp() {
  settings = new Settings();
  var canvas = document.getElementById("game");
  sizeCanvas(canvas);

  game = new Game(canvas, settings.current);
  inputManager = new InputManager(canvas, restart, togglePause);
  inputManager.setSnakes(game.snakes, game);

  game.start();

  document.getElementById("tabGame").addEventListener("click", function() {
    showTab("game");
    restart();
  });
  document.getElementById("tabSettings").addEventListener("click", function() {
    showTab("settings");
  });

  window.addEventListener("resize", function() {
    sizeCanvas(canvas);
    game.renderer = new Renderer(canvas);
  });
}

function sizeCanvas(canvas) {
  var legendVisible = settings && settings.current.bonuses;
  var legendWidth = legendVisible ? 180 : 0;
  var maxW = window.innerWidth - 40 - legendWidth;
  var maxH = window.innerHeight - 140;
  var size = Math.min(maxW, maxH, 600);
  size = Math.floor(Math.max(size, 200));
  canvas.width = size;
  canvas.height = size;
}

function showTab(tab) {
  var gameTab = document.getElementById("gameContent");
  var settingsTab = document.getElementById("settingsContent");
  var tabGameBtn = document.getElementById("tabGame");
  var tabSettingsBtn = document.getElementById("tabSettings");

  if (tab === "game") {
    gameTab.style.display = "";
    settingsTab.style.display = "none";
    tabGameBtn.classList.add("active");
    tabSettingsBtn.classList.remove("active");
  } else {
    gameTab.style.display = "none";
    settingsTab.style.display = "";
    tabGameBtn.classList.remove("active");
    tabSettingsBtn.classList.add("active");
  }
}

function restart() {
  document.getElementById("restart").classList.add("hide");
  var canvas = document.getElementById("game");
  sizeCanvas(canvas);

  game.stop();
  game = new Game(canvas, settings.current);
  inputManager.setSnakes(game.snakes, game);
  game.start();

  var audio = document.getElementById("myAudio");
  audio.currentTime = 0;
  if (soundEnabled) audio.play().catch(function() {});
}

function togglePause() {
  if (!game) return;
  if (game.state === "running") {
    game.state = "paused";
  } else if (game.state === "paused") {
    game.state = "running";
  }
}

function toggleSound() {
  var audio = document.getElementById("myAudio");
  var btn = document.getElementById("soundToggle");
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    btn.textContent = "Sound: ON";
    audio.play().catch(function() {});
  } else {
    btn.textContent = "Sound: OFF";
    audio.pause();
  }
}

document.addEventListener("DOMContentLoaded", initApp);
