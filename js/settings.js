var DEFAULT_SETTINGS = {
  players: 1,
  player2Type: "human",
  wallMode: "solid",
  obstacles: false,
  bonuses: false,
  enabledItems: {
    speedBoost: true,
    shield: true,
    magnet: true,
    bomb: true,
    slow: true,
    reverse: true,
    fog: true,
    gift: true,
    freeze: true
  }
};

class Settings {
  constructor() {
    this.current = this.load();
    this.applyToUI();
    this.bindUI();
  }

  load() {
    try {
      var saved = JSON.parse(localStorage.getItem("snakeSettings"));
      if (saved) {
        var merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        for (var key in saved) {
          if (key === "enabledItems") {
            for (var item in saved.enabledItems) {
              merged.enabledItems[item] = saved.enabledItems[item];
            }
          } else {
            merged[key] = saved[key];
          }
        }
        return merged;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  save() {
    localStorage.setItem("snakeSettings", JSON.stringify(this.current));
  }

  applyToUI() {
    this.setToggleGroup("players", this.current.players);
    this.setToggleGroup("player2Type", this.current.player2Type);
    var p2Section = document.getElementById("p2TypeSection");
    if (p2Section) p2Section.style.display = this.current.players === 2 ? "" : "none";
    this.setToggleGroup("wallMode", this.current.wallMode);
    this.setToggleGroup("obstacles", this.current.obstacles ? "on" : "off");
    this.setToggleGroup("bonuses", this.current.bonuses ? "on" : "off");
    var itemSection = document.getElementById("itemSettings");
    if (itemSection) itemSection.style.display = this.current.bonuses ? "" : "none";
    var compSection = document.getElementById("competitiveSection");
    if (compSection) compSection.style.display = this.current.players === 2 ? "" : "none";

    for (var key in this.current.enabledItems) {
      var cb = document.getElementById("item_" + key);
      if (cb) cb.checked = this.current.enabledItems[key];
    }
  }

  setToggleGroup(name, value) {
    var buttons = document.querySelectorAll('[data-group="' + name + '"]');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].dataset.value == value) {
        buttons[i].classList.add("active");
      } else {
        buttons[i].classList.remove("active");
      }
    }
  }

  bindUI() {
    var self = this;

    var toggles = document.querySelectorAll(".toggle-btn");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener("click", function() {
        var group = this.dataset.group;
        var value = this.dataset.value;

        if (value === "on") value = true;
        else if (value === "off") value = false;
        else if (!isNaN(Number(value))) value = Number(value);

        self.current[group] = value;
        self.setToggleGroup(group, this.dataset.value);

        if (group === "players") {
          var p2Section = document.getElementById("p2TypeSection");
          if (p2Section) p2Section.style.display = value === 2 ? "" : "none";
          var compSection = document.getElementById("competitiveSection");
          if (compSection) compSection.style.display = value === 2 ? "" : "none";
        }
        if (group === "bonuses") {
          var itemSection = document.getElementById("itemSettings");
          if (itemSection) itemSection.style.display = value ? "" : "none";
        }

        self.save();
      });
    }

    var checkboxes = document.querySelectorAll(".item-checkbox");
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener("change", function() {
        var itemKey = this.dataset.item;
        self.current.enabledItems[itemKey] = this.checked;

        var anyEnabled = false;
        for (var k in self.current.enabledItems) {
          if (self.current.enabledItems[k]) { anyEnabled = true; break; }
        }
        if (!anyEnabled) {
          this.checked = true;
          self.current.enabledItems[itemKey] = true;
        }

        self.save();
      });
    }

    var selectBtns = document.querySelectorAll(".select-all-none");
    for (var i = 0; i < selectBtns.length; i++) {
      selectBtns[i].addEventListener("click", function() {
        var category = this.dataset.category;
        var action = this.dataset.action;
        var checked = action === "all";
        for (var key in ITEM_TYPES) {
          if (ITEM_TYPES[key].category === category) {
            self.current.enabledItems[key] = checked;
            var cb = document.getElementById("item_" + key);
            if (cb) cb.checked = checked;
          }
        }
        if (!checked) {
          var anyEnabled = false;
          for (var k in self.current.enabledItems) {
            if (self.current.enabledItems[k]) { anyEnabled = true; break; }
          }
          if (!anyEnabled) {
            for (var key in ITEM_TYPES) {
              if (ITEM_TYPES[key].category === category) {
                self.current.enabledItems[key] = true;
                var cb = document.getElementById("item_" + key);
                if (cb) cb.checked = true;
                break;
              }
            }
          }
        }
        self.save();
      });
    }
  }
}
