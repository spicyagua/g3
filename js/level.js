var EG3 = EG3 || {};


/**
 * Object to serve as prototype of other levels (i.e. common stuff).  Children should
 * not have a "create" method and instead use "oneTimeCreate" and "reset".  They should
 * not have an "update" but rather an "updateImpl".  Other manditory functions:
 *
 * displayFailState - after the level decides the player has failed, the prototype (this)
 * will offer a retry button.  The level may choose what background state (i.e. stop the balls,
 * have the sprite fall, etc) if shown behind the retry button
 *
 * displayVictoryState - like "displayFailState", this lets the level decide what is going on
 * "behind" the "leve level" button
 */
EG3.Level = function() {
  console.log("Level constructor invoked");
  this.skipNextUpdate = false;
}

EG3.Level.prototype = {

  //====================== lifecycle ===========================

  /**
   * Called by Phaser.  In turn calls either "reset" to prepare for the
   * next attempt at the level or "oneTimeCreate" initially
   *
   */
  create: function() {
    console.log("Level.create");

    //For child levels
    if(!this.createdOnce) {
      this.onetimeCreate();
      this.createdOnce = true;

      this.againButtonGroup = this.game.add.group();
      this.againButton = this.game.add.button(this.game.width/2, this.game.height/2, 'blankButton', this.againClicked, this);
      this.againButtonGroup.add(this.againButton);
      this.againButton.anchor.setTo(0.5,0.5);
      //Total hack - I need to find a way to better associate the button and text
      this.againText = EG3.app.textToButton(this.againButton, "Try Again?");
      this.againText.visible = false;
      this.againButtonGroup.visible = false;

      this.nextLevelButtonGroup = this.game.add.group();
      this.nextLevelButton = this.game.add.button(this.game.width/2, (this.game.height/4)*3, 'blankButton', this.nextLevelClicked, this);
      this.nextLevelButtonGroup.add(this.nextLevelButton);
      this.nextLevelButton.anchor.setTo(0.5,0.5);
      this.nextLevelText = EG3.app.textToButton(this.nextLevelButton, "Next Level");
      this.nextLevelButtonGroup.visible = false;
      this.nextLevelText.visible = false;

    }
    else {
      if(this.playerFollowsTap) {
        //re-add tap handler
        this.game.input.onTap.add(this.tapFollowHandler, this);
      }
      this.reset();
    }
  },


  update: function() {

    //This little bit of hackery has to do with timing.  If we reset but
    //don't skip the next "update" the previous state is still there (so we
    //get a phantom collision).
    if(this.skipNextUpdate) {
      this.skipNextUpdate = false;
      return;
    }

    if(!this.done) {
      this.updateImpl();
    }
  },

  /**
   * Called when a level is completed by the user.  Does some animation then
   * offers the "next level" button
   */
  levelCompleted: function() {
    console.log("Level completed");
    this.hackCount = 2;
    this.done = true;
    this.displayVictoryState();
    this.congratsText = this.game.make.text(
      ((this.game.width-340)/2) +10,//TODO - computation no lnoger needed
      -100,//this.game.height/4,
      EG3.app.getCurrentLevelVictoryMsg(),
      {
        "font": "72px Comic Sans MS",
        "fill": "#d2f0cb",
        "stroke": "#0d1f09",
        "wordWrap": true,
        "wordWrapWidth": 340-20,
        "align": "center"
      }
      );

//    this.congratsText.align = "center";
    var ctWidth = this.congratsText.width;
    this.congratsText.x = (this.game.width/2)-(ctWidth/2);



//    this.congratsText.update();
    this.game.world.add(this.congratsText);
    //TODO: Display the victory message
    var tween = this.game.add.tween(this.congratsText).to({y: this.game.height/4},2000, Phaser.Easing.Bounce.Out, true);


    tween.onComplete.add(function() {
      this.nextLevelButtonGroup.visible = true;
      this.nextLevelText.visible = true;
    }.bind(this));

  },

  /**
   * Called by children when the level fails.  Game is paused (no "update") until
   * user hits "again" button which in turn calls "reset" and the
   * game resumes.
   */
  levelFailed: function() {
    console.log("Level failed");
    this.hackCount = 2;
    this.done = true;

    navigator.vibrate = navigator.vibrate ||
                navigator.webkitVibrate ||
                navigator.mozVibrate ||
                navigator.msVibrate;
    if (navigator.vibrate) {
        console.log("About to vibrate phone");
        navigator.vibrate([3000]);
        console.log("Done vibrating (maybe)");
    }
    else {
      console.log("Vibrate not enabled");
    }

    this.displayFailState();
    console.log("Show again button");
    this.againButtonGroup.visible = true;
    this.againText.visible = true;
  },

  /**
   * Callback when "again" is clicked
   */
  againClicked: function() {
    //Hide the "again" button
    this.skipNextUpdate = true;
    console.log("Hide again button");
    this.againButtonGroup.visible = false;
    this.againText.visible = false;
    this.reset();
    this.done = false;

  },

  nextLevelClicked: function() {
    this.skipNextUpdate = true;
    EG3.app.advanceLevel();
    this.game.state.start('prelevel');
  },

  /**
   * Not used, but an example of cookie plugin once I need it
   */
  newHighScore: function(diff) {
    jQuery.cookie('high_score', diff, { expires: 28} );
    this.highScoreDisplay.text = this.timeToDisplayTime(diff);
  },

  //====================== Optional behaviors ===========================


  enableTapFollow: function(bodyToMove) {
    this.playerFollowsTap = true;
    this.bodyToFollow = bodyToMove;
    //Tap handler to move the player
    this.game.input.onTap.add(this.tapFollowHandler, this);

    //This is just so I don't have to have a bunch of
    //null checks later.  The tween isn't used for anything
    this.moveTween = this.game.add.tween(bodyToMove);
  },

  disableTapFollow: function() {
    //Kill some working-game things
    this.moveTween.stop();
    this.game.input.onTap.remove(this.tapFollowHandler, this);
  },

    /**
   * Callback when user taps on screen to move sprite
   */
  tapFollowHandler: function() {
    this.bodyToFollow.tweenToXY(this.game.input.activePointer.x, this.game.input.activePointer.y);
  },

  //====================== Composite factories ===========================



  createBaconWrapper: function(speed) {
    var that = this;

    var img = this.game.cache.getImage("bacon");
    var _imgWidth = img.width;
    var _imgHeight = img.height;
    img = null;


    var baconBody = this.game.add.sprite(-100,-100, 'bacon');
    this.game.physics.enable(baconBody, Phaser.Physics.ARCADE);
    baconBody.anchor.setTo(0.5, 0.5);
    baconBody.body.collideWorldBounds = true;
    baconBody.body.bounce.setTo(1, 1);
    baconBody.body.velocity.setTo(10 + Math.random() * speed, 10 + Math.random() * speed);
    baconBody.kill();


    var _reviveBacon = function() {
      baconBody.revive();
      baconBody.x = -100;
      baconBody.y = -100;
      baconBody.angle = 90;
    };

    var _killBacon = function() {
      baconBody.kill();
      if(this.eatTween) {
        this.eatTween.stop();
      }
    };

    var _eatBacon = function(eaterSprite) {//TODO Hardcode eating time
      console.log("Eat bacon!");
//      that.add.tween(this.baconBody.scale).to({x:0.1, y:0.1},3000, Phaser.Easing.Linear.NONE, true);
      that.add.tween(baconBody.angle).to(180,2000, Phaser.Easing.Linear.NONE, true);
    };

    /**
     * Automagically tried to be away from point given
     */
    var _showBacon = function(x, y, fadeInMillis) {
      baconBody.revive();
      upperHalf = y<(that.game.world.height/2);
      leftHalf = x<(that.game.world.width/2);
      baconBody.body.velocity.setTo(10 + Math.random() * speed, 10 + Math.random() * speed);

      baconBody.x = leftHalf?that.game.world.width-_imgWidth:_imgWidth;
      baconBody.y = upperHalf?that.game.world.width-_imgHeight:_imgHeight;
      baconBody.alpha = 0;

      this.eatTween = that.game.add.tween(baconBody).to({alpha:1}, fadeInMillis, Phaser.Easing.Linear.NONE, true);

    };

    var _pauseBacon = function() {
//      baconBody.body.gravity.y = 0;
      baconBody.body.velocity.x = 0;
      baconBody.body.velocity.y = 0;
  }


    return {
      baconBody: baconBody,
      reviveBacon: _reviveBacon,
      killBacon: _killBacon,
      showBacon: _showBacon,
      eatBacon: _eatBacon,
      stillEating: function() {
        return this.eatTween.isRunning;
      },
      pauseBacon: _pauseBacon
    };
  },


  /**
   * Still haven't found a good way to
   * use phaser and OO instincts, but this is a start
   */
  createPlayerWrapper: function() {

    var that = this;
    var alive = true;

    var playerGroup = this.game.add.group();
    var playerBody = this.game.add.sprite(
      (this.game.world.width/2) - 25,
      (this.game.world.height/2) - 20, 'playerBody');
    playerBody.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(playerBody, Phaser.Physics.ARCADE);


    //Added so RG works, but may have effects in other levels.
    playerBody.body.bounce.setTo(0,0);
    playerBody.immovable = true;

    var deadPlayerEye = this.game.add.sprite(-100, -100, 'deadEye');
    deadPlayerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(deadPlayerEye, Phaser.Physics.ARCADE);

    var openPlayerEye = this.game.add.sprite(0, 0, 'playerEye');
    openPlayerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(openPlayerEye, Phaser.Physics.ARCADE);
    var currentPlayerEye = openPlayerEye;

    currentPlayerEye.x = playerBody.x;
    currentPlayerEye.y = playerBody.y;
    currentPlayerEye.rotation = this.game.physics.arcade.angleToPointer(currentPlayerEye);

    playerGroup.add(playerBody);
    playerGroup.add(openPlayerEye);
    playerGroup.add(deadPlayerEye);

    var _revivePlayer = function() {

      playerBody.checkWorldBounds = false;
      playerBody.body.gravity.y = 0;
      playerBody.body.velocity.x = 0;
      playerBody.body.velocity.y = 0;

      //Reset location of eye(s) and body
      playerBody.x = (that.game.world.width/2) - 25;
      playerBody.y = (that.game.world.height/2) - 20;
      deadPlayerEye.x = -100;
      deadPlayerEye.y = -100;

      openPlayerEye.revive();

      currentPlayerEye = openPlayerEye;;

      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
      currentPlayerEye.rotation = that.game.physics.arcade.angleToPointer(currentPlayerEye);

      alive = true;
    };

    var _pausePlayer = function() {
      playerBody.body.gravity.y = 0;
      playerBody.body.velocity.x = 0;
      playerBody.body.velocity.y = 0;
      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
    };

    var _killPlayer = function() {
      console.log("_killPlayer");
      //Replace the eye with the 'X'
      currentPlayerEye.kill();
      currentPlayerEye = deadPlayerEye;

      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
//      playerBody.body.gravity.y = 300; Re-add for that cool "falling" effect
      playerBody.body.gravity.y = 0;
      playerBody.body.velocity.x = 0;
      playerBody.body.velocity.y = 0;

      playerGroup.bringToTop(currentPlayerEye);

      alive = false;
    };

    var _hidePlayer = function() {
      playerBody.kill();
      openPlayerEye.kill();
    };

    var _update = function() {
      //TODO there is some bug where the physics body is already updated, and the eye looks funny
      //falling.  Not really noticable on regular play, but something to be worked out.
      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
      if(alive) {
        currentPlayerEye.rotation = (Math.PI*1.5) + that.game.physics.arcade.angleToPointer(currentPlayerEye);
    }
    };

    return {
      playerBody: playerBody,
      revivePlayer: _revivePlayer,
      killPlayer: _killPlayer,
      update: _update,
      hidePlayer: _hidePlayer,
      pausePlayer: _pausePlayer
    };
  },



  /**
   * New idea in "reuse"
   * Gets passed the total time (in millis)
   * For now assumes "seconds"
   *
   * A mix of display and logic, but who cares
   */
  createCountDownTimer: function(duration) {

    var that = this;
    var startTime = 0;
    var endTime = 0;
    var timeHack = 0;//Little hack so the clock doesn't update so much

    var clockDisplay = this.game.add.text(
      20,
      20,
      that.timeToDisplayTime(duration),
      {
        "font": "36px monospace",
        "color": "white",
        "fill": "#ff0044"
      }
      );
    return {
      startTimming: function() {
        startTime = that.game.time.now;
        endTime = startTime + duration;
      },
      update: function() {
        if(timeHack++ < 5) {
          return;
        }
        timeHack = 0;
        var now = that.game.time.now;
        if(now >= endTime) {
          clockDisplay.text = "00.00";
          return true;
        }
        var diff = endTime-now;
        clockDisplay.text = that.timeToDisplayTime(diff);
      },
      reset: function(duration) {
        clockDisplay.text = that.timeToDisplayTime(duration);
      }
    };
  },

  //====================== Utilities ===========================

  /**
   * Maybe it is my lack-of JS knowledge, but I needed a function
   * as a placeholder to apply a second optional function for collision
   * callbacks.  Seems someone put things in the wrong order.
   *
   * This is a no-op
   */
  uselessFunction: function() {
  },

  /**
   * Takes time in millis and converts it to
   * "00.00" format
   */
  timeToDisplayTime: function(t) {

    if(t == 0) {
      return "00.00";
    }
    var seconds = Math.floor(t/1000);
    var decis = Math.floor((t % 1000)/10);
//    console.log(t + " sec: " + seconds + ", dec: " + decis);
    if(decis < 10) {decis = '0' + decis;}
    if(seconds < 10) {seconds = '0' + seconds;}
    return seconds + "." + decis;
  },
};


//=============================================================
//  Extended Types
//=============================================================

//Save some typing
ELP = EG3.Level.prototype;

// ===== BEGIN Ball Group =====

/**
 * Constructor for base ball group.  Reads several settings to configure the group
 *
 * Settings:
 * ballVelocity
 * imageName
 * ballVelocityRandomness
 */
ELP.BallGroup = function(game, settings) {

  //Call Group's constructor
  Phaser.Group.call(this, game);

  console.log("BallGroup constructor");

  //Add to game
  this.game.add.existing(this);

  this.settings = settings;

  //Cache the image dimensions.  We'll use them a lot later
  var img = this.game.cache.getImage(this.settings.imageName);
  this.ballDiameter = img.width;
  img = null;


};
ELP.BallGroup.prototype = Object.create(Phaser.Group.prototype);
ELP.BallGroup.prototype.constructor = ELP.BallGroup;

ELP.BallGroup.prototype.init = function() {
  console.log("BallGroup.init");
  var expectedBalls = this.getTotalGroupBallCount();

  console.log("BallGroup.  Expected balls: " + expectedBalls);

  //Convienence so all balls will have physics enabled
  this.physicsBodyType = Phaser.Physics.ARCADE;
  this.enableBody = true;

  for(var i = 0; i<expectedBalls; i++) {
    var s = this.create(-100,-100, this.settings.imageName);
    this.initializeBall(s);
  }
};

/**
 * Returns the total number of balls to create for the group.  This is called
 * during "init".  This function may be replaced.  For now, it looks for
 * a setting "numBalls"
 */
ELP.BallGroup.prototype.getTotalGroupBallCount = function() {
  console.log("BallGroup.getTotalGroupBallCount");
  return this.settings.numBalls;
};

/**
 * Set any properties on a ball being created for the group.  May
 * be reassigned by child types.
 */
ELP.BallGroup.prototype.initializeBall = function(ball) {
  console.log("BallGroup.initializeBall");
  //  s.name = "greenBall" + i; TODO: have some base name in the settings,
  //and use the count from the group to assign a unique name
  ball.checkWorldBounds = true;
  ball.outOfBoundsKill = true;
  ball.kill();
  ball.body.velocity.setTo(0,0);
};


/**
 * Stop dispensing balls
 */
ELP.BallGroup.prototype.stopBalls = function() {
  console.log("BallGroup.stopBalls");
  this.forEach(function(ball) {
    ball.body.velocity.setTo(0,0);
  }, this);
};

/**
 * Go back to as-created state (before first "startBalls" call).
 */
ELP.BallGroup.prototype.resetBalls = function() {
  console.log("BallGroup.resetBalls");
  this.forEach(function(ball) {
    ball.kill();
    ball.reset(-1*this.ballDiameter*2, -1*this.ballDiameter*2);
  }, this);
};
// ===== ENDOF Ball Group =====

// ===== BEGIN Random Ball Group =====

/**
 * Group of balls that randomly bounce around the world boundaries,
 * bouncing off the walls.
 */
ELP.RandomBallGroup = function(game, settings) {
  //Call Group's constructor
  ELP.BallGroup.call(this, game, settings);

  console.log("RandomBallGroup constructor");
};

ELP.RandomBallGroup.prototype = Object.create(ELP.BallGroup.prototype);
ELP.RandomBallGroup.prototype.constructor = ELP.RandomBallGroup;

ELP.RandomBallGroup.prototype.initializeBall = function(ball) {
  console.log("RandomBallGroup.initializeBall");
  ball.checkWorldBounds = true;
  ball.body.collideWorldBounds = true;
  ball.body.bounce.setTo(1, 1);
  //TODO: Change this to use the randomness setting
  ball.body.velocity.setTo(
    10 + Math.random() * this.settings.ballVelocity,
    10 + Math.random() * this.settings.ballVelocity);
};

/**
 * Balls to the walls
 */
ELP.RandomBallGroup.prototype.bttw = function(ball) {
  console.log("RandomBallGroup.bttw");
  //Try to distribute the balls along the walls so as to not
  //begin the game in collision with each other or
  //the player sprite
  var numBalls = this.getTotalGroupBallCount();
  var ySpace = (this.game.world.height-(this.ballDiameter*2))/((numBalls-2)/2);
  var childCount = 0;

  this.forEach(function(b) {
    var leftSide = true;
    if(childCount*2 >= numBalls) {
      leftSide = false;
    }
    var startx = (leftSide?this.ballDiameter:(this.game.world.width - this.ballDiameter));
    var starty = (leftSide?
      (childCount*ySpace):
      ((childCount - ((numBalls)/2))*ySpace)
      )+this.ballDiameter;
    b.reset(startx, starty);
    this.initializeBall(b);
    childCount++;
  }, this);
};




// ===== ENDOF Random Ball Group =====



// ===== BEGIN Falling Ball Group =====

/**
 * Settings (in addition to "Ball Group")
 * - ballFrequency
 */
ELP.FallingBallGroup = function(game, settings) {
  //Call Group's constructor
  ELP.BallGroup.call(this, game, settings);

  //For the timer
  this.newBallTimer = {};//I know I don't need to "declare" this...

  console.log("FallingBallGroup constructor");
};

ELP.FallingBallGroup.prototype = Object.create(ELP.BallGroup.prototype);
ELP.FallingBallGroup.prototype.constructor = ELP.FallingBallGroup;

ELP.FallingBallGroup.prototype.stopBalls = function() {
  console.log("FallingBallGroup.stopBalls");
  ELP.BallGroup.prototype.stopBalls.call(this);
  this.game.time.events.remove(this.newBallTimer);
};

/**
 * Override parent to approximate the size of ball group
 */
ELP.FallingBallGroup.prototype.getTotalGroupBallCount = function() {
  console.log("FallingBallGroup.getTotalGroupBallCount");
  //Figure out how big to make the ball group (approx)
  var worldHeight = this.game.world.height;
  var expectedTravelTime = Math.ceil(worldHeight/this.settings.ballVelocity);
  return (2*(Math.ceil(expectedTravelTime * this.settings.ballFrequency)));
};

/**
 * Private.  Adds a ball to the game world
 */
ELP.FallingBallGroup.prototype.emittBall = function() {
  console.log("FallingBallGroup Emitting ball");
  var ball = this.getFirstDead();
  ball.reset(Math.round(Math.random() * this.game.world.width), (-1*ball.height));
  var yVel = (this.settings.ballVelocity + (this.settings.ballVelocity * (Math.random() * this.settings.ballVelocityRandomness)));
  ball.body.velocity.setTo(0, yVel);


};
/**
 * Start dispensing balls
 */
ELP.FallingBallGroup.prototype.startBallsFalling = function() {
  this.newBallTimer = this.game.time.events.loop(
    Math.round(Phaser.Timer.SECOND/this.settings.ballFrequency),
    this.emittBall,
    this);
};

//===== ENDOF Falling Ball Group =====


//===== BEGIN Blob Sprite =====

/**
 * Constructor
 */
ELP.BlobSprite = function(game, settings) {
  //Call Sprite's constructor
  Phaser.Sprite.call(this, game, 0, 0, "playerBody");

  this.settings = settings;
  console.log("BlobSprite.constructor");

};

ELP.BlobSprite.prototype = Object.create(Phaser.Sprite.prototype);
ELP.BlobSprite.prototype.constructor = ELP.BlobSprite;

/**
 * Sourogate constructor.  I think I had call ordering issues
 * before so I'm using a Java trick.  Perhaps not required?
 */
ELP.BlobSprite.prototype.init = function() {
  console.log("BlobSprite.init()");
  this.playerGroup = this.game.add.group();
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.game.add.existing(this);

  var startingPoint = this.getStartingPoint();
  this.x = startingPoint.x;
  this.y = startingPoint.y;

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

/**
 * Get the position for the sprite to start at game start
 * and after reset.  May be overidden.
 *
 * Default is center x/y
 */
ELP.BlobSprite.prototype.getStartingPoint = function() {
  console.log("BlobSprite.getStartingPoint()");
  return {
    x: (this.game.world.width/2) - (this.width/2),
    y: (this.game.world.height/2) - (this.height/2)
  };
};

/**
 * Note that update is automagically called by Phaser
 */
ELP.BlobSprite.prototype.update = function() {
  //Position the *body* this may be ahead (coordinate-wise) from the
  //display of the sprite
  this.currentPlayerEye.body.x = this.body.x;
  this.currentPlayerEye.body.y = this.body.y;

  this.currentPlayerEye.rotation = (Math.PI*1.5) + this.game.physics.arcade.angleToPointer(this.currentPlayerEye);
};


//Defensive programming around common names
if(ELP.BlobSprite.prototype.tweenToXY) {throw "tweenToXY already defined.  Name conflict with new Phaser";}

/**
 * Move to the given XY coordinate (then stop).
 */
ELP.BlobSprite.prototype.tweenToXY = function(x, y) {
  console.log("BlobSprite.tweenToXY.  Moving to point: " + x + ", " + y);
  if(this.moveTween && this.moveTween.isRunning) {
    console.log("Tween running.  Stop it");
    this.moveTween.stop();
  }
  else {
    console.log("Tween not running.");
  }

  //Create the tween
  this.moveTween = this.game.add.tween(this);

  //so the player moves at a constant *speed*, the tween should have
  //a duration proportional to the distance it will travel
  var duration = this.settings.playerSpeedFactor *
    Math.floor(this.game.physics.arcade.distanceToXY(this, x, y));

  this.moveTween.to(
    {
      x: x,
      y: y
    },
    duration,
    Phaser.Easing.Quadratic.In
  );
  console.log("Calling start on tween");
  this.moveTween.start();

};

/**
 * Stop the damm thing from moving
 */
ELP.BlobSprite.prototype.stopPlayerMoving = function() {
  console.log("BlobSprite.stopPlayerMoving");
  if(this.moveTween && this.moveTween.isRunning) {
    this.moveTween.stop();
  }
  this.body.acceleration.x =
  this.body.acceleration.y =
  this.body.velocity.x =
  this.body.velocity.y = 0;
};

/**
 * Puts the display into mode where the player has the dead-eye
 */
ELP.BlobSprite.prototype.killPlayer = function() {
  console.log("BlobSprite.killPlayer");
  this.stopPlayerMoving();
  this.currentPlayerEye.kill();
  this.currentPlayerEye = this.deadPlayerEye;

  this.currentPlayerEye.body.x = this.body.x;
  this.currentPlayerEye.body.y = this.body.y;
  this.playerGroup.bringToTop(this.currentPlayerEye);
};

/**
 * Reset the player back to as-created form
 */
ELP.BlobSprite.prototype.resetPlayer = function() {
  console.log("BlobSprite.resetPlayer");
  this.stopPlayerMoving();

  var startingPoint = this.getStartingPoint();
  this.x = startingPoint.x
  this.y = startingPoint.y

  this.deadPlayerEye.x = -100;
  this.deadPlayerEye.y = -100;

  this.openPlayerEye.revive();
  this.currentPlayerEye = this.openPlayerEye;;

  this.moving = false;
  this.update();
};


//===== ENDOF Blob Sprite =====

//===== BEGIN SlidingBlob Sprite =====

ELP.SlidingBlobSprite = function(game, settings) {
  //Call Group's constructor
  ELP.BlobSprite.call(this, game, settings);

  console.log("SlidingBlobSprite constructor");
};

ELP.SlidingBlobSprite.prototype = Object.create(ELP.BlobSprite.prototype);
ELP.SlidingBlobSprite.prototype.constructor = ELP.SlidingBlobSprite;

ELP.SlidingBlobSprite.prototype.getStartingPoint = function() {
  console.log("SlidingBlobSprite.getStartingPoint");
  return {
    x: Math.round((this.game.world.width/2) + (this.width/2)),
    y: this.game.world.height - this.height - (Math.round(this.height/2))
  };
};
//Defensive programming around common names
if(ELP.SlidingBlobSprite.prototype.slideToX) {throw "slidetoXY already defined.  Name conflict with new Phaser";}
/**
 * Slide the blob along a fixed line
 */
ELP.SlidingBlobSprite.prototype.slideToX = function(x) {
  console.log("SlidingBlobSprite.slideToX");
  this.tweenToXY(x, this.y);

};



//===== ENDOF SlidingBlob Sprite =====



//===== BEGIN XYBlob Sprite =====
/*
ELP.XYBlob = function(game, settings) {
  //Call Group's constructor
  ELP.BlobSprite.call(this, game, settings);

  console.log("XYBlob constructor");
};

ELP.XYBlob.prototype = Object.create(ELP.BlobSprite.prototype);
ELP.XYBlob.prototype.constructor = ELP.XYBlob;
*/
//===== ENDOF XYBlob Sprite =====


