var EG3 = EG3 || {};

EG3.app = (function() {

  var relWidth = 400;
  var relHeight = 600;
  var game = null;
  var currentLevelPtr = 0;

  var levels = [
    {name: "level1", jsType: "Level1"},
    {name: "level2", jsType: "Level2"}
  ];

  var _main = function() {

    var prevLevel = jQuery.cookie("current_level");
    if(!prevLevel) {
      currentLevelPtr = 0;
    }
    else {
      currentLevelPtr = prevLevel;
    }

    //TODO Remove this hack
    currentLevelPtr = 0;

    game = new Phaser.Game(relWidth, relHeight, Phaser.AUTO, 'G3');

    // Game States
    game.state.add('bootup', EG3.Bootup);
    game.state.add('preload', EG3.Preload);
    game.state.add('options', EG3.Options);
    game.state.add('level1', EG3.Level1);
    game.state.add('level2', EG3.Level2);

    game.state.add('prelevel', new EG3.Prelevel());

    game.state.start('bootup');
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
    getCurrentLevelDesc: function() {console.log("Pointer: " + currentLevelPtr);return EG3[levels[currentLevelPtr].jsType]["description"];}
  };
}());

