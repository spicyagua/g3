var EG3 = EG3 || {};


EG3.Level = function() {
  console.log("Level constructor invoked");
  //Data members here
  this.numBalls = 6;
  this.timeHack = 0;
  this.playerSpeedFactor = 5;//bigger means slower
  this.ballSpeed = 50;

}

EG3.Level.prototype = {

  init: function(params) {
    console.log("Init called.  This is how I can pass state between ... states");
  },
  preload: function() {
    console.log("Level1.preload");
  },
  onetimeCreate: function() {

    //Add background
    this.game.add.sprite(0,0,"bg");

    //Start physics.  This may be moved to better facilitate "restarting"
    //a state
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.createBalls();
    this.ballsToTheWalls();

    this.playerBody = this.game.add.sprite(
      (this.game.world.width/2) - 25,
      (this.game.world.height/2) - 20, 'playerBody');
    this.playerBody.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.playerBody, Phaser.Physics.ARCADE);
    console.log("Initial velocity: " + this.playerBody.body.velocity);

    this.deadPlayerEye = this.game.add.sprite(-100, -100, 'deadEye');
    this.deadPlayerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(this.deadPlayerEye, Phaser.Physics.ARCADE);

    this.openPlayerEye = this.game.add.sprite(0, 0, 'playerEye');
    this.openPlayerEye.anchor.setTo(0.5, 0.375);
    this.game.physics.enable(this.openPlayerEye, Phaser.Physics.ARCADE);
    this.currentPlayerEye = this.openPlayerEye;

    this.currentPlayerEye.x = this.playerBody.x;
    this.currentPlayerEye.y = this.playerBody.y;
    this.currentPlayerEye.rotation = this.game.physics.arcade.angleToPointer(this.currentPlayerEye);

    this.againButtonGroup = this.game.add.group();
    this.againButton = this.game.add.button(this.game.width/2, this.game.height/2, 'againButton', this.againClicked, this);
//    this.againButton;
    this.againButtonGroup.add(this.againButton);
    this.againButton.anchor.setTo(0.5,0.5);
    this.againButtonGroup.visible = false;

    //Tap handler to move the player
    this.game.input.onTap.add(this.tapHandler, this);

    //This is just so I don't have to have a bunch of
    //null checks later.  The tween isn't used for anything
    this.moveTween = this.game.add.tween(this.playerBody);

    //The time display.  This is done last so it is highest in the "z" order.
    //I could also learn about groups, but I'm being lazy right now.
    this.clockDisplay = this.game.add.text(
      250,
      20,
      "00.00",
      {
        "font": "36px monospace",
        "color": "white",
        "fill": "#ff0044"
      }
      );

    //Existing high score
    var prevHigh = jQuery.cookie('high_score');
    if(!prevHigh) {
      prevHigh = "0";
    }
    console.log("Pref High: " + prevHigh);
    this.highScoreDisplay = this.game.add.text(
      20,
      20,
      this.timeToDisplayTime(prevHigh),
      {
        "font": "36px monospace",
        "color": "white",
        "fill": "#ff0044"
      }
      );
    this.createdOnce = true;
  },
  /**
   * I didn't check if the name conflicts - should do that sometime
   */
  xreset: function() {

    //Hide the "again" button
    this.againButtonGroup.visible = false;

    delete this.startTime;

    this.playerBody.checkWorldBounds = false;
    this.playerBody.events.onOutOfBounds.remove(this.spriteLeftWorld);
    this.playerBody.body.gravity.y = 0;
    this.playerBody.body.velocity.x = 0;
    this.playerBody.body.velocity.y = 0;


    //Reset location of eye(s) and body
    this.playerBody.x = (this.game.world.width/2) - 25;
    this.playerBody.y = (this.game.world.height/2) - 20;
    this.deadPlayerEye.x = -100;
    this.deadPlayerEye.y = -100;

    this.openPlayerEye.revive();

    this.currentPlayerEye = this.openPlayerEye;;

    this.currentPlayerEye.x = this.playerBody.x;
    this.currentPlayerEye.y = this.playerBody.y;
    this.currentPlayerEye.rotation = this.game.physics.arcade.angleToPointer(this.currentPlayerEye);

    //re-add tap handler
    this.game.input.onTap.add(this.tapHandler, this);

    //The time display.  This is done last so it is highest in the "z" order.
    //I could also learn about groups, but I'm being lazy right now.
    this.clockDisplay.text = this.timeToDisplayTime(0);

    this.ballsToTheWalls();

    this.playerDead = false;
  },
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

  update: function() {
    //To be "fair", wait until first update loop
    //to assign time
    if(!this.startTime) {
      this.startTime = this.game.time.now;
    }

    //Hack so the clock isn't updating at a ridigulious
    //rate.  Just update "every few times" update is
    //called.
    if(this.timeHack++ > 3 && !this.playerDead) {
      this.timeHack = 0;
      var diff = this.game.time.now - this.startTime;
      if(diff == 0) {
        diff = 1;
      }
      this.clockDisplay.text = this.timeToDisplayTime(diff);
    }

    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);

    this.game.physics.arcade.collide(this.balls);
    this.game.physics.arcade.collide(this.playerBody,
      this.balls,
      this.uselessFunction,//I have yet to figure out what this does and why it is called, but I need to provide it so I can get the next function
      this.playerBallCollisionProcess,
      this);
    this.currentPlayerEye.x = this.playerBody.x;
    this.currentPlayerEye.y = this.playerBody.y;

    //Kind-of a hack (I should add more "behavior" to the player
    //but prevents the dead "X" eye from following the pointer
    //(on desktop machines)
    if(!this.playerDead) {
      this.currentPlayerEye.rotation = this.game.physics.arcade.angleToPointer(this.currentPlayerEye);
    }
  },

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
  createBalls: function() {
    this.balls = this.game.add.group();
    this.balls.enableBody = true;

    //Try to distribute the balls along the walls so as to not
    //begin the game in collision with each other or
    //the player sprite
    var ySpace = (this.game.world.height-60)/((this.numBalls-2)/2);

    for (var i = 0; i < this.numBalls; i++) {
      var leftSide = true;
      if(i*2 >= this.numBalls) {
        leftSide = false;
      }
      var startx = (leftSide?30:(this.game.world.width - 30));
      var starty = (leftSide?
        (i*ySpace):
        ((i - ((this.numBalls)/2))*ySpace)
        )+30;
      console.log("(" + i + ") Create ball at: " + startx + ", " + starty);
      var s = this.balls.create(
        startx,
        starty,
        'greenBall');

      s.name = 'greenBall' + i;
      this.game.physics.enable(s, Phaser.Physics.ARCADE);
      s.body.collideWorldBounds = true;
      s.body.bounce.setTo(0.8, 0.8);
      s.body.velocity.setTo(10 + Math.random() * this.ballSpeed, 10 + Math.random() * this.ballSpeed);
      s.body.bounce.x = 1;
      s.body.bounce.y = 1;
    }
  },  
  
  ballsToTheWalls: function() {
    //Try to distribute the balls along the walls so as to not
    //begin the game in collision with each other or
    //the player sprite
    var ySpace = (this.game.world.height-60)/((this.numBalls-2)/2);
    var childCount = 0;

    this.balls.forEach(function(b) {
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
