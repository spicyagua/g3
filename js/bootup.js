var EG3 = EG3 || {};

EG3.Bootup = function() {
}

EG3.Bootup.prototype = {
  preload: function() {
    console.log("Bootup preload");
    this.load.image('preloadeImage', 'assets/loader.gif');
  },
  create: function() {
    console.log("Bootup create");
    this.game.input.maxPointers = 1;

    console.log("Set-up scaling and orientation rules");

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.minWidth = EG3.app.REL_WIDTH;
    this.game.scale.minHeight = EG3.app.REL_HEIGHT;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.setScreenSize(true);

    this.game.state.start("preload");

  }
};
