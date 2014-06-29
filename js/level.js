var EG3 = EG3 || {};


/**
 * Object to serve as prototype of other levels (i.e. common stuff).  Children should
 * not have a "create" method and instead use "oneTimeCreate" and "reset"
 */
EG3.Level = function() {
  console.log("Level constructor invoked");
}

EG3.Level.prototype = {

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
      this.againButton = this.game.add.button(this.game.width/2, this.game.height/2, 'againButton', this.againClicked, this);
      this.againButtonGroup.add(this.againButton);
      this.againButton.anchor.setTo(0.5,0.5);
      this.againButtonGroup.visible = false;

    }
    else {
      if(this.playerFollowsTap) {
        //re-add tap handler
        this.game.input.onTap.add(this.tapFollowHandler, this);
      }
      this.reset();
    }
  },

  /**
   * Called by children when the level fails.  Game is paused until
   * user hits "again" button which in turn calls "reset" and the
   * game resumes.
   */
  levelFailed: function() {
    this.againButtonGroup.visible = true;
  },

  /**
   * Callback when "again" is clicked
   */
  againClicked: function() {
    this.reset();
    //Hide the "again" button
    this.againButtonGroup.visible = false;

  },

  /**
   * Not used, but an example of cookie plugin once I need it
   */
  newHighScore: function(diff) {
    jQuery.cookie('high_score', diff, { expires: 28} );
    this.highScoreDisplay.text = this.timeToDisplayTime(diff);
  },

  /**
   * Creates a group of balls (duh).  Currently, they bounce around but
   * may make this a parameter at some point
   *
   * @param imageName imageName (from cache)
   * @param numBalls
   * @param speed (50 is "reasonable")
   */
  createBallGroup: function(imageName, numBalls, speed) {

    var that = this;

    //Cache the image dimensions.  We'll use them a lot later
    var img = this.game.cache.getImage(imageName);
    var _imgWidth = img.width;
    var _imgHeight = img.height;
    img = null;

    var _ballGroup = this.game.add.group();
    _ballGroup.enableBody = true;

    for (var i = 0; i < numBalls; i++) {
      var s = _ballGroup.create(0,0,imageName);
      s.name = imageName + i;
      this.game.physics.enable(s, Phaser.Physics.ARCADE);
      s.body.collideWorldBounds = true;
      s.body.bounce.setTo(1, 1);
      s.body.velocity.setTo(10 + Math.random() * speed, 10 + Math.random() * speed);

    }

    /**
     * Distribute balls along the walls
     */
    var _bttw = function() {
      //Try to distribute the balls along the walls so as to not
      //begin the game in collision with each other or
      //the player sprite
      var ySpace = (that.game.world.height-(_imgHeight*2))/((that.numBalls-2)/2);
      var childCount = 0;

      _ballGroup.forEach(function(b) {
        var leftSide = true;
        if(childCount*2 >= numBalls) {
          leftSide = false;
        }
        var startx = (leftSide?_imgWidth:(that.game.world.width - _imgWidth));
        var starty = (leftSide?
          (childCount*ySpace):
          ((childCount - ((numBalls)/2))*ySpace)
          )+_imgWidth;
        b.x = startx;
        b.y = starty;
        b.body.bounce.setTo(0.8, 0.8);
        b.body.velocity.setTo(10 + Math.random() * speed, 10 + Math.random() * speed);
        b.body.bounce.x = 1;
        b.body.bounce.y = 1;
        childCount++;
      }, that);
    };

    return {
      group: _ballGroup,
      ballsToTheWalls: _bttw
    };

  },
  
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
    console.log("Moving to pointer: " + this.game.input.activePointer.x + ", " + this.game.input.activePointer.y);
    if(this.moveTween.isRunning) {
      console.log("Tween running.  Stop it");
      this.moveTween.stop();
    }
    else {
      console.log("Tween not running.");
    }

    //Create the tween to move the player
    this.moveTween = this.game.add.tween(this.bodyToFollow);

    //so the player moves at a constant *speed*, the tween should have
    //a duration proportional to the distance it will travel
    var duration = this.playerSpeedFactor *
      Math.floor(this.game.physics.arcade.distanceToPointer(this.bodyToFollow, this.game.input.activePointer));

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


  /**
   * Still haven't found a good way to
   * use phaser and OO instincts, but this is a start
   */
  createPlayerWrapper: function() {

    var that = this;
    var alive = true;

    var playerBody = this.game.add.sprite(
      (this.game.world.width/2) - 25,
      (this.game.world.height/2) - 20, 'playerBody');
    playerBody.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(playerBody, Phaser.Physics.ARCADE);

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

    var _killPlayer = function() {
      //Replace the eye with the 'X'
      currentPlayerEye.kill();
      currentPlayerEye = deadPlayerEye;

      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
      playerBody.body.gravity.y = 300;

      alive = false;
    };

    var _update = function() {
      //TODO there is some bug where the physics body is already updated, and the eye looks funny 
      //falling.  Not really noticable on regular play, but something to be worked out.
      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
      if(alive) {
        currentPlayerEye.rotation = that.game.physics.arcade.angleToPointer(currentPlayerEye);
    }
    };

    return {
      playerBody: playerBody,
      revivePlayer: _revivePlayer,
      killPlayer: _killPlayer,
      update: _update
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
    var decis = t % 100;
    //TODO Fix this.  It isn't correct, but goes by too fast so it creates
    //the illusion of a "real" time
    if(decis < 10) {decis = '0' + decis;}
    if(seconds < 10) {seconds = '0' + seconds;}
    return seconds + "." + decis;
  },
};
