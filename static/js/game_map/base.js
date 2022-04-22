import { GameObject } from "../game_objects/base.js";

export class GameMap extends GameObject {
  constructor(root) {
    super();

    this.root = root;
    this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');
    this.ctx = this.$canvas[0].getContext("2d");
    this.root.$kof.append(this.$canvas);
    this.$canvas.focus();
    this.root.$kof.append(`      
    <div class="kof-head">
      <div class="kof-head-hp-0">
        <div>
          <div></div>
        </div>
      </div>
      <div class="kof-head-timer">60</div>
      <div class="kof-head-hp-1">
        <div>
          <div></div>
        </div>
      </div>
    </div>`);

    this.time_left = 60500; // 60 seconds
    this.$timer = this.root.$kof.find(".kof-head-timer");
  }

  start() {}

  update() {
    this.time_left -= this.time_delta;

    if (this.time_left <= 0) {
      this.time_left = 0;

      // When the timer is 0 and two players are still alive, both players will be defeated(i.e the game is tied))
      let [a, b] = this.root.players;
      if (a.status !== 6 && b.status !== 6) {
        a.status = b.status = 6;
        a.frame_current_cnt = b.frame_current_cnt = 0;
      }
    }

    this.$timer.text(parseInt(this.time_left / 1000));
    this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
  }
}
