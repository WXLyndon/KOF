import { GameObject } from "../game_objects/base.js";

export class Player extends GameObject {
  constructor(root, info) {
    super();

    this.root = root;
    this.id = info.id;
    this.x = info.x;
    this.y = info.y;
    this.width = info.width;
    this.height = info.height;
    this.color = info.color;

    this.direction = 1;

    this.vx = 0;
    this.vy = 0;

    this.speedx = 400; // initial horizontal speed
    this.speedy = -1000; // initial vertical speed when jump

    this.gravity = 50; // gravity force

    this.ctx = this.root.game_map.ctx;
    this.pressed_keys = this.root.Controller.pressed_keys;
    this.status = 3; // 0: idle, 1: forward, 2: backward, 3: jump, 4: attack, 5: attacked, 6: defeated

    this.animations = new Map();
    this.frame_current_cnt = 0;
  }

  start() {}

  update_move() {
    if (this.status === 3) {
      this.vy += this.gravity;
    }

    this.x += (this.vx * this.time_delta) / 1000;
    this.y += (this.vy * this.time_delta) / 1000;

    if (this.y > 450) {
      this.y = 450;
      this.vy = 0;
      this.status = 0;
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
      this.x = this.root.game_map.$canvas.width() - this.width;
    }
  }

  update_control() {
    let w, a, d, space;

    if (this.id === 0) {
      w = this.pressed_keys.has("w");
      a = this.pressed_keys.has("a");
      d = this.pressed_keys.has("d");
      space = this.pressed_keys.has(" ");
    } else {
      w = this.pressed_keys.has("ArrowUp");
      a = this.pressed_keys.has("ArrowLeft");
      d = this.pressed_keys.has("ArrowRight");
      space = this.pressed_keys.has("Enter");
    }

    // Player is in moving or idle state.
    if (this.status === 0 || this.status === 1) {
      // Player is attacking.
      if (space) {
        this.status = 4;
        this.vx = 0;
        this.frame_current_cnt = 0;
      }

      // Player is jumping
      else if (w) {
        // Player is jumping forward.
        if (d) {
          this.vx = this.speedx;
        } else if (a) {
          // Player is jumping backward.
          this.vx = -this.speedx;
        } else {
          // Player is just jumping upward.
          this.vx = 0;
        }
        this.vy = this.speedy;
        this.status = 3;
        this.frame_current_cnt = 0;
      } else if (d) {
        // Player is moving forward.
        this.vx = this.speedx;
        this.status = 1;
      } else if (a) {
        // Player is moving backward.
        this.vx = -this.speedx;
        this.status = 1;
      } else {
        // Player is just standing.
        this.vx = 0;
        this.status = 0;
      }
    }
  }

  update() {
    this.update_control();
    this.update_move();
    this.render();
  }

  render() {
    let status = this.status;

    if (status === 1 && this.direction * this.vx < 0) {
      status = 2;
    }

    let obj = this.animations.get(status);
    if (obj && obj.loaded) {
      let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
      let image = obj.gif.frames[k].image;
      this.ctx.drawImage(
        image,
        this.x,
        this.y + obj.offset_y,
        image.width * obj.scale,
        image.height * obj.scale
      );
    }

    // When the player is in attack state
    if (status === 4)
      if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
        // And the attack animation is finished
        this.status = 0;
      }

    this.frame_current_cnt++;
  }
}
