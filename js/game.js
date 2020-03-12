let gameScene = new Phaser.Scene('Game');

gameScene.init = function() {
  this.playerSpeed = 5;

  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 5;

  this.enemyMinY = 80;
  this.enemyMaxY = 280;
};

gameScene.preload = function() {
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('enemy', 'assets/dragon.png');
  this.load.image('goal', 'assets/treasure.png');
};

gameScene.create = function() {
  let bg = this.add.sprite(0, 0, 'background');

  bg.setOrigin(0, 0);

  this.player = this.add.sprite(50, this.sys.game.config.height / 2, 'player').setScale(0.6);

  this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goal').setScale(0.6);

  this.enemy = this.add.sprite(120, this.sys.game.config.height / 2, 'enemy').setScale(0.6);
  this.enemy.flipX = true;

  this.enemies = this.add.group();

  this.enemies.add(this.enemy)

  Phaser.Actions.ScaleXY

  let dir = Math.random() < 0.5 ? 1 : -1;
  let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed)
  this.enemy.speed = dir * speed;
  console.log(this.enemy.speed)
};

gameScene.update = function() {
  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  };

  let playerRect = this.player.getBounds();
  let treasureRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
    console.log('Reached goal!');

    this.scene.manager.bootScene(this);
  };
  this.enemy.y += this.enemy.speed;

  let conditionUp = this.enemy.speed < 0 && this.enemy.y <= this.enemyMinY
  let conditionDown = this.enemy.speed > 0 && this.enemy.y >= this.enemyMaxY

  if (conditionUp || conditionDown) {
    this.enemy.speed *= -1
  };

};

let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

let game = new Phaser.Game(config);
