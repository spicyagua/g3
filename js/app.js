var EG3 = EG3 || {};

EG3.app = (function() {

  var relWidth = 400;
  var relHeight = 600;
  var game = null;

  var _main = function() {
    game = new Phaser.Game(relWidth, relHeight, Phaser.AUTO, 'G3');

    // Game States
    game.state.add('bootup', EG3.Bootup);
    game.state.add('preload', EG3.Preload);
    game.state.add('options', EG3.Options);
    game.state.add('level1', EG3.Level1);

    game.state.start('bootup');
  };

  return {
    REL_WIDTH: relWidth,
    REL_HEIGHT: relHeight,
    main: _main
  };
}());

