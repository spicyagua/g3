var EG3 = EG3 || {};

EG3.Options = function() {
//  this.loadComplete = false;
  this.startButton;
  this.gameLogo;
}

EG3.Options.prototype = {
  preload: function() {
    console.log("Options.preload");
    this.game.add.sprite(0,0,"splash");
//    this.gameLogo = this.game.add.sprite(this.game.width/2-120, 100, 'gameLogo');
    yVal = (this.game.height/6)*5;
    this.startButton = this.game.add.button(this.game.width/2, yVal, 'startButton', this.startClicked, this);
    this.startButton.anchor.setTo(0.5,0.5);

    var cenX = (this.game.world.width/2);
    var cenY = (this.game.world.height/3);

    this.playerBody = this.game.add.sprite(cenX, cenY, 'playerBody');
    this.playerBody.anchor.setTo(0.5, 0.5);
    this.blankEye = this.game.add.sprite(cenX, cenY, 'blankEye');
    this.blankEye.anchor.setTo(0.5, 0.5);
    this.pupil = this.game.add.sprite(cenX, cenY, 'pupil');
    this.pupil.anchor.setTo(0.5, 0.5);
    this.mouth = this.game.add.sprite(cenX, cenY, 'mouth');
    this.mouth.anchor.setTo(0.5, 0.5);
    var t1 = this.game.add.tween(this.playerBody.scale).to({x:4, y:4}, 1000, Phaser.Easing.Quadratic.In, true);
    var t1 = this.game.add.tween(this.blankEye.scale).to({x:4, y:4}, 1000, Phaser.Easing.Quadratic.In, true);
    var t1 = this.game.add.tween(this.pupil.scale).to({x:4, y:4}, 1000, Phaser.Easing.Quadratic.In, true);
    var t1 = this.game.add.tween(this.mouth.scale).to({x:4, y:4}, 1000, Phaser.Easing.Quadratic.In, true);

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
