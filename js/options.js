var EG3 = EG3 || {};

EG3.Options = function() {
//  this.loadComplete = false;
  this.startButton;
  this.gameLogo;
}

EG3.Options.prototype = {
  preload: function() {
    console.log("Options.preload");
    this.gameLogo = this.game.add.sprite(this.game.width/2-120, 100, 'gameLogo');
    this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClicked, this);
    this.startButton.anchor.setTo(0.5,0.5);
  },
  create: function() {
    console.log("Options.create");
  },
  update: function() {
//    console.log("Options.update");
//    this.game.state.start("level1");
  },

 startClicked: function() {
   this.game.state.start('level1');
 }
};
