var EG3 = EG3 || {};

EG3.Options = function() {
  this.startButton;
  this.gameLogo;
}

EG3.Options.prototype = {
  preload: function() {
    console.log("Options.preload");
    this.game.add.sprite(0,0,"splash");
    this.game.add.sprite(50,40,"logo");    
//    this.gameLogo = this.game.add.sprite(this.game.width/2-120, 100, 'gameLogo');
    yVal = (this.game.height/6)*5;
    this.startButton = this.game.add.button(this.game.width/2, yVal, 'playButton', this.startClicked, this);
    this.startButton.anchor.setTo(0.5,0.5);

    var cenX = (this.game.world.width/2);
    var cenY = (this.game.world.height/7)*4;

    this.playerBody = this.game.add.sprite(cenX, cenY, 'bodyBig');
    this.playerBody.anchor.setTo(0.5, 0.5);
    this.playerBody.scale.x = 0.25;
    this.playerBody.scale.y = 0.25;
    this.blankEye = this.game.add.sprite(cenX, cenY, 'blankEyeBig');
    this.blankEye.anchor.setTo(0.5, 0.5);
    this.blankEye.scale.x = 0.25;
    this.blankEye.scale.y = 0.25;
    this.pupil = this.game.add.sprite(cenX, cenY, 'pupilBig');
    this.pupil.anchor.setTo(0.5, 0.5);
    this.pupil.scale.x = 0.25;
    this.pupil.scale.y = 0.25;
    this.mouth = this.game.add.sprite(cenX, cenY, 'mouthBig');
    this.mouth.anchor.setTo(0.5, 0.5);
    this.mouth.scale.x = 0.25;
    this.mouth.scale.y = 0.25;

//    this.game.time.events.add(Phaser.Timer.SECOND * 1, this.addInPlayer, this);
    var t1 = this.game.add.tween(this.playerBody.scale).to({x:1, y:1}, 1000, Phaser.Easing.Quadratic.In, true);
    var t2 = this.game.add.tween(this.blankEye.scale).to({x:1, y:1}, 1000, Phaser.Easing.Quadratic.In, true);
    var t3 = this.game.add.tween(this.pupil.scale).to({x:1, y:1}, 1000, Phaser.Easing.Quadratic.In, true);
    var t4 = this.game.add.tween(this.mouth.scale).to({x:1, y:1}, 1000, Phaser.Easing.Quadratic.In, true);

    this.game.time.events.add(Phaser.Timer.SECOND * 2, this.moveEyes, this);

  },
  moveEyes: function() {
    console.log("moveEyesCallback");
    center = this.pupil.x;
    var myTween = this.game.add.tween(this.pupil);
    myTween.to({x: center-14}).to({x:center+14}).to({x:center});
    myTween.start();
//    this.game.time.events.add(Phaser.Timer.SECOND * 3, this.moveEyes, this);
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
