import { GameMap } from "./game_map/base.js";
import { Player } from "./player/base.js";
import { Controller } from "./controller/base.js";

class KOF {
  constructor(id) {
    this.$kof = $("#" + id);

    this.game_map = new GameMap(this);

    this.Controller = new Controller(this.game_map.$canvas);

    this.players = [
      new Player(this, {
        id: 0,
        x: 200,
        y: 0,
        width: 120,
        height: 200,
        color: "blue",
      }),
      new Player(this, {
        id: 1,
        x: 900,
        y: 0,
        width: 120,
        height: 200,
        color: "red",
      }),
    ];
  }
}

export { KOF };
