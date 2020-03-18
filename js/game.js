let gameScene = new Phaser.Scene('Game');

this.randint = function(min,max) {
  return min + Math.random() * (max-min)
}

gameScene.init = function() {

  this.playerSpeed = 5;

  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 5;

  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  this.isTerminating = false;
  this.fadedIn = false
};

gameScene.preload = function() {
  this.load.audio('music', [
      'assets/audio/Questing.mp3'
    ]);
  this.load.audio('boom', [
    'assets/audio/expl.mp3'
  ]);
  this.load.audio('boing',[
    'assets/audio/Boing-sound.mp3'
  ])
  this
  this.load.image('background', 'assets/images/background.png');
  this.load.image('player', 'assets/images/pig.png');
  this.load.image('enemy', 'assets/images/lava.png');
  this.load.image('goal', 'assets/images/poop.png');
};

gameScene.create = function() {
  this.boing = this.sound.add('boing');

  this.boom = this.sound.add('boom');

  this.music = this.sound.add('music');

  this.music.loop = true;

  this.music.play();

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
      stepX: 110,
      stepY: 20
    }
  });

  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4)

  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    let dir = Math.random() < 0.5 ? 1 : -1;
    let speed = randint(this.enemyMinSpeed,this.enemyMaxSpeed)
    enemy.rotateSpeed = randint(-10,10);
    enemy.speed = dir * speed;
    enemy.angle = Math.random() * 360
  }, this);
};


gameScene.update = function() {
  if (this.isTerminating) return;

  if (!this.fadedIn) {
    this.isTerminating = true

    this.cameras.main.fadeIn(500)

    this.cameras.main.on('camerafadeincomplete', function(camera, effect) {
      this.fadedIn = true;
      this.isTerminating = false;
    }, this)
  }

  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  };

  let playerRect = this.player.getBounds();
  let treasureRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
    this.isTerminating = true;

    console.log('Reached goal!');

    this.music.stop()

    this.cameras.main.fade(500);

    this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
      this.scene.restart()
    }, this)
  };

  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {
    enemies[i].angle += enemies[i].rotateSpeed

    enemies[i].y += enemies[i].speed;

    let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY
    let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY

    if (conditionUp || conditionDown) {
      this.boing.play()
      enemies[i].speed *= -1
    };

    let enemyRect = enemies[i].getBounds();
    let enemyCircle = new Phaser.Geom.Circle(enemies[i].x, enemies[i].y, enemyRect.width/2)

    if (Phaser.Geom.Intersects.CircleToRectangle(enemyCircle, playerRect)) {
      console.log('Died!');

      return this.gameOver();
    }
  }

};

gameScene.gameOver = function() {

  this.boom.play()

  this.player.destroy()

  this.music.stop()

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
  scene: gameScene,
};

let game = new Phaser.Game(config);
