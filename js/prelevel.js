var EG3 = EG3 || {};



EG3.Prelevel = function() {
  console.log("Prelevel constructor");
  this.createBg = false;
  this.nextLevel = null;
};

EG3.Prelevel.prototype = {

  init: function(args) {
    console.log("Prelevel.init");
  },

  preload: function() {
    console.log("PrePrelevel.preload");
  },
  create: function() {
    console.log("Prelevel.create");
//    if(!this.startButton) {
    //Add background
      this.game.add.sprite(0,0,"bg");
      yVal = (this.game.height/8)*7;
      this.startButton = this.game.add.button(this.game.width/2, yVal, 'blankButton', this.startClicked, this);
      this.startButton.anchor.setTo(0.5,0.5);
      EG3.app.textToButton(this.startButton, "Play");

      //Paper is 340x443
      //TODO: Get images from cache and look-up their dimensions
      var px = (this.game.width-340)/2;
      var py = 30;
      this.game.add.sprite(px,py,"paper");

      var style = {
          "font": "36px Comic Sans MS",
          "fill": "#12114c",
          "wordWrap": true,
          "wordWrapWidth": 340-20/*,
          "align": "center"*/
        };
      this.levelTitle = this.game.make.text(
        10,
        30,//TODO hardocded height
        "Level " + (((EG3.app.getCurrentLevelIndex()*1)+1)),
        style
        );
      var ltWidth = this.levelTitle.width;
      this.levelTitle.x = (this.game.width/2)-(ltWidth/2);
      this.game.world.add(this.levelTitle);

      this.descBox = this.game.add.text(
        ((this.game.width-340)/2) +10,
        90,//TODO Hardcoded size
        "This will be really long, so I can tell if things really wrap around when they get really really really long and I am done",
        style
        );
//    }

    console.log("Desc: " + EG3.app.getCurrentLevelDesc());
    this.descBox.text = EG3.app.getCurrentLevelDesc();
  },
  update: function() {

  },
  shutDown: function() {
    console.log("Prelevel shutdown called");
  },
  startClicked: function() {
    this.game.state.start(EG3.app.getCurrentLevelName());
  }
};


