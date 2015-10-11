// var lastTime;
// function main(){
// 	var now = Date.now();
// 	var dt = (now - lastTime) / 1000.0;

// 	update(dt);
// 	render();

// 	lastTime = now;
// 	requestAnimFrame(main);
// }

var canvas = document.getElementById("theCanvas");
var ctx = canvas.getContext("2d");

var ship = {
	height: 70,
	width: 40,
	y: (canvas.height - 70)/2,
	x: 20,
};

var shots = [];

// var shotY = ship.y;
// var shotX = ship.x;
var rockY = Math.floor(Math.random() * canvas.height);
var rockX = canvas.width;
var dx = 2;
var dy = 2;
var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;

var rock = {
	radius: Math.floor(Math.random() * 60),
	x: canvas.width,
	y: Math.floor(Math.random() * canvas.height)
};

var rocks = [];
var rockRadius = Math.floor(Math.random() * 60);
var rockX = canvas.width;
var rockY = Math.floor(Math.random() * canvas.height);

var Rock = function(radius, x, y){
	this.radius = radius;
	this.x = x;
	this.y = y
}

function addRock(){
	// radius = Math.floor(Math.random() * 60);
	// x = canvas.width;
	// y = Math.floor(Math.random() * canvas.height);
	var newRock = new Rock(rockRadius, rockX, rockY);
	console.log(newRock.radius)
	rocks.push(newRock);
}

// function rocktoRocks(rock){
// 	rocks.push(rock);
// }

function drawRock(){
	
	// for(var i = 0; i < rocks.length; i++){
	ctx.beginPath();
	ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI*2);
	ctx.fillStyle = "#0095DD";
	ctx.fill();
	ctx.closePath();
	// addRock();
	// }
}

function drawShip(){
	ctx.beginPath();
	ctx.rect(ship.x, ship.y, ship.width, ship.height);
	ctx.fillStyle = "#0095DD";
	ctx.fill();
	ctx.closePath();
}

var Shot = function(x, y){
	this.x = x;
	this.y = y
}

function addShot(){
	var newShot = new Shot(ship.x, ship.y);
	console.log(newShot);
	shots.push(newShot);
}

function drawShot(){	
	// shot.x = ship.x;
	// shot.y = ship.y;
	var shot = {
	radius: 5,
	y: ship.y + ship.height/2,
	x: ship.x + ship.width/2
	}

	ctx.beginPath();
	ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI*2);
	ctx.fillStyle = "#95DD00";
	ctx.fill();
	ctx.closePath();
}

function fire(){
    if (spacePressed){
    	console.log('fire');
    	drawShot();
    	addShot();
    	// for (var i = shotX; i < canvas.width; i += 7){
    	// shot.x += 7;
    	// }
    }
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRock();
	rock.x -= dx;
	drawShip();
	fire();

	if (rightPressed && ship.x < canvas.width-ship.width){
    	ship.x += 7;
    } else if (leftPressed && ship.x > 0){
    	ship.x -= 7;
    }
    if (upPressed && ship.y > 0){
    	ship.y -= 7;
    } 
    else if (downPressed && ship.y < canvas.height-ship.height){
    	ship.y += 7;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
    else if(e.keyCode == 38) {
    	upPressed = true
    } 
    else if(e.keyCode == 40) {
    	downPressed = true
    }
    else if(e.keyCode == 32) {
    	spacePressed = true
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
    else if(e.keyCode == 38) {
    	upPressed = false
    } 
    else if(e.keyCode == 40) {
    	downPressed = false
    }
    else if(e.keyCode == 32) {
    	spacePressed = false
    }
}

setInterval(draw, 10);