var EG3 = EG3 || {};

EG3.BouncyRG = function(args) {

  console.log("BouncyRG constructor invoked");

  this.settings = args;

  /**
   *
   */
  this.onetimeCreate = function() {
    console.log("BouncyRG.onetimeCreate");

    var s = this.settings;

    //Add background
    this.game.add.sprite(0,0,"bg");

    this.greenBallGroup = this.createBallGroup(
      "greenBall",
      s.numGreenBalls,
      s.greenBallSpeed);

    this.redBallGroup = this.createBallGroup(
      "redBall",
      s.numRedBalls,
      s.redBallSpeed);
    this.redBallGroup.distributeRandom();
    this.redBallGroup.hideAll();

    this.game.time.events.add(Phaser.Timer.SECOND*2/*TODO Hardcoded*/, this.showRed, this);

    this.greenBallGroup.ballsToTheWalls();
    this.playerWrapper = this.createPlayerWrapper();
    this.enableTapFollow(this.playerWrapper.playerBody);
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {

    this.playerWrapper.revivePlayer();

    this.greenBallGroup.ballsToTheWalls();
    this.redBallGroup.distributeRandom();
    this.redBallGroup.hideAll();
    this.game.time.events.add(Phaser.Timer.SECOND*2/*TODO Hardcoded*/, this.showRed, this);

    //re-enable the tap/follow on the sprite
    this.enableTapFollow(this.playerWrapper.playerBody, this.settings.playerSpeedFactor);

    this.playerDead = false;
  };

  /**
   * Part of "level" contract
   */
  this.updateImpl = function() {
/*
    if(!this.playerDead && this.gotBacon) {
      //Edge case I'm not sure will happen (perhaps once)
      return;
    }
*/
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.greenBallGroup.group);
    this.game.physics.arcade.collide(this.redBallGroup.group);
    this.game.physics.arcade.collide(this.greenBallGroup.group,this.redBallGroup.group);

    this.game.physics.arcade.collide(this.playerWrapper.playerBody,
      this.greenBallGroup.group,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBallCollisionProcess,
      this);
    this.playerWrapper.update();

    this.game.physics.arcade.collide(this.playerWrapper.playerBody,
      this.redBallGroup.group);/*,
      this.uselessFunction,
      this.playerRedBallCollision,
      this);*/
    this.playerWrapper.update();
  };

  /**
   * Part of "level" contract
   */
  this.displayFailState = function() {
    this.greenBallGroup.stopMoving();
    this.redBallGroup.stopMoving();
    this.playerWrapper.killPlayer();
    this.disableTapFollow();

  };

  /**
   * Part of "level" contract
   */
  this.displayVictoryState = function() {
    this.greenBallGroup.stopMoving();
    this.redBallGroup.stopMoving();
    this.playerWrapper.pausePlayer();
    this.disableTapFollow();
  };

  this.playerRedBallCollision = function(player, ball) {
    console.log(ball);
    return true;
    console.log("Living in green group (1): " + this.greenBallGroup.group.countLiving());
    var gb = this.greenBallGroup.group.getFirstAlive();
    if(gb == null) {
      //Woops - edge case bug
      console.error("Red ball collision but no green balls left");
      return false;
    }
    gb.kill();
console.log("Living in green group (2): " + this.greenBallGroup.group.countLiving());
    if(this.greenBallGroup.group.countLiving() == 0) {
      this.levelCompleted();
      return true;
    }
    return true;
  }

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

  this.showRed = function() {
    console.log("Show red balls");
    this.redBallGroup.fadeIn(this.settings.redFadeInMillis);
  };
};

EG3.BouncyRG.constructor = EG3.BouncyRG;

EG3.BouncyRG.prototype = new EG3.Level();


