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
      this.startButton = this.game.add.button(this.game.width/2, yVal, 'playButton', this.startClicked, this);
      this.startButton.anchor.setTo(0.5,0.5);

      //Paper is 340x443
      //TODO: Get images from cache and look-up their dimensions
      var px = (this.game.width-340)/2;
      var py = 30;
      this.game.add.sprite(px,py,"paper");

      this.descBox = this.game.add.text(
        ((this.game.width-340)/2) +10,
        40,
        "This will be really long, so I can tell if things really wrap around when they get really really really long and I am done",
        {
          "font": "36px Comic Sans MS",
          "fill": "#ff0044",
          "wordWrap": true,
          "wordWrapWidth": 340-20
        }
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


