var EG3 = EG3 || {};


/**

 TODO: This is a copy of "space".  Need to be refactored

 */
EG3.SpaceRG = function(args) {

  console.log("SpaceRG constructor invoked");

  this.settings = args;

  /**
   *
   */
  this.onetimeCreate = function() {
    console.log("SpaceRG.onetimeCreate");

    var s = this.settings;

    //Add background
    this.tileSprite = this.game.add.tileSprite(0,0,this.game.world.width, this.game.world.height,"spaceBackground");
    this.tileSprite.autoScroll(0,s.skySpeed);
    this.sprite = new this.SlidingBlobSprite(this.game, this.settings);
    this.sprite.init();
    this.ballGroup = new this.FallingBallGroup(this.game, this.settings.greenBallGroupSettings);
    this.ballGroup.init();
    this.ballGroup.startBallsFalling();
    this.redBallGroup = new this.FallingBallGroup(this.game, this.settings.redBallGroupSettings);
    this.redBallGroup.init();
    this.redBallGroup.startBallsFalling();
    this.game.input.onTap.add(this.tapHandler);
    this.countownClock = this.createCountDownTimer(this.settings.totalTime);
    this.firstUpdate = true;
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {
    this.sprite.resetPlayer();
    this.ballGroup.resetBalls();
    this.ballGroup.startBallsFalling();
    this.redBallGroup.resetBalls();
    this.redBallGroup.startBallsFalling();
    this.game.input.onTap.add(this.tapHandler);
    this.tileSprite.autoScroll(0,this.settings.skySpeed);
    this.countownClock.reset(this.settings.totalTime);
    this.firstUpdate = true;
  };

  /**
   * Part of "level" contract
   */
  this.updateImpl = function() {

    //Clock tricks.  I decided to only start the clock after the
    //first update (so they won't see it "already running").
    if(this.firstUpdate) {
      this.firstUpdate = false;
      this.countownClock.startTimming();
    }
    else {
      if(this.countownClock.update()) {
        this.levelCompleted();
        return;
      }
    }

    if(this.game.physics.arcade.collide(this.sprite, this.ballGroup)) {
      console.log("Collide");
      this.levelFailed();
    }


    this.game.physics.arcade.collide(this.sprite,
      this.redBallGroup,
      null,
      this.redBlobCollision,
      this);
  };

  this.redBlobCollision = function(sprite, ball) {
    this.ballGroup.forEachAlive(function(b) {
      //This is a side-effect.  The "velocityFromAngle" assignes
      //the new velocity to the last argument ("b.body.velocity") which
      //is passed-by-reference.
      this.game.physics.arcade.velocityFromAngle(
        Phaser.Math.radToDeg(this.game.physics.arcade.angleBetween(this.sprite, b)),
        500,
        b.body.velocity)
    }, this);

    this.sprite.body.velocity.setTo(0,0);

    ball.kill();
    return false;
  };

  /**
   * Part of "level" contract
   */
  this.displayFailState = function() {
    this.endRound();
    this.sprite.killPlayer();
  };

  /**
   * Part of "level" contract
   */
  this.displayVictoryState = function() {
    this.endRound();
  };

  /**
   * Factored out of fail/victory
   */
  this.endRound = function() {
    this.ballGroup.stopBalls();
    this.redBallGroup.stopBalls();
    this.game.input.onTap.remove(this.tapHandler);
    this.tileSprite.stopScroll();
  };

  /**
   * Callback when user clicks on screen.  "this" will always
   * be set in the intuitive manner.
   */
  this.displayTapped = function() {
    //From the debugger (!?!) I know that arguments[0] is a point where
    //the tap happened.
    var args = arguments;
    this.sprite.slideToX(arguments[0].x);
  };


  //Wrap this at end of constructor once functions have been created
  this.tapHandler = this.displayTapped.bind(this);


};

EG3.SpaceRG.constructor = EG3.SpaceRG;

EG3.SpaceRG.prototype = new EG3.Level();


