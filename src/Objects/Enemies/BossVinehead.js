import Enemy from "./Enemy";

import GameObject from "../GameObject";
import Projectile from "../Projectiles/Projectile";
import Player from "../../Player";
import Vinehead from "./Vinehead";
import Vine from '../Projectiles/Vine';

const CONSTANTS = {
  GRAVITY: 0.8,
  FRICTION: 2.5,
  MAX_VEL: 50
};

class BossVinehead extends Enemy {
  constructor(options) {
    super(options);
    this.player = options.player;
    this.velX = options.velX || 0;
    this.velY = 0;
    this.image = options.image || "./assets/vinehead.png";
    this.enemy = this.loadImage(this.image);
    this.vineNum = 5;

    // this.vines = this.loadImage("../assets/vine.png");
    this.frameNum = options.frameNum || 8;
    this.frameStartX = 0;
    this.frameStartY = 0;
    this.frameWidth = options.frameWidth || 57;
    this.frameHeight = options.frameHeight || 87;
    this.active = true;
    this.opening = false;
    this.projectiles = {};
    this.playerCheckTimeout = "";
    this.damage = 50;
    this.attacking = false;
    this.charging = false;
    this.frameCount = 0;

    this.points = 50;

    this.vines = [
      new Vine(Vine.vines1(this, [600, 60])),
      new Vine(Vine.vines1(this, [600, 150])),
      new Vine(Vine.vines1(this, [600, 500])),
      new Vine(Vine.vines1(this, [700, 100])),
      new Vine(Vine.vines1(this, [600, 300])),
      new Vine(Vine.vines1(this, [700, 400])),
    ]

    this.drawEnemy = this.drawEnemy.bind(this);
    this.shootProj = this.shootProj.bind(this);
    // this.setPlayerCheckInterval = this.setPlayerCheckInterval.bind();
    // this.checkPlayerPos = this.checkPlayerPos.bind(this);
    this.callAttack = this.callAttack.bind(this);
    this.charge = this.charge.bind(this);
    this.startFrameCount = this.startFrameCount.bind(this);
    this.shuffleVines = this.shuffleVines.bind(this);
    this.renderVines = this.renderVines.bind(this);
    this.attackVines = this.attackVines.bind(this);
    this.startAttack = this.startAttack.bind(this);
    this.startFrameCount();
    this.startAttack();
  }

  startFrameCount() {
    this.bossInterval = setInterval(() => {
      this.frameCount++;
    }, 1000 / 30);
    // }, 5000)
  }

  startAttack() {
    this.attackTimeout = setTimeout(() => {
      this.attack();
    }, 1000);

    // setTimeout(() => {
    this.vineInterval = setInterval(() => {

      this.attackVines();
    }, 10000);
  }

  spawnEnemies() {
    // if (this.enemies.length < 8) {
    //   this.enemiesnew Vinehead(Vinehead.vine3([500, 100], this.player));
    // }
  }

  attack() {
    this.attacking = true;
    this.chargeTimeout = setTimeout(() => {
      this.charge();
    }, 2500);
  }

  charge() {
    this.charging = true;
    this.velX = -10;
  }


  shuffleVines(vines) {
    for (let i = vines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vines[i], vines[j]] = [vines[j], vines[i]];
    }
    return vines;
  }

  renderVines(ctx, player) {
    this.vines.forEach((vine, i) => {
      vine.move(ctx, this.frameCount, player);
    });
  }

  attackVines() {

    this.vines.forEach((vine, i) => {
      vine.attack((1500) + i * 300);
    })
    setTimeout(() => {
      this.vines = this.shuffleVines(this.vines);
    }, 5000);
  }

  drawEnemy(ctx, frameCount) {
    this.setDying();
    
    if ((this.isHit || this.dying) && frameCount % 3 === 0) return;

    let y = ((this.attacking && 
      (this.frameCount % 3 === 0 || this.frameCount % 3 === 1)) ||
      this.charging) ? 87 : this.frameStartY;
    if (this.dir === "right") {
      let count = Math.floor(frameCount / 2.5) % this.frameNum;
      ctx.drawImage(
        this.enemy,
        (Math.floor(this.frameCount / 1.5) % this.frameNum) * this.frameWidth,
        y,
        this.frameWidth,
        this.frameHeight,
        this.x, this.y,
        this.width, this.height
      );
    } else {
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.enemy,
        (this.frameCount % this.frameNum) * this.frameWidth + this.frameStartX,
        y,
        this.frameWidth,
        this.frameHeight,
        -this.x - this.width, this.y,
        this.width, this.height
      );
      ctx.scale(-1, 1);

    }

  }

  shootProj() {

    if (Object.keys(this.projectiles).length === 3) return;

    let key;
    for (let i = 1; i <= 3; i++) {
      if (!this.projectiles[i]) {
        key = i;
        break;
      }
    }

    if (this.dir === "left") {

      this.projectiles[key] = new Projectile(
        Projectile.helibullet(
          [this.leftSide() + 30,
          this.bottomSide() - 23],
          -9, 7, "left")
      );
    } else {
      this.projectiles[key] = new Projectile(
        Projectile.helibullet(
          [this.rightSide() - 40,
          this.bottomSide() - 23],
          9, 7, "right")
      );

    }
  }

  setDying() {
    if (this.health <= 0) {
      this.dying = true;
      this.vines.forEach((vine) => {
        clearTimeout(vine.chargeTimeout);
        clearTimeout(vine.vineTimeout);
      })
      this.damage = 0;
      this.velX = 0;
      this.velY = 0;
      clearInterval(this.attackInterval);
      clearInterval(this.vineInterval);
      setTimeout(() => {
        this.dead = true;
        clearInterval(this.startFrameCount);
      }, 3000);
    }
  }

  ////////CPU

  
  backUp() {
    this.charging = false;
    this.velX = 2;
  }

  move(canvas, player, ctx) {
    this.oldX = this.x;
    this.x += this.velX;
    if (this.x < 160) {
      this.x = 160;
      // this.attacking = false;
      this.backUp();
    } else if (this.x > 650) {
      this.velX = 0;
      this.attacking = false;
      this.x = 650;

      this.attackTimeout = setTimeout(() => {
        this.attack();
      }, 7000);
    }

    this.renderVines(ctx, player)

  }

  //////



  static boss1(pos, player, dir = "right") {
    return {
      name: "vinehead",
      image: "./assets/vinehead.png",
      frameNum: 8,
      pos: pos,
      width: 260,
      height: 370,
      health: 1200,
      velX: 0,
      dir: "left",
      player: player
    };
  }

}




export default BossVinehead;
