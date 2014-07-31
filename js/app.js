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
      jsType: "Space",
      description: "Keep going up into space for 20 seconds, avoid the green tomatoes by moving left/right.",
      victoryMsg: "Dude!",
      meta: {
        totalTime: 1000*20,
        skySpeed: 150, //I think in px/sec.  Larger is faster.
        playerSpeed: 400,//Bigger = faster
        greenBallGroupSettings: {
          imageName: "greenBall",
          ballFrequency: 1,//new balls/sec
          ballVelocity: 50,//Pixels/sec
          ballVelocityRandomness: 0.7//multiplied by Math.random and ballVelocity then added to ballVelocity
        }
      }
    },
    {
      name: "level4",
      jsType: "SpaceRG",
      description: "Keep going into space, avoid green tomatoes.  If you hit a red tomato, it blows away the green ones.  60 seconds",
      victoryMsg: "Yea Baby!",
      meta: {
        totalTime: 1000*60,
        skySpeed: 150, //I think in px/sec.  Larger is faster.
        playerSpeed: 400,//Bigger = faster
        greenBallGroupSettings: {
          imageName: "greenBall",
          ballFrequency: 1,//new balls/sec
          ballVelocity: 50,//Pixels/sec
          ballVelocityRandomness: 0.7,//multiplied by Math.random and ballVelocity then added to ballVelocity
        },
        redBallGroupSettings: {
          imageName: "redBall",
          ballFrequency: 0.3,//new balls/sec
          ballVelocity: 80,//Pixels/sec
          ballVelocityRandomness: 0.8//multiplied by Math.random and ballVelocity then added to ballVelocity
        }
      }
    },
    {
      name: "level5",
      jsType: "BouncyBalls",
      description: "Tap to move Sprite.  Avoid the green tomatoes for 20 seconds.  They are faster now.",
      victoryMsg: "Keep going!",
      meta: {
        numBalls: 8,
        ballSpeed: 60,
        totalTime: 1000*20,
        playerSpeedFactor: 4,//Bigger = slower
      }
    },
    {
      name: "level6",
      jsType: "GBBacon",
      description: "Tap to move Sprite.  Avoid the green tomatoes while trying to eat the bacon",
      victoryMsg: "Still Love Bacon!",
      meta: {
        numBalls: 6,
        ballSpeed: 30,
        playerSpeedFactor: 5,
        baconDelay: 2,//seconds
        baconFadeMillis: 2000,
        baconSpeed: 100
      }
    },
    {
      name: "level7",
      jsType: "Space",
      description: "Left/right to avoid green balls for 30 seconds",
      victoryMsg: "You Rock!",
      meta: {
        totalTime: 1000*30,
        skySpeed: 170, //I think in px/sec.  Larger is faster.
        playerSpeed: 500,//Bigger = faster
        greenBallGroupSettings: {
          imageName: "greenBall",
          ballFrequency: 1.5,//new balls/sec
          ballVelocity: 50,//Pixels/sec
          ballVelocityRandomness: 0.8//multiplied by Math.random and ballVelocity then added to ballVelocity
        }
      }
    },
    {
      name: "level8",
      jsType: "SpaceRG",
      description: "Move left/right.  Avoid Green tomatoes.  Red ones blow away green ones.  2 minutes",
      victoryMsg: "Yea Baby!",
      meta: {
        totalTime: 1000*120,
        skySpeed: 170, //I think in px/sec.  Larger is faster.
        playerSpeed: 500,//Bigger = faster
        greenBallGroupSettings: {
          imageName: "greenBall",
          ballFrequency: 2,//new balls/sec
          ballVelocity: 50,//Pixels/sec
          ballVelocityRandomness: 0.7//multiplied by Math.random and ballVelocity then added to ballVelocity
        },
        redBallGroupSettings: {
          imageName: "redBall",
          ballFrequency: 0.3,//new balls/sec
          ballVelocity: 50,//Pixels/sec
          ballVelocityRandomness: 0.8//multiplied by Math.random and ballVelocity then added to ballVelocity
        }

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
      case "Space":
        return new EG3.Space(args);
        break;
      case "SpaceRG":
        return new EG3.SpaceRG(args);
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

