// Setup
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var midX = canvas.width / 2;
var midY = canvas.height / 2; 

var earthMass = 5.972 * Math.pow(10, 24);
var gravConst = 6.67 * Math.pow(10, -11);


// Vector //////////////////////////////////////////////////////////////////////////
function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype.add = function(vector) {
  this.x += vector.x;
  this.y += vector.y;
};

Vector.prototype.getMagnitude = function () {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getAngle = function () {
  return Math.atan2(this.y,this.x);
};

Vector.fromAngle = function (angle, magnitude) {
  return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

// Body ////////////////////////////////////////////////////////////////////////

// celestial body mass is in units of earthMass
function CelestialBody(position, velocity, acceleration, relMass, size, color) {
	this.position = position || new Vector(midX, midY); // A vector co-ordinate
	this.velocity = velocity || new Vector(0,0); 
	this.acceleration = acceleration || new Vector(0,0); 
	this.relMass = relMass || 1; // Mass in earth mass where 1 = 1* earth mass
	this.actualMass = relMass * 10; 
	this.size = size || 1;
	this.color = color || '#999';
}

CelestialBody.prototype.applyForces = function(bodies){
	// our starting acceleration this frame
  	var totalAccelerationX = 0;
  	var totalAccelerationY = 0; 

  	// for each body
  	for(i = 0; i < bodies.length; i++) {
  		var body = bodies[i];
		if (body == this) continue; // don't compare to self

  		// find the distance between this and body
  		var distX = body.position.x - this.position.x;
  		var distY = body.position.y - this.position.y;

  		// calculate the force G * m1 * m2 / d^2
  		var force = body.actualMass / Math.pow(distX*distX + distY*distY, 1.5);

  		// calculate acceleration
  		totalAccelerationX += distX * force;
  		totalAccelerationY += distY * force;
  	}
  	this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);
};

CelestialBody.prototype.move = function() {
	this.velocity.add(this.acceleration);
	this.position.add(this.velocity);
};

// Update /////////////////////////////////////////////////////////////////////////
function plotBodies(boundsX, boundsY) {
	// All bodies within bounds
	var currentBodies = [];

	for (var i = 0; i < bodies.length; i++) {
		var body = bodies[i];
		var pos = body.position;

		// If we're out of bounds, drop this particle and move on to the next
    	if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;

    	// Apply all bodies forces to this body
    	body.applyForces(bodies);
	
    	// Move body
    	body.move();

    	// Add the body to the current list of bodies
    	currentBodies.push(body);
	}

	// Update active bodies
	bodies = currentBodies;
}

// Drawing ////////////////////////////////////////////////////////////////////////
function drawCircle(body) {
	// Draw the body as a 2d circle
	  ctx.fillStyle = body.color;
	  ctx.beginPath();
      ctx.arc(body.position.x, body.position.y, body.size, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.fill();
}

// Simulation //////////////////////////////////////////////////////////////
var rem = 0.01; // relative mass of earth
var rev = 0.75; // relative velocity of earth around sun
var AU = 150; // distance of earth from the sun 

var sun  = new CelestialBody(
	new Vector(midX, midY), new Vector(0,0), new Vector(0,0), rem*1000, 15, '#ffff00');

var mercury = new CelestialBody(
	new Vector(midX+0.4*AU, midY), new Vector(0,rev*1.59), new Vector(0,0), rem*0.0553, 3, '#663399');

var venus = new CelestialBody(
	new Vector(midX+0.7*AU, midY), new Vector(0,rev*1.176), new Vector(0,0), rem*0.815, 3, '#ff9966');

var earth = new CelestialBody(
	new Vector(midX+AU, midY), new Vector(0,rev), new Vector(0,0), rem, 5, '#0000ff');

var mars = new CelestialBody(
	new Vector(midX+1.5*AU, midY), new Vector(0,rev*0.808), new Vector(0,0), rem*0.107, 5, '#FE5A1D');

var bodies = [
	sun,
	mercury,
	venus,
	earth,
	mars
];

function loop() {
  clear();
  update();
  draw();
  queue();
}

function clear() {
  	ctx.clearRect(0, 0, canvas.width, canvas.height);
  
}

function update() {
  	plotBodies(canvas.width, canvas.height);
}

function draw() {
	//ctx.font = '30px Arial';
  	//ctx.fillText("Earth X: " + earth.position.x + ", Y: " + earth.position.y, 10, 50);
  	//ctx.fillText("Accel X: " + earth.acceleration.x + ", Y: " + earth.acceleration.y, 10, 80);
  	//ctx.fillText("Mass : " + earth.relMass, 10, 110);
  	bodies.forEach(drawCircle);
 }

function queue() {
  	window.requestAnimationFrame(loop);
}

loop();