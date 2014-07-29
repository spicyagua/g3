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
    this.playerWrapper = this.createPlayerWrapper();
    this.game.input.onTap.add(this.tapHandler);
  };


  /**
   * Part of "level" contract
   */
  this.reset = function() {

  };

  /**
   * Part of "level" contract
   */
  this.updateImpl = function() {
//    var foo = this.tileSprite;
//    foo.tilePosition.y+=1;
//    console.log("Position: " + foo.tilePosition.y);
    this.playerWrapper.update();
  };

  /**
   * Part of "level" contract
   */
  this.displayFailState = function() {
  };

  /**
   * Part of "level" contract
   */
  this.displayVictoryState = function() {
  };

  /**
   * Callback when user clicks on screen.  "this" will always
   * be set in the intuitive manner.
   */
  this.displayTapped = function() {
    //From the debugger (!?!) I know that arguments[0] is a point where
    //the tap happened.
    console.log("Tap: " + arguments[0].x + ", " + arguments[0].y);
    var args = arguments;
    console.log("Arg length: " + arguments.length);
    this.playerWrapper.slideToX(arguments[0].x);
  };


  /**
   * Restart over the old "base class" approach.  This also
   * assumes we're creating the player near the bottom, and records
   * y position (line) over-which the player will slide
   */
  this.createPlayerWrapper = function() {

    var that = this;

    //Hack because I can't seem to find a good way to move
    //and tweens seem to mess-up colissions
    var moving = false;
    var movingTo = {};

    //Cache player dimensions
    var img = this.game.cache.getImage("playerBody");
    var _imgWidth = img.width;
    var _imgHeight = img.height;
    img = null;

    var playerGroup = this.game.add.group();

    //Position player near bottom.  Record the Y position
    var yPos = this.game.world.height - _imgHeight - (Math.round(_imgHeight/2));
    var xPos = Math.round((this.game.world.width/2) + (_imgWidth/2));

    var playerBody = this.game.add.sprite(0,0, 'playerBody');
    playerBody.anchor.setTo(0.5, 0.5);
    playerBody.x = xPos;
    playerBody.y = yPos;
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

    playerGroup.add(playerBody);
    playerGroup.add(openPlayerEye);
    playerGroup.add(deadPlayerEye);

    var _update = function() {
      //TODO there is some bug where the physics body is already updated, and the eye looks funny
      //falling.  Not really noticable on regular play, but something to be worked out.
      console.log("Player: " + playerBody.x + ", " + playerBody.y + ", Physics body: " + playerBody.body.x + ", " + playerBody.body.y);
      currentPlayerEye.x = playerBody.x;
      currentPlayerEye.y = playerBody.y;
      if(true) {
        currentPlayerEye.rotation = (Math.PI*1.5) + that.game.physics.arcade.angleToPointer(currentPlayerEye);
      }
      if(moving) {
        if(
          (playerBody.x >= movingTo.x && movingTo.fwd) ||
          (playerBody.x <= movingTo.x && (!movingTo.fwd))
          ) {
          moving = false;
          _stopPlayer();
        }
      }
    };

    var _slideToX = function(x) {
      if(moving) {
        _stopPlayer();
        movingTo = null;
      }
      movingTo = {x: x, y: yPos, fwd: (x>playerBody.x?true:false)};
      that.game.physics.arcade.accelerateToXY(playerBody, x, yPos, that.settings.playerSpeed);
      moving = true;
    };

    var _stopPlayer = function() {
      playerBody.body.acceleration.x =
      playerBody.body.acceleration.y =
      playerBody.body.velocity.x =
      playerBody.body.velocity.y = 0;
    };

    return {
      playerBody: playerBody,
      update: _update,
      yPos: yPos,
      slideToX: _slideToX
    };
  };

  //Wrap this at end of constructor once functions have been created
  this.tapHandler = this.displayTapped.bind(this);


};

EG3.Space.constructor = EG3.Space;

EG3.Space.prototype = new EG3.Level();


