var EG3 = EG3 || {};

EG3.Level1 = function() {
  console.log("Level1 function invoked");
  this.numBalls = 20;
};

EG3.Level1.constructor = EG3.Level1;


EG3.Level1.prototype = new EG3.Level();







