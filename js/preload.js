var EG3 = EG3 || {};

EG3.Preload = function() {
  this.loadComplete = false;
  this.preloadSprite;
}

EG3.Preload.prototype = {
  preload: function() {
    console.log("Preload.preload");

    //Nuking this for now.  Not enough to load to be significant (i.e.
    //the spinner just flashes even on my phone)
    //this.preloadSprite = this.add.sprite(this.game.world.width/2,this.game.world.height/2, 'preloadeImage');

    this.game.load.image('bg', 'assets/bg2.png');
    this.game.load.image('logo', 'assets/logo.png');    
    this.game.load.image('splash', 'assets/bg3.png');
    this.game.load.image('gameLogo', 'assets/someGame.png');
    this.game.load.image('startButton', 'assets/startButton.png');
    this.game.load.image('playButton', 'assets/playButton.png');
    this.game.load.image('againButton', 'assets/againButton.png');        
    this.game.load.image('greenBall', 'assets/greenBall.png');
    this.game.load.image('playerBody', 'assets/playerBody.png');
    this.game.load.image('playerEye', 'assets/playerEye.png');
    this.game.load.image('bodyBig', 'assets/bodyBig.png');
    this.game.load.image('blankEyeBig', 'assets/blankEyeBig.png');
    this.game.load.image('mouthBig', 'assets/mouthBig.png');
    this.game.load.image('pupilBig', 'assets/pupilBig.png');
    this.game.load.image('deadEye', 'assets/deadEye.png');

    //Load any audio here

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
  },
  create: function() {
    console.log("Preload.create");
  },
  update: function() {
    if(this.loadComplete) {
      console.log("Preload.update - load complete");
      this.game.state.start("options");
    }
  },
  onLoadComplete: function() {
    console.log("Preload.onLoadComplete");
    this.loadComplete = true;
  }
};
