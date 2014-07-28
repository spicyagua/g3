var EG3 = EG3 || {};

EG3.Preload = function() {
  this.loadComplete = false;
  this.preloadSprite;
}

EG3.Preload.prototype = {
  preload: function() {
    console.log("Preload.preload");

    this.preloadSprite = this.add.sprite(this.game.world.width/2,this.game.world.height/2, 'preloadeImage');

    this.game.load.image('bg', 'assets/bg2.png');
    this.game.load.image('logo', 'assets/logo.png');
    this.game.load.image('splash', 'assets/bg3.png');
    this.game.load.image('greenBall', 'assets/greenBall.png');
    this.game.load.image('redBall', 'assets/redBall.png');
    this.game.load.image('playerBody', 'assets/playerBody.png');
    this.game.load.image('playerEye', 'assets/playerEye.png');
    this.game.load.image('bodyBig', 'assets/bodyBig.png');
    this.game.load.image('blankEyeBig', 'assets/blankEyeBig.png');
    this.game.load.image('mouthBig', 'assets/mouthBig.png');
    this.game.load.image('pupilBig', 'assets/pupilBig.png');
    this.game.load.image('deadEye', 'assets/deadEye.png');
    this.game.load.image('paper', 'assets/paper.png');
    this.game.load.image('bacon', 'assets/bacon.png');
    this.game.load.image('blankButton', 'assets/blankButton.png');

    //Load any audio here

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
  },
  update: function() {
  },
  onLoadComplete: function() {
    console.log("Preload.onLoadComplete");
    this.game.state.start("options");
  }
};
