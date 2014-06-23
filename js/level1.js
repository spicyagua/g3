var EG3 = EG3 || {};

EG3.Level1 = function() {
  //Data members here
  this.balls;
  this.playerBody;
  this.playerEye;
  this.tap;
  this.moveTween;
}

EG3.Level1.prototype = {

  /**
   * I was having trouble reusing the tweens so I just junk them now and re-create each time.
   */
  createMoveTween: function() {
    return this.game.add.tween(this.playerBody);
  },
  preload: function() {
    console.log("Level1.preload");
  },
  create: function() {
    console.log("Level1.create");

    this.game.add.sprite(0,0,"bg");

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.createBalls();

    //For reasons I don't understand if I start them out at the same point the second
    //image is a green box.  I'd seen this before.  It seems to work if I move them back
    this.playerBody = this.game.add.sprite(100, 100, 'playerBody');
    this.playerBody.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.playerBody, Phaser.Physics.ARCADE);

    this.playerEye = this.game.add.sprite(0, 0, 'playerEye');
    this.playerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(this.playerEye, Phaser.Physics.ARCADE);

    //TEMP Playing with hitting walls
    //4 lines below were just fun to have it bounce off stuff
 //   this.playerBody.body.collideWorldBounds = true;
//    this.playerBody.body.velocity.setTo(20 + Math.random() * 40, 20 + Math.random() * 40);
//    this.playerBody.body.bounce.x = 1;
//    this.playerBody.body.bounce.y = 1;

    this.playerEye.x = this.playerBody.x;
    this.playerEye.y = this.playerBody.y;
    this.playerEye.rotation = this.game.physics.arcade.angleToPointer(this.playerEye);

    this.game.input.onTap.add(this.tapHandler, this);

    this.moveTween = this.createMoveTween();

  },

  update: function() {
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.balls);
    this.game.physics.arcade.collide(this.playerBody,
      this.balls,
      this.playerBallCollisionNotification,
      this.playerBallCollisionProcess,
      this);
    this.playerEye.x = this.playerBody.x;
    this.playerEye.y = this.playerBody.y;

    this.playerEye.rotation = this.game.physics.arcade.angleToPointer(this.playerEye);

    if(this.tap) {
      this.moveTween = this.createMoveTween();

      this.moveTween.to({
        x: this.tap.x,
        y: this.tap.y
      },
//      this.game.physics.arcade.distanceToPointer(this.playerBody, this.game.input.activePointer),
        500,
        Phaser.Easing.Quadratic.In
      );
      var that = this;
      this.moveTween.onLoop.add(function() {
        console.log("(tween callback) In tween loop");
      });
      this.moveTween.onStart.add(function() {
        console.log("(tween callback) Starting tween loop");
      });
      this.moveTween.onComplete.add(function() {
        console.log("(tween callback) Done tween loop");
      });
      console.log("Calling start on tween");
      this.moveTween.start();
      delete this.tap;
    }


  },
  playerBallCollisionNotification: function(playerBody, ball) {
    //I have yet to figure out what this does and why it is called
    console.log("Player/ball collision");
  },
  playerBallCollisionProcess: function(playerBody, ball) {
    console.log("Player/ball collision (process callback)");
    this.moveTween.stop();
    return false;
  },
  createBalls: function() {
    this.balls = this.game.add.group();
    this.balls.enableBody = true;

    for (var i = 0; i < 10; i++)
    {
        var s = this.balls.create(this.game.world.randomX, this.game.world.randomY, 'greenBall');
        s.name = 'greenBall' + i;
        this.game.physics.enable(s, Phaser.Physics.ARCADE);
        s.body.collideWorldBounds = true;
        s.body.bounce.setTo(0.8, 0.8);
        s.body.velocity.setTo(10 + Math.random() * 40, 10 + Math.random() * 40);
        s.body.bounce.x = 1;
        s.body.bounce.y = 1;
//        s.body.minBounceVelocity(0);

    }
  },
  tapHandler: function() {

    console.log("Moving to pointer: " + this.game.input.activePointer.x + ", " + this.game.input.activePointer.y);
    if(this.moveTween.isRunning) {
      console.log("Tween running.  Stop it");
      this.moveTween.stop();
    }
    else {
      console.log("Tween not running.");
    }

    this.tap = {
      x:this.game.input.activePointer.x,
      y: this.game.input.activePointer.y
  };
  //Totally doesn't work.  Not sure why.
/*
    this.game.physics.arcade.moveToPointer(this.playerBody,
      this.game.input.activePointer,
      60,
      500);
*/
  }

};
