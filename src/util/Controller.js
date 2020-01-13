class Controller {
  constructor(player) {
    // this.gameview = gameview;
    this.player = player;

    this.keysPressed = {};

    this.keydown = this.keydown.bind(this);
    this.keyup = this.keyup.bind(this);
    window.addEventListener("keydown", this.keydown);
    window.addEventListener("keyup", this.keyup);
  }

  keydown(event) {
    this.player.idle = false;
    this.player.keydown = true;

    switch (Controller.KEYS[event.keyCode]) {
      case "left":
        this.keysPressed.left = true;
        this.player.direction = "left";
        this.player.velX = -6;

        break;
      case "right":
        this.keysPressed.right = true;
        this.player.direction = "right";
        this.player.velX = 7;
        break;
      case "up":
        this.keysPressed.up = true;
        break;
      case "down":
        this.keysPressed.down = true;
        break;
      case "jump":
        this.keysPressed.jump = true;
        this.player.jump();
        break;
      case "fire":

        this.keysPressed.fire = true;
        if (this.keysPressed.up) {
          this.player.shootFire("up");
        } else if (this.keysPressed.down && !this.player.onGround) {
          this.player.shootFire("down");
        } else {
          this.player.shootFire();

        }
        break;
      case "space":
        // this.gameview.Ticker.paused = (this.gameview.Ticker.paused) ? false: true;
        break;
      default:
        return;
    }

  }

  keyup(event) {
    // if (Controller.KEYS[event.keyCode] === "left" ||
    //   Controller.KEYS[event.keyCode] === "right") {
    //   this.player.keydown = false;
    //   // this.player.velX = 0;
    //   // this.player.idle =ß true;
    //   return;
    // }
    switch (Controller.KEYS[event.keyCode]) {
      case "left":
        this.keysPressed.left = false;
        // this.player.velX = 0;

        if (!this.keysPressed.left && !this.keysPressed.right) this.player.velX = 0;

        break;
      case "right":
        this.keysPressed.right = false;
        // this.player.velX *= -1;
        if (!this.keysPressed.left && !this.keysPressed.right) this.player.velX = 0;
        break;
      case "up":
        this.keysPressed.up = false;
        break;
      case "down":
        this.keysPressed.down = false;
        break;
      case "jump":
        this.keysPressed.jump = false;
        break;
      case "fire":
        this.keysPressed.fire = false;
        break;
      case "space":
        // this.gameview.Ticker.paused = (this.gameview.Ticker.paused) ? false: true;
        break;
      default:
        return;
    }


    this.player.idle = true;
    // this.keysPressed = {};
    // console.log(Controller.KEYS[event.keyCode])
    // debugger

  }
}


Controller.KEYS = {
  19: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'jump',
  68: 'fire',
  13: 'enter'
};



export default Controller;