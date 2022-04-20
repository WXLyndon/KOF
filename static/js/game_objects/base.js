let GAME_OBJECTS = [];

class GameObject {
  constructor() {
    GAME_OBJECTS.push(this);

    this.time_delta = 0; // Time since last frame
    this.has_called_start = false;
  }

  start() {
    // Called one time when the game starts
  }

  update() {
    // Called every frame(except the first frame)
  }

  destroy() {
    // Called when the game ends, destroy current object
    for (let i in GAME_OBJECTS) {
      if (GAME_OBJECTS[i] === this) {
        GAME_OBJECTS.splice(i, 1);
        break;
      }
    }
  }
}

let last_timestamp;

let GAME_OBJECTS_FRAME = (timestamp) => {
  for (let object of GAME_OBJECTS) {
    if (!object.has_called_start) {
      object.start();
      object.has_called_start = true;
    } else {
      object.time_delta = timestamp - last_timestamp;
      object.update();
    }
  }

  last_timestamp = timestamp;
  requestAnimationFrame(GAME_OBJECTS_FRAME);
};

requestAnimationFrame(GAME_OBJECTS_FRAME);
