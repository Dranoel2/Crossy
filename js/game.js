let gameScene = new Phaser.Scene('Game');

gameScene.init = function() {
  this.playerSpeed = 5;

  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 5;

  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  this.isTerminating = false;
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

  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 3,
    setXY: {
      x: 128,
      y: 100,
      stepX: 100,
      stepY: 20
    }
  });

  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4)

  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    enemy.flipX = true;
    let dir = Math.random() < 0.5 ? 1 : -1;
    let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
    enemy.speed = dir * speed;
  }, this);
};

gameScene.update = function() {

  if (this.isTerminating) return;

  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  };

  let playerRect = this.player.getBounds();
  let treasureRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
    this.isTerminating = true;
    console.log('Reached goal!');

    this.cameras.main.fade(500);

    this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
      this.scene.restart()
    }, this)
  };

  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {
    enemies[i].y += enemies[i].speed;

    let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY
    let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY

    if (conditionUp || conditionDown) {
      enemies[i].speed *= -1
    };

    let enemyRect = enemies[i].getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      console.log('Died!');

      return this.gameOver();
    }
  }

};

gameScene.gameOver = function() {

  this.isTerminating = true;

  this.cameras.main.shake(500);

  this.cameras.main.on('camerashakecomplete', function(camera, effect) {
    this.cameras.main.fade(500);

    this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
      this.scene.restart()
    }, this)
  }, this)
}

let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

let game = new Phaser.Game(config);
