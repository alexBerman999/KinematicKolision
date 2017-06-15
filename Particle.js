/*global Vector*/

var Particle = function(pos, vel, radius) {
  this.pos = pos;
  this.vel = vel;
  this.radius = radius;
};

Particle.prototype.update = function() {
	this.pos.x += this.vel.x;
	this.pos.y += this.vel.y;
	this.vel.y += 0.3;
};