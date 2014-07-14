var EG3 = EG3 || {};

EG3.BouncyBalls = function(args) {

  console.log("Level1 function invoked");
  this.settings = args;

  this.firstUpdate = true;

  /**
   * Part of the "level" contract
   */
  this.onetimeCreate = function() {
    console.log("BouncyBalls.onetimeCreate");

    //Add background
    this.game.add.sprite(0,0,"bg");

    this.greenBallGroup = this.createBallGroup(
      "greenBall",
      this.settings.numBalls,
      this.settings.ballSpeed);

    this.greenBallGroup.ballsToTheWalls();
    this.playerWrapper = this.createPlayerWrapper();

    //Ask prototype to enable tab/follow motion of player
    this.enableTapFollow(this.playerWrapper.playerBody);

    this.countownClock = this.createCountDownTimer(this.settings.totalTime);
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {
    console.log("BouncyBalls.reset()");

    this.firstUpdate = true;

    this.playerWrapper.revivePlayer();

    this.greenBallGroup.ballsToTheWalls();

//    this.playerWrapper.playerBody.events.onOutOfBounds.remove(this.spriteLeftWorld);

    //re-enable the tap/follow on the sprite
    this.enableTapFollow(this.playerWrapper.playerBody, this.settings.playerSpeedFactor);

    this.countownClock.reset(this.settings.totalTime);

    this.playerDead = false;
  };

  /**
   *
   */
  this.init = function(params) {
    console.log("Init called.  This is how I can pass state between ... states");
  };

  /**
   * Part of the "level" contract
   */
  this.displayFailState = function() {
    this.disableTapFollow();
    this.greenBallGroup.stopMoving();
    this.playerWrapper.killPlayer();
  };
  /**
   * Part of the "level" contract
   */
  this.displayVictoryState = function() {
    this.disableTapFollow();
    this.greenBallGroup.stopMoving();
    this.playerWrapper.pausePlayer();
  };

  /**
   *
   */
  this.updateImpl = function() {
    if(this.firstUpdate) {
      this.firstUpdate = false;
      this.countownClock.startTimming();
    }
    else {
      if(!this.playerDead && this.countownClock.update()) {
        this.levelCompleted();
        return;
      }

    }
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.greenBallGroup.group);
    this.game.physics.arcade.collide(this.playerWrapper.playerBody,
      this.greenBallGroup.group,
      null,//this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBallCollisionProcess,
      this);
    this.playerWrapper.update();
  };

  /**
   *
   */
  this.playerBallCollisionProcess = function(playerBody, ball) {
    console.log("Player/ball collision - process callback");
    if(this.playerDead) {
      return;
    }
    this.playerDead = true;
    this.levelFailed();

    return true;
  };
};

EG3.BouncyBalls.constructor = EG3.BouncyBalls;

EG3.BouncyBalls.prototype = new EG3.Level();


