var EG3 = EG3 || {};


/**

 I'm giving up on a lot of the Phaser features, as I keep having to manually
 do things like colissions, decelleration, etc.

 */
EG3.Space = function(args) {

  console.log("Space constructor invoked");

  this.settings = args;

  /**
   *
   */
  this.onetimeCreate = function() {
    console.log("Space.onetimeCreate");

    var s = this.settings;

    //Add background
    this.tileSprite = this.game.add.tileSprite(0,0,this.game.world.width, this.game.world.height,"spaceBackground");
    this.tileSprite.autoScroll(0,s.skySpeed);
    this.sprite = new this.BlobSprite(this.game, this.settings);
    this.ballGroup = new this.FallingBallGroup(this.game, this.settings.greenBallGroupSettings);
    this.ballGroup.init();
    this.ballGroup.startBallsFalling();
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


  //=============================================================
  //  Extended Types
  //=============================================================




  //===== BEGIN Blob Sprite =====

  /**
   * Constructor
   */
  this.BlobSprite = function(game, settings) {
    //Call Sprite's constructor
    Phaser.Sprite.call(this, game, 0, 0, "playerBody");

    this.settings = settings;

    //Hack because I can't seem to find a good way to move
    //and tweens seem to mess-up colissions
    this.moving = false;
    this.movingTo = {};

    this.playerGroup = this.game.add.group();
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.game.add.existing(this);

    this.x = Math.round((this.game.world.width/2) + (this.width/2));
    this.y = this.game.world.height - this.height - (Math.round(this.height/2));

    this.deadPlayerEye = this.game.add.sprite(-100, -100, 'deadEye');
    this.deadPlayerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(this.deadPlayerEye, Phaser.Physics.ARCADE);

    this.openPlayerEye = this.game.add.sprite(0, 0, 'playerEye');
    this.openPlayerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(this.openPlayerEye, Phaser.Physics.ARCADE);
    this.currentPlayerEye = this.openPlayerEye;

    this.playerGroup.add(this);
    this.playerGroup.add(this.openPlayerEye);
    this.playerGroup.add(this.deadPlayerEye);
    this.playerGroup.bringToTop(this.openPlayerEye);


  };

  this.BlobSprite.prototype = Object.create(Phaser.Sprite.prototype);
  this.BlobSprite.prototype.constructor = this.BlobSprite;

  /**
   * Note that update is automagically called by Phaser
   */
  this.BlobSprite.prototype.update = function() {
    //Position the *body* this may be ahead (coordinate-wise) from the
    //display of the sprite
    this.currentPlayerEye.body.x = this.body.x;
    this.currentPlayerEye.body.y = this.body.y;

    this.currentPlayerEye.rotation = (Math.PI*1.5) + this.game.physics.arcade.angleToPointer(this.currentPlayerEye);

    if(this.moving) {
      if(
        (this.x >= this.movingTo.x && this.movingTo.fwd) ||
        (this.x <= this.movingTo.x && (!this.movingTo.fwd)) ||
        (this.body.x <= 0 && (!this.movingTo.fwd)) ||
        (((this.body.x + this.width) >= this.game.world.width) && this.movingTo.fwd)
        ) {
        this.moving = false;
        this._stopPlayer();
      }
    }
  };

  /**
   * Slide the blob along a fixed line
   */
  this.BlobSprite.prototype.slideToX = function(x) {
    if(this.moving) {
      this._stopPlayer();
      this.movingTo = null;
    }
    this.movingTo = {x: x, y: this.y, fwd: (x>this.x?true:false)};
    this.game.physics.arcade.accelerateToXY(this, x, this.y, this.settings.playerSpeed);
    this.moving = true;

  };

  /**
   * Private function to stop the damm thing from moving
   */
  this.BlobSprite.prototype._stopPlayer = function() {
    this.body.acceleration.x =
    this.body.acceleration.y =
    this.body.velocity.x =
    this.body.velocity.y = 0;
  };

  /**
   * Puts the display into mode where the player has the dead-eye
   */
  this.BlobSprite.prototype.killPlayer = function() {
    this._stopPlayer();
    this.currentPlayerEye.kill();
    this.currentPlayerEye = this.deadPlayerEye;

    this.currentPlayerEye.body.x = this.body.x;
    this.currentPlayerEye.body.y = this.body.y;
    this.playerGroup.bringToTop(this.currentPlayerEye);
  };

  /**
   * Reset the player back to as-created form
   */
  this.BlobSprite.prototype.resetPlayer = function() {
    this.x = Math.round((this.game.world.width/2) + (this.width/2));
    this.y = this.game.world.height - this.height - (Math.round(this.height/2));

    this.deadPlayerEye.x = -100;
    this.deadPlayerEye.y = -100;

    this.openPlayerEye.revive();
    this.currentPlayerEye = this.openPlayerEye;;

    this.moving = false;
    this.update();
  };


  //===== ENDOF Blob Sprite =====

  //Wrap this at end of constructor once functions have been created
  this.tapHandler = this.displayTapped.bind(this);


};

EG3.Space.constructor = EG3.Space;

EG3.Space.prototype = new EG3.Level();


