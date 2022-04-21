import { GameMap } from "./game_map/base.js";

class KOF {
  constructor(id) {
    this.$kof = $("#" + id);

    this.game_map = new GameMap(this);
  }
}

export { KOF };
