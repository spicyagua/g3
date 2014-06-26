var EG3 = EG3 || {};

EG3.app = (function() {

  var relWidth = 400;
  var relHeight = 600;
  var game = null;
  var currentLevelPtr = -1;

  var levels = [
    {name: "level1", jsType: "Level1"}
  ];

  var _main = function() {
    game = new Phaser.Game(relWidth, relHeight, Phaser.AUTO, 'G3');

    // Game States
    game.state.add('bootup', EG3.Bootup);
    game.state.add('preload', EG3.Preload);
    game.state.add('options', EG3.Options);
    game.state.add('level1', EG3.Level1);
    game.state.add('prelevel', new EG3.Prelevel());

    game.state.start('bootup');
  };


  return {
    REL_WIDTH: relWidth,
    REL_HEIGHT: relHeight,
    main: _main,
    advanceLevel: function() {currentLevelPtr++;},
    getCurrentLevelName: function() {return levels[currentLevelPtr].name;},
    getCurrentLevelDesc: function() {return EG3[levels[currentLevelPtr].jsType]["description"];}
  };
}());

