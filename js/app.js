var EG3 = EG3 || {};

EG3.relWidth = 400;
EG3.relHeight = 600;

EG3.main = function() {
      "use strict";
      var game = new Phaser.Game(EG3.relWidth, EG3.relHeight, Phaser.AUTO, 'G3');



      // Game States
      game.state.add('bootup', EG3.Bootup);
      game.state.add('preload', EG3.Preload);
      game.state.add('options', EG3.Options);
      game.state.add('level1', EG3.Level1);


      game.state.start('bootup');
}
