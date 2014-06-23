var EG3 = EG3 || {};

EG3.Level1 = function() {
  //Data members here
  this.balls;
  this.playerBody;
  this.playerEye;  
}

EG3.Level1.prototype = {
  preload: function() {
    console.log("Level1.preload");
  },
  create: function() {
    console.log("Level1.create");

    this.game.add.sprite(0,0,"bg");
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.createBalls();
    
    //For reasons I don't understand if I start them out at the same point the second
    //image is a green box.  I'd seen this before.  It seems to work if I move them back 
    this.playerBody = this.game.add.sprite(100, 100, 'playerBody');
    this.playerBody.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.playerBody, Phaser.Physics.ARCADE); 
    
    this.playerEye = this.game.add.sprite(0, 0, 'playerEye');
    this.playerEye.anchor.setTo(0.5, 0.5);   
    this.game.physics.enable(this.playerEye, Phaser.Physics.ARCADE);    
    
    this.playerEye.x = this.playerBody.x;      
    this.playerEye.y = this.playerBody.y;    
    
  },
  update: function() {
    //Useful thing which shows the bounding box of the sprite
//    this.game.debug.body(this.playerEye);
    this.game.physics.arcade.collide(this.balls);
    
    this.playerEye.rotation = this.game.physics.arcade.angleToPointer(this.playerEye);    
  },
  createBalls: function() {
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
  }
};
