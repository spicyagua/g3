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
      victoryMsg: "Sweet!",
      meta: {
        numBalls: 6,
        ballSpeed: 50,
        totalTime: 1000*10,
        playerSpeedFactor: 5,//Bigger = slower
      }
    },
    {
      name: "level2",
      jsType: "GBBacon",
      description: "Tap to move Sprite.  Avoid the green tomatoes while trying to eat the bacon",
      victoryMsg: "I love Bacon!",
      meta: {
        numBalls: 4,
        ballSpeed: 10,
        playerSpeedFactor: 5,
        baconDelay: 2,//seconds
        baconFadeMillis: 2000,
        baconSpeed: 100
      }
    },
    {
      name: "level3",
      jsType: "BouncyRG",
      description: "This level is currently broken.  Don't play",
      victoryMsg: "You showed them tomatoes",
      meta: {
        numGreenBalls: 4,
        greenBallSpeed: 20,
        numRedBalls: 4,
        redBallSpeed: 50,
        redFadeInMillis: 2000,
        playerSpeedFactor: 5,//Bigger = slower
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
//    currentLevelPtr = 0;

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
      case "GBBacon":
        return new EG3.GBBacon(args);
        break;
      case "BouncyRG":
        return new EG3.BouncyRG(args);
        break;

    }

  };


  var _textToButton = function(button, text) {

    var textText = game.make.text(1,1,text,
      {
        "font": "32px Comic Sans MS",
        "fill": "#000000"
      });

    textText.x = ((button.x - (button.width*button.anchor.x))+(button.width/2))- (textText.width/2);
    textText.y = ((button.y - (button.height*button.anchor.y))+(button.height/2)) - (textText.height/2);
    game.world.add(textText);

    return textText;
  };


  return {
    REL_WIDTH: relWidth,
    REL_HEIGHT: relHeight,
    main: _main,
    advanceLevel: function() {
      currentLevelPtr++;
      console.log("Advanced pointer to: " + currentLevelPtr);
      jQuery.cookie("current_level", currentLevelPtr, { expires: 28} );
    },
    getCurrentLevelName: function() {return levels[currentLevelPtr].name;},
    getCurrentLevelDesc: function() {
      console.log("Pointer: " + currentLevelPtr);
      return levels[currentLevelPtr].description;
    },
    getCurrentLevelVictoryMsg: function() {
      return levels[currentLevelPtr].victoryMsg;
    },
    getCurrentLevelIndex: function() {return currentLevelPtr;},
    textToButton: _textToButton,
    resetToFirstLevel: function() {
      currentLevelPtr = 0;
      console.log("Reset to initial level");
      jQuery.cookie("current_level", currentLevelPtr, { expires: 28} );
    }

  };
}());

