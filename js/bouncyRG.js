var EG3 = EG3 || {};

EG3.BoundyRG = function() {

  console.log("BoundyRG function invoked");
  this.numBalls = 8;
  this.ballSpeed = 40;
  this.totalTime = 1000*20;
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
    console.log("BoundyRG.onetimeCreate");

    //Add background
    this.game.add.sprite(0,0,"bg");

    this.greenBallGroup = this.createBallGroup(
      "greenBall",
      this.numBalls,
      this.ballSpeed);

    this.greenBallGroup.ballsToTheWalls();
    this.playerWrapper = this.createPlayerWrapper();

    this.enableTapFollow(this.playerWrapper.playerBody);

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

    this.enableTapFollow(this.playerWrapper.playerBody);

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
        //change state
        //return
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

    this.disableTapFollow();

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
    console.log("Shutting down BoundyRG");
  };
};

EG3.BoundyRG.constructor = EG3.BoundyRG;

EG3.BoundyRG.prototype = new EG3.Level();


