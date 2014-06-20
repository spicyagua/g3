var EG3 = EG3 || {};

EG3.Level1 = function() {
  //Data members here
}

EG3.Level1.prototype = {
  preload: function() {
    console.log("Level1.preload");
  },
  create: function() {
    console.log("Level1.create");

    this.game.add.sprite(0,0,"bg");
  },
  update: function() {
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.bird);
  },
};