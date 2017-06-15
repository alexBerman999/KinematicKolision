/*global Vector*/

var Ball = function(pos, vel, radius, isFriendly) {
  this.pos = pos;
  this.vel = vel;
  this.radius = radius;
  this.isFriendly = isFriendly;
};

Ball.prototype.update = function() {
	this.pos.x += this.vel.x;
	this.pos.y += this.vel.y;
};

Ball.prototype.collide = function(ball) {
  var newVel = new Vector(ball.pos.x - this.pos.x, ball.pos.y - this.pos.y);
  newVel.setMagnitude(this.vel.getMagnitude() * 1.1);
  if(newVel.y > 0)
  {
    console.log(newVel.y);
    newVel.y *= -1;
  }
  
  ball.vel = newVel;
  ball.radius = 20;
  this.radius = 20;
  ball.isFriendly = true;
}