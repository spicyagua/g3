var EG3 = EG3 || {};

EG3.app = (function() {

  var relWidth = 400;
  var relHeight = 600;
  var game = null;
  var currentLevelPtr = 0;


  // This should be fetched by XHR in the future, but this is fine for now.
  var levels = [
    {
      name: "level1",
      jsType: "BouncyBalls",
      description: "Tap to move Sprite.  Avoid the green tomatoes for 10 seconds",
      meta: {
        numBalls: 6,
        ballSpeed: 50,
        totalTime: 1000*10,
        playerSpeedFactor: 5,//Bigger = slower
      }
    },
    {
      name: "level2",
      jsType: "BouncyBalls",
      description: "Tap to move Sprite.  Avoid the green tomatoes for 20 seconds",
      meta: {
        numBalls: 10,
        ballSpeed: 60,
        totalTime: 1000*20,
        playerSpeedFactor: 5,
      }
    }
  ];


  var _main = function() {

    var prevLevel = jQuery.cookie("current_level");
    if(!prevLevel) {
      currentLevelPtr = 0;
    }
    else {
      currentLevelPtr = prevLevel;
    }

    //TODO Remove this hack once I resolve cookies
    currentLevelPtr = 0;

    game = new Phaser.Game(relWidth, relHeight, Phaser.AUTO, 'G3');

    // Game States
    game.state.add('bootup', EG3.Bootup);
    game.state.add('preload', EG3.Preload);
    game.state.add('options', EG3.Options);
    game.state.add('prelevel', new EG3.Prelevel());


    for(var i = 0; i<levels.length; i++) {
      game.state.add(levels[i].name, createLevel(levels[i].jsType, levels[i].meta))
    }

    game.state.start('bootup');

  };

  //I can't figure out how to dynamically invoke
  //constructors.  There must be *some* way, or
  //perhaps I shouldn't use constructors.
  var createLevel = function(jtype, args) {
    switch(jtype) {
      case "BouncyBalls":
        return new EG3.BouncyBalls(args);
        break;
    }
  };


  return {
    REL_WIDTH: relWidth,
    REL_HEIGHT: relHeight,
    main: _main,
    advanceLevel: function() {
      currentLevelPtr++;
      jQuery.cookie("current_level", currentLevelPtr, { expires: 28} );
    },
    getCurrentLevelName: function() {return levels[currentLevelPtr].name;},
    getCurrentLevelDesc: function() {
      console.log("Pointer: " + currentLevelPtr);
      return levels[currentLevelPtr].description;
    }
  };
}());

