var EG3 = EG3 || {};

EG3.GBBacon = function(args) {

  console.log("GBBacon function invoked");
  this.settings = args;

  this.firstUpdate = true;

  /**
   *
   */
  this.onetimeCreate = function() {
    console.log("GBBacon.onetimeCreate");

    //Add background
    this.game.add.sprite(0,0,"bg");

    this.greenBallGroup = this.createBallGroup(
      "greenBall",
      this.settings.numBalls,
      this.settings.ballSpeed);

    this.baconWrapper = this.createBaconWrapper(this.settings.baconSpeed);
    this.game.time.events.add(Phaser.Timer.SECOND*this.settings.baconDelay, this.showBacon, this);

    this.greenBallGroup.ballsToTheWalls();
    this.playerWrapper = this.createPlayerWrapper();

    //Ask prototype to enable tab/follow motion of player
    this.enableTapFollow(this.playerWrapper.playerBody);
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {


    this.firstUpdate = true;

    this.playerWrapper.revivePlayer();

    this.greenBallGroup.ballsToTheWalls();

    this.playerWrapper.playerBody.events.onOutOfBounds.remove(this.spriteLeftWorld);

    //re-enable the tap/follow on the sprite
    this.enableTapFollow(this.playerWrapper.playerBody, this.settings.playerSpeedFactor);

    this.game.time.events.add(Phaser.Timer.SECOND*this.settings.baconDelay, this.showBacon, this);

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
  this.updateImpl = function() {

    if(!this.playerDead && this.gotBacon) {//TODO - need logic for when bacon is eaten to stop balls and add flag
      console.log("Need a victory method and plan of action");
//      EG3.app.advanceLevel();
//      this.game.state.start('prelevel');
      return;
    }

    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.greenBallGroup.group);
    this.game.physics.arcade.collide(this.playerWrapper.playerBody,
      this.greenBallGroup.group,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBallCollisionProcess,
      this);
    this.game.physics.arcade.collide(this.baconWrapper.baconBody,
      this.playerWrapper.playerBody,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBaconCollisionProcess,
      this);
    this.playerWrapper.update();
  };

  /**
   * Callback when a dead sprite finally falls off the world
   */
  this.spriteLeftWorld = function() {
    console.log("Sprite left world");
  };


  this.playerBaconCollisionProcess = function() {
    this.baconWrapper.killBacon();
    this.greenBallGroup.stopMoving();
    this.playerWrapper.hidePlayer();
    this.gotBacon = true;
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

    //nuke tap following player
    this.disableTapFollow();
    this.playerWrapper.killPlayer();

    //Tell the player sprite to care
    //if it leaves the world (normally expensive
    //so I've read) then get a callback when it finally leaves
    this.playerWrapper.playerBody.checkWorldBounds = true;
    this.playerWrapper.playerBody.events.onOutOfBounds.add(this.spriteLeftWorld, this);

    this.levelFailed();

    this.baconWrapper.killBacon();

    return true;
  };


  this.shutDown = function() {
    console.log("Shutting down level1");
  };

  this.showBacon = function() {
    console.log("Show bacon");
    this.baconWrapper.showBacon(
      this.playerWrapper.playerBody.x,
      this.playerWrapper.playerBody.y,
      this.settings.baconFadeMillis);
  };
};

EG3.GBBacon.constructor = EG3.GBBacon;

EG3.GBBacon.prototype = new EG3.Level();


