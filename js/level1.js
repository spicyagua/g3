var EG3 = EG3 || {};

EG3.Level1 = function() {
  //Data members here
  this.balls;
}

EG3.Level1.prototype = {
  preload: function() {
    console.log("Level1.preload");
  },
  create: function() {
    console.log("Level1.create");

    this.game.add.sprite(0,0,"bg");
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.balls = this.game.add.group();
    this.balls.enableBody = true;

    for (var i = 0; i < 10; i++)
    {
        var s = this.balls.create(this.game.world.randomX, this.game.world.randomY, 'greenBall');
        s.name = 'greenBall' + i;
        this.game.physics.enable(s, Phaser.Physics.ARCADE);
        s.body.collideWorldBounds = true;
        s.body.bounce.setTo(0.8, 0.8);
        s.body.velocity.setTo(10 + Math.random() * 40, 10 + Math.random() * 40);
        s.body.bounce.x = 1;
        s.body.bounce.y = 1;
//        s.body.minBounceVelocity(0);      
        
    }    
    
  },
  update: function() {
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.bird);
    this.game.physics.arcade.collide(this.balls);
  },
};
