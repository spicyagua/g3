var EG3 = EG3 || {};

EG3.Level1 = function() {

  console.log("Level1 function invoked");
  this.numBalls = 4;
  this.ballSpeed = 50;
  this.totalTime = 1000*10;
  this.playerSpeedFactor = 5;//bigger means slower
  this.firstUpdate = true;

  /*
  this.countownClock;
  this.playerWrapper
  this.greenBallGroup
  */



  /**
   *
   */
  this.onetimeCreate = function() {
    console.log("Level1.onetimeCreate");

    //Add background
    this.game.add.sprite(0,0,"bg");

    this.greenBallGroup = this.createBallGroup(
      "greenBall",
      this.numBalls,
      this.ballSpeed);

    this.greenBallGroup.ballsToTheWalls();
    this.playerWrapper = this.createPlayerWrapper();

    //Tap handler to move the player
    this.game.input.onTap.add(this.tapHandler, this);

    //This is just so I don't have to have a bunch of
    //null checks later.  The tween isn't used for anything
    this.moveTween = this.game.add.tween(this.playerBody);

    this.countownClock = this.createCountDownTimer(this.totalTime);
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {


    this.firstUpdate = true;

    this.playerWrapper.revivePlayer();

    this.greenBallGroup.ballsToTheWalls();

    this.playerWrapper.playerBody.events.onOutOfBounds.remove(this.spriteLeftWorld);

    //re-add tap handler
    this.game.input.onTap.add(this.tapHandler, this);

    this.countownClock.reset();

    this.playerDead = false;
  };

  /**
   *
   */
  this.init = function(params) {
    console.log("Init called.  This is how I can pass state between ... states");
  };

  /**
   *
   */
  this.update = function() {
    if(this.firstUpdate) {
      this.firstUpdate = false;
      this.countownClock.startTimming();
    }
    else {
      if(!this.playerDead && this.countownClock.update()) {
        console.log("Need a victory method and plan of action");
        EG3.app.advanceLevel();
        this.game.state.start('prelevel');
        return;
      }

    }
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.greenBallGroup.group);
    this.game.physics.arcade.collide(this.playerWrapper.playerBody,
      this.greenBallGroup.group,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBallCollisionProcess,
      this);
    this.playerWrapper.update();
  };

  /**
   * Callback when a dead sprite finally falls off the world
   */
  this.spriteLeftWorld = function() {
    console.log("Sprite left world");
  };

  /**
   * Callback when user taps on screen
   */
  this.tapHandler = function() {
    console.log("Moving to pointer: " + this.game.input.activePointer.x + ", " + this.game.input.activePointer.y);
    if(this.moveTween.isRunning) {
      console.log("Tween running.  Stop it");
      this.moveTween.stop();
    }
    else {
      console.log("Tween not running.");
    }

    //Create the tween to move the player
    this.moveTween = this.game.add.tween(this.playerWrapper.playerBody);

    //so the player moves at a constant *speed*, the tween should have
    //a duration proportional to the distance it will travel
    var duration = this.playerSpeedFactor *
      Math.floor(this.game.physics.arcade.distanceToPointer(this.playerWrapper.playerBody, this.game.input.activePointer));

    this.moveTween.to(
      {
        x: this.game.input.activePointer.x,
        y: this.game.input.activePointer.y
      },
      duration,
      Phaser.Easing.Quadratic.In
    );
    console.log("Calling start on tween");
    this.moveTween.start();
  };




  /**
   *
   */
  this.playerBallCollisionProcess = function(playerBody, ball) {
    console.log("Player/ball collision - process callback");

    if(this.playerDead) {
      //It is cute to still have the player bounce off of things as it decends
      //into the abyss
      return true;
    }

    this.playerDead = true;

    //Kill some working-game things
    this.moveTween.stop();
    this.game.input.onTap.remove(this.tapHandler, this);

    this.playerWrapper.killPlayer();

    //Tell the player sprite to care
    //if it leaves the world (normally expensive
    //so I've read) then get a callback when it finally leaves
    this.playerWrapper.playerBody.checkWorldBounds = true;
    this.playerWrapper.playerBody.events.onOutOfBounds.add(this.spriteLeftWorld, this);

    this.levelFailed();

    return true;
  };


  this.shutDown = function() {
    console.log("Shutting down level1");
  };
};

EG3.Level1.constructor = EG3.Level1;

EG3.Level1.description = "Tap to move Sprite.  Avoid the green tomatoes for 20 seconds";

EG3.Level1.prototype = new EG3.Level();


