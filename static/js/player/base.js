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

    this.hp = 100;
    this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id} > div`); // query the hp bar
  }

  start() {}

  update_move() {
    this.vy += this.gravity;

    this.x += (this.vx * this.time_delta) / 1000;
    this.y += (this.vy * this.time_delta) / 1000;

    if (this.y > 450) {
      this.y = 450;
      this.vy = 0;

      if (this.status === 3) {
        this.status = 0;
      }
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

  update_direction() {
    // If the player is alredy defeated, don't change direction.
    if (this.status === 6) {
      return;
    }

    let players = this.root.players;
    if (players.length === 2) {
      let this_player = this;
      let other_player = players[1 - this.id];

      if (this_player.x < other_player.x) {
        this.direction = 1;
      } else {
        this.direction = -1;
      }
    }
  }

  collision_detection(r1, r2) {
    if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
      return false;
    }
    if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
      return false;
    }

    return true;
  }

  is_attacked() {
    // If the player is already defeated, couldn't be attacked again.
    if (this.status === 6) {
      return;
    }

    this.status = 5;
    this.frame_current_cnt = 0;

    this.hp = this.hp - 10;

    this.$hp.width((this.$hp.parent().width() * this.hp) / 100);

    if (this.hp <= 0) {
      this.status = 6;
      this.frame_current_cnt = 0;
    }
  }

  update_attack() {
    if (this.status === 4 && this.frame_current_cnt === 18) {
      let players = this.root.players;
      let this_player = this;
      let other_player = players[1 - this.id];

      let r1;
      if (this.direction > 0) {
        r1 = {
          x1: this_player.x + 120,
          y1: this_player.y + 40,
          x2: this_player.x + 120 + 100,
          y2: this_player.y + 40 + 20,
        };
      } else {
        r1 = {
          x1: this_player.x + this.width - 120 - 100,
          y1: this_player.y + 40,
          x2: this_player.x + this.width - 120 - 100 + 100,
          y2: this_player.y + 40 + 20,
        };
      }

      let r2 = {
        x1: other_player.x,
        y1: other_player.y,
        x2: other_player.x + other_player.width,
        y2: other_player.y + other_player.height,
      };

      if (this.collision_detection(r1, r2)) {
        other_player.is_attacked();
      }
    }
  }

  update() {
    this.update_control();
    this.update_move();
    this.update_direction();
    this.update_attack();
    this.render();
  }

  render() {
    let status = this.status;

    if (status === 1 && this.direction * this.vx < 0) {
      status = 2;
    }

    let obj = this.animations.get(status);
    if (obj && obj.loaded) {
      if (this.direction > 0) {
        let k =
          parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
        let image = obj.gif.frames[k].image;
        this.ctx.drawImage(
          image,
          this.x,
          this.y + obj.offset_y,
          image.width * obj.scale,
          image.height * obj.scale
        );
      } else {
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

        let k =
          parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
        let image = obj.gif.frames[k].image;
        this.ctx.drawImage(
          image,
          this.root.game_map.$canvas.width() - this.x - this.width,
          this.y + obj.offset_y,
          image.width * obj.scale,
          image.height * obj.scale
        );

        this.ctx.restore();
      }
    }

    // When the player is in attack state or attacked state or defeated state.
    if (status === 4 || status === 5 || status === 6) {
      if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
        if (status === 6) {
          // If the player is defeated, the player should remain layed on the ground.
          this.frame_current_cnt--;
        } else {
          // And the attack or attacked animation is finished
          this.status = 0;
        }
      }
    }

    this.frame_current_cnt++;
  }
}
