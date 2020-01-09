import Player from "./Player";
import Level from "./Levels/Level";
import Tile from "./Objects/Platforms/Tile";
import Collision from "./util/Collision";
import Controller from "./util/Controller";
import Enemy from "./Objects/Enemies/Enemy";

const CONSTANTS = {
  GRAVITY: 0.8,
  FRICTION: 2.5,
  MAX_VEL: 50
};


class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = new Player(this.ctx, this.canvas);
    this.controller = new Controller(this.player);
    this.level = new Level({ 
      // canvas: canvas, 
      ctx: ctx, 
      renderMap: Game.map1,
      physicalMap: Game.physicalMap1 
    });
    this.physicalMap = this.level.physicalMap;
    this.tileSize = this.level.tileSize;
    this.collider = new Collision();
    this.frameCount = 0;
    // this.getPlayerTilePos = this.getPlayerTilePos.bind(this);
    this.getTopLeftPos = this.getTopLeftPos.bind(this);
    this.getTopRightPos = this.getTopRightPos.bind(this);
    this.getBottomLeftPos = this.getBottomLeftPos.bind(this);
    this.getBottomRightPos = this.getBottomRightPos.bind(this);
    this.playerPlatformCheck = this.playerPlatformCheck.bind(this);
    this.playerUpdate = this.playerUpdate.bind(this);
    this.projectilePlatformCheck = this.projectilePlatformCheck.bind(this);
    this.renderFireballs = this.renderFireballs.bind(this);
    this.renderEnemies = this.renderEnemies.bind(this);
    this.renderEnemyProjectiles = this.renderEnemyProjectiles.bind(this);
    this.startFrameCount = this.startFrameCount.bind(this);
    this.runGame = this.runGame.bind(this);


    this.enemies = {
      1: new Enemy(Enemy.helicopter([100, 150]))
    };


    this.startFrameCount();
  }

  startFrameCount() {
    this.frameInterval = setInterval(() => {
      this.frameCount++;
    }, (1000 / 30));
  }

  getTopLeftPos() {
    let x = Math.floor(this.player.leftSide() / this.tileSize);
    let y = Math.floor(this.player.topSide() / this.tileSize);
    return [x, y];
  }
  getTopRightPos() {
    let x = Math.floor(this.player.rightSide() / this.tileSize);
    let y = Math.floor(this.player.topSide() / this.tileSize);
    return [x, y];
  }
  getBottomLeftPos() {
    let x = Math.floor(this.player.leftSide() / this.tileSize);
    let y = Math.floor(this.player.bottomSide() / this.tileSize);
    return [x, y];
  }
  getBottomRightPos() {
    let x = Math.floor(this.player.rightSide() / this.tileSize);
    let y = Math.floor(this.player.bottomSide() / this.tileSize);
    return [x, y];
  }


  playerPlatformCheck() {
    let colVal;
    let top;
    let bottom;
    let right;
    let left;
    let cols = 15;
    let rows = 10;
    let floorCount = 0;

    [left, top] = this.getTopLeftPos();
    colVal = this.physicalMap[top * cols + left];
    this.collider.collidePlatform(
      this.player,
      left * this.tileSize,
      top * this.tileSize,
      colVal    
    );

    [right, top] = this.getTopRightPos();
    colVal = this.physicalMap[top * cols + right];
    this.collider.collidePlatform(
      this.player,
      right * this.tileSize,
      top * this.tileSize,
      colVal    
    );

    [left, bottom] = this.getBottomLeftPos();
    colVal = this.physicalMap[bottom * cols + left];
    (colVal === 0) ? floorCount++ : "";
    this.collider.collidePlatform(
      this.player,
      left * this.tileSize,
      bottom * this.tileSize,
      colVal    
    );


    [right, bottom] = this.getBottomRightPos();
    colVal = this.physicalMap[bottom * cols + right];
    (colVal === 0) ? floorCount++ : "";
    if (floorCount === 2) {
      this.player.onGround = false;
      // if (this.player.jumpCount === 2) this.player.jumpCount -=;
    }
    this.collider.collidePlatform(
      this.player,
      right * this.tileSize,
      bottom * this.tileSize,
      colVal
    );
  }


  projectilePlatformCheck(projectile) {
    let colVal;
    let top;
    let bottom;
    let right;
    let left;
    let cols = 15;

    if (projectile.dir === "left") {
      [left, top] = projectile.getTopLeftPos();
      colVal = this.physicalMap[top * cols + left];
      this.collider.collidePlatform(
        projectile,
        left * this.tileSize,
        top * this.tileSize,
        colVal
      );

      [left, bottom] = projectile.getBottomLeftPos();
      colVal = this.physicalMap[bottom * cols + left];
      this.collider.collidePlatform(
        projectile,
        left * this.tileSize,
        bottom * this.tileSize,
        colVal
      );
    }

    if (projectile.dir === "right") {
      [right, top] = projectile.getTopRightPos();
      colVal = this.physicalMap[top * cols + right];
      this.collider.collidePlatform(
        projectile,
        right * this.tileSize,
        top * this.tileSize,
        colVal
      );

      [right, bottom] = projectile.getBottomRightPos();
      colVal = this.physicalMap[bottom * cols + right];

      this.collider.collidePlatform(
        projectile,
        right * this.tileSize,
        bottom * this.tileSize,
        colVal
      );

    }

  }
  

  playerUpdate() {
    this.player.setRunning();
    this.player.isIdle();
    this.player.setOldPos();

    if (!this.player.idle) {
      
      if (this.player.direction === "right") {
        if (this.player.onGround && !this.player.keydown) {
          this.player.velX < 1 ? (this.player.velX = 0) : (this.player.velX /= CONSTANTS.FRICTION);
        }
      } else if (this.player.direction === "left") {
        if (this.player.onGround && !this.player.keydown) {
          this.player.velX > -1 ? (this.player.velX = 0) : (this.player.velX /= CONSTANTS.FRICTION);
        }
      }
      this.player.x += this.player.velX;
    }

    this.player.inAir();

    this.collider.collidePlayer(this.player, this.canvas);
    this.playerPlatformCheck();
  }

  renderEnemies() {
    if (Object.values(this.enemies).length !== 0) {
      for (let key in this.enemies) {
        this.enemies[key].move(this.canvas);
        // this.enemies[key].collideEnemy(this.player);
        this.enemies[key].drawEnemy(this.ctx, this.frameCount);
        // this.projectilePlatformCheck(this.enemies[key]);
      }
    }
  }

  renderFireballs() {
    if (Object.keys(this.player.fireballs).length !== 0) {
      for (let key in this.player.fireballs) {
        let fireball = this.player.fireballs[key];
        this.projectilePlatformCheck(fireball);
        (!fireball.hit) ? 
          fireball.drawProjectile(this.ctx, this.frameCount) :
          delete this.player.fireballs[key];
      }
    }
  }

  renderEnemyProjectiles() {
    ///Check if any enemies
    Object.values(this.enemies).forEach((enemy) => {
      if (Object.keys(enemy.projectiles).length !== 0) {
        for (let key in enemy.projectiles) {
          this.projectilePlatformCheck(enemy.projectiles[key]);
          (!enemy.projectiles[key].hit) ?
            enemy.projectiles[key].drawProjectile(this.ctx, this.frameCount) :
            delete enemy.projectiles[key];
        }
      }
    });
  }



  runGame() {
    
    this.level.drawLevel(this.ctx);
    this.player.drawPlayer(this.frameCount);
    this.playerUpdate();

    // this.enemies[1].drawEnemy(this.ctx, this.frameCount);
    this.renderEnemies();
    this.enemies[1].callAttack(this.frameCount);
    
    this.renderEnemyProjectiles();
    this.renderFireballs();
    // this.player.move();
    // this.collider.collidePlayer(this.player, this.canvas);
    // this.playerPlatformCheck();
  }



}



Game.map1 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 38, 39, 0, 0, 0, 0, 0,
  0, 42, 41, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 22, 23, 23, 63, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 29, 29, 29,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6
];
Game.physicalMap1 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
];

// Game.map1 = [
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
//   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
// ];


// Game.physicalMap1 = [
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 1
// ];
// Game.physicalMap1 = [
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 3, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 4, 0, 0],
//   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
// ];
export default Game;