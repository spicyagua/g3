var EG3 = EG3 || {};

EG3.GBBacon = function(args) {

  console.log("GBBacon constructor invoked");

  this.settings = args;

  /**
   *
   */
  this.onetimeCreate = function() {
    console.log("GBBacon.onetimeCreate");

    var s = this.settings;

    //Add background
    this.game.add.sprite(0,0,"bg");

    this.greenBallGroup = new this.RandomBallGroup(this.game, this.settings.greenBallGroupSettings);
    this.greenBallGroup.init();
    this.greenBallGroup.bttw();

    this.baconWrapper = this.createBaconWrapper(s.baconSpeed);
    this.game.time.events.add(Phaser.Timer.SECOND*s.baconDelay, this.showBacon, this);

    this.sprite = new this.BlobSprite(this.game, this.settings);
    this.sprite.init();

    //Ask prototype to enable tab/follow motion of player
    this.enableTapFollow(this.sprite);
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {

    this.sprite.resetPlayer();

    this.greenBallGroup.bttw();

    //re-enable the tap/follow on the sprite
    this.enableTapFollow(this.sprite);

    this.baconWrapper.killBacon();

    this.game.time.events.add(Phaser.Timer.SECOND*this.settings.baconDelay, this.showBacon, this);

    this.playerDead = false;
  };

  /**
   * Part of "level" contract
   */
  this.updateImpl = function() {

    if(!this.playerDead && this.gotBacon) {
      //Edge case I'm not sure will happen (perhaps once)
      return;
    }

    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.greenBallGroup);
    this.game.physics.arcade.collide(this.sprite,
      this.greenBallGroup,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBallCollisionProcess,
      this);
    this.game.physics.arcade.collide(this.baconWrapper.baconBody,
      this.sprite,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBaconCollisionProcess,
      this);
  };

  /**
   * Part of "level" contract
   */
  this.displayFailState = function() {
    this.baconWrapper.pauseBacon();
    this.greenBallGroup.stopBalls();
    this.sprite.killPlayer();
    this.disableTapFollow();

  };

  /**
   * Part of "level" contract
   */
  this.displayVictoryState = function() {
    this.baconWrapper.pauseBacon();
    this.greenBallGroup.stopBalls();
    this.sprite.stopPlayerMoving();
    this.disableTapFollow();
  };

  this.playerBaconCollisionProcess = function() {
    this.gotBacon = true;
    this.levelCompleted();
  };

  /**
   *
   */
  this.playerBallCollisionProcess = function(playerBody, ball) {
    console.log("Player/ball collision - process callback");

    if(this.playerDead) {
      //Edge case I saw once, but perhaps isn't needed anymore
      return true;
    }

    this.playerDead = true;
    this.levelFailed();
    return true;
  };

  this.showBacon = function() {
    console.log("Show bacon");
    this.baconWrapper.showBacon(
      this.sprite.x,
      this.sprite.y,
      this.settings.baconFadeMillis);
  };
};

EG3.GBBacon.constructor = EG3.GBBacon;

EG3.GBBacon.prototype = new EG3.Level();


