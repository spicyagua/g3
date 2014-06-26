var EG3 = EG3 || {};


EG3.Level = function() {
  console.log("Level constructor invoked");
  //Data members here
  this.numBalls = 6;
  this.timeHack = 0;
  this.playerSpeedFactor = 5;//bigger means slower
  this.ballSpeed = 50;

  // Spent too long as a Java programmer...
  //this.createdOnce = false;
}

EG3.Level.prototype = {


  /**
   *
   */
  create: function() {
    console.log("Level1.create");

    if(!this.createdOnce) {
      this.onetimeCreate();
    }
    else {
      this.xreset();
    }
  },

  /**
   * Callback when "again" is clicked
   */
  againClicked: function() {
    this.xreset();
  },

  /**
   *
   */
  playerBallCollisionProcess: function(playerBody, ball) {
    console.log("Player/ball collision - process callback");

    if(this.playerDead) {
      //It is cute to still have the player bounce off of things as it decends
      //into the abyss
      return true;
    }

    //Time
    var diff = this.game.time.now - this.startTime;
    var prevHigh = jQuery.cookie("high_score");
    if(!prevHigh) {
      prevHigh = 0;
    }
    console.log("Compare previous high score " + prevHigh + " to " + diff);
    if(prevHigh < diff) {
      this.newHighScore(diff);
    }

    this.playerDead = true;

    //Kill some working-game things
    this.moveTween.stop();
    this.game.input.onTap.remove(this.tapHandler, this);

    //Replace the eye with the 'X'
    this.currentPlayerEye.kill();
    this.currentPlayerEye = this.deadPlayerEye;

    this.currentPlayerEye.x = this.playerBody.x;
    this.currentPlayerEye.y = this.playerBody.y;
    this.playerBody.body.gravity.y = 300;

    //Tell the player sprite to care
    //if it leaves the world (normally expensive
    //so I've read) then get a callback when it finally leaves
    this.playerBody.checkWorldBounds = true;
    this.playerBody.events.onOutOfBounds.add(this.spriteLeftWorld, this);

    //TODO remove previous button listener, or figure out how to show/hide the button so we can create once
    console.log("Add the \"again\" button");
    //TODO I think I may have too many references dangling.  Need to be more smart w/ the group
    this.againButtonGroup.visible = true;

    return true;
  },

  /**
   *
   */
  newHighScore: function(diff) {
    jQuery.cookie('high_score', diff, { expires: 28} );
    this.highScoreDisplay.text = this.timeToDisplayTime(diff);
  },

  /**
   * Callback when a dead sprite finally falls off the world
   */
  spriteLeftWorld: function() {
    console.log("Sprite left world");
  },


  /**
   * Callback when user taps on screen
   */
  tapHandler: function() {
    console.log("Moving to pointer: " + this.game.input.activePointer.x + ", " + this.game.input.activePointer.y);
    if(this.moveTween.isRunning) {
      console.log("Tween running.  Stop it");
      this.moveTween.stop();
    }
    else {
      console.log("Tween not running.");
    }

    //Create the tween to move the player
    this.moveTween = this.game.add.tween(this.playerBody);

    //so the player moves at a constant *speed*, the tween should have
    //a duration proportional to the distance it will travel
    var duration = this.playerSpeedFactor *
      Math.floor(this.game.physics.arcade.distanceToPointer(this.playerBody, this.game.input.activePointer));

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
  },

  //==================== Asset Management ==============================

  /**
   *
   */
  createBalls: function() {
    this.greenBalls = this.game.add.group();
    this.greenBalls.enableBody = true;

    for (var i = 0; i < this.numBalls; i++) {
      var s = this.greenBalls.create(0,0,'greenBall');
      s.name = 'greenBall' + i;
      this.game.physics.enable(s, Phaser.Physics.ARCADE);
      s.body.collideWorldBounds = true;
      s.body.bounce.setTo(0.8, 0.8);
      s.body.velocity.setTo(10 + Math.random() * this.ballSpeed, 10 + Math.random() * this.ballSpeed);
      s.body.bounce.x = 1;
      s.body.bounce.y = 1;
    }
  },

  /**
   *
   */
  ballsToTheWalls: function() {
    //Try to distribute the balls along the walls so as to not
    //begin the game in collision with each other or
    //the player sprite
    var ySpace = (this.game.world.height-60)/((this.numBalls-2)/2);
    var childCount = 0;

    this.greenBalls.forEach(function(b) {
      var leftSide = true;
      if(childCount*2 >= this.numBalls) {
        leftSide = false;
      }
      var startx = (leftSide?30:(this.game.world.width - 30));
      var starty = (leftSide?
        (childCount*ySpace):
        ((childCount - ((this.numBalls)/2))*ySpace)
        )+30;
      b.x = startx;
      b.y = starty;
      b.body.bounce.setTo(0.8, 0.8);
      b.body.velocity.setTo(10 + Math.random() * this.ballSpeed, 10 + Math.random() * this.ballSpeed);
      b.body.bounce.x = 1;
      b.body.bounce.y = 1;
      childCount++;
    }, this);
  },


  //==================== Utilities ==============================

  /**
   * Still haven't found a good way to
   * use phaser and OO instincts, but this is a start
   */
  createPlayerWrapper: function() {

  },

  /**
   * New idea in "reuse"
   * Gets passed the total time (in millis)
   * For now assumes "seconds"
   *
   * A mix of display and logic but who cares
   */
  createCountDownTimer: function(duration) {

    var that = this;
    var startTime = 0;
    var endTime = 0;

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

  /**
   * Maybe it is my lack-of JS knowledge, but I needed a function
   * as a placeholder to apply a second optional function.
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
    var decis = t % 100;
    //TODO Fix this.  It isn't correct, but goes by too fast so it creates
    //the illusion of a "real" time
    if(decis < 10) {decis = '0' + decis;}
    if(seconds < 10) {seconds = '0' + seconds;}
    return seconds + "." + decis;
  },
};
