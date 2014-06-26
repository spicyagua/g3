var EG3 = EG3 || {};

EG3.Level1 = function() {
  console.log("Level1 function invoked");
  this.numBalls = 14;
  
  this.onetimeCreate = function() {

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
  };
  
  /**
   * I didn't check if the name conflicts - should do that sometime
   */
  this.xreset = function() {

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
  this.preload = function() {
    console.log("Level1.preload");
  };
  

  /**
   *
   */
  this.update =h function() {
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

    this.game.physics.arcade.collide(this.greenBalls);
    this.game.physics.arcade.collide(this.playerBody,
      this.greenBalls,
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
  };
   
  
  
};

EG3.Level1.constructor = EG3.Level1;


EG3.Level1.prototype = new EG3.Level();


