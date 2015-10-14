// var lastTime;
// function main(){
// 	var now = Date.now();
// 	var dt = (now - lastTime) / 1000.0;

// 	update(dt);
// 	render();

// 	lastTime = now;
// 	requestAnimFrame(main);
// }

//////YOUTUBE TUTORIAL///////

// var timer = window.setInterval(callAnimation, 50);

var canvas = document.getElementById("theCanvas");
var ctx = canvas.getContext("2d");

var startTime;
var now = Date.now();
var dt;
var rockRate = 1000;

// window.requestAnimFram = (function (callback){
// 	return window.requestAnimationFrame || 
// 	window.webkitRequestAnimationFrame || 
// 	window.mozRequestAnimationFrame || 
// 	window.oRequestAnimationFrame ||
// 	window.msRequestAnimationFrame ||
// 	function (callback) {
// 		window.setTimeout(callback, 1000 / 60);
// 	};
// })();

// function callAnimation(){
// 	requestAnimationFrame(function(){
// 		animate(draw, canvas, context);
// 	});
// }


var printState = function() {
	console.log(ship);
	console.log(shots);
	console.log(rocks);
	console.log(hitRocks);
}

//////

var ship = {
	height: 70,
	width: 40,
	y: (canvas.height - 70)/2,
	x: 20,
	lives: 3
};



var shots = [];


var dx = 2;
var dy = 2;
var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;
// var isGameOver = function(){
// 	if (ship.lives === 0) {
// 		return true;
// 	}
// }
var isGameOver;

var rocks = [];
var hitRocks = [];

var isInvincible = false;

var Rock = function(radius, x, y){
	this.radius = radius;
	this.x = x;
	this.y = y;
	this.width = radius * 2;
	this.height = radius * 2;
	this.vertShift = 0;
}

var Shot = function(x, y){
	this.radius = 5;
	this.x = x;
	this.y = y;
	this.width = 10;
	this.height = 10;
	// move = function(){
	// 	this.x += 7
	// }
}

setInterval(function(){
	if (dx < 9) dx++;
}, 10000);


//MAIN LOOP
var game;

function startGame(){
	createRocks(Infinity);
	drawShip();
	run();
}

var pause = function() {
	clearInterval(game);
}

var run = function() {
    game = setInterval(gameLoop, 10);
	startTime = now;
	isGameOver = false;
}


var finalScore;



startGame();

var score = 0;
document.getElementById('score').innerHTML = score;
var life = document.getElementsByClassName('life');

function drawRock(){
	
	rocks.forEach(function(rock){
		ctx.beginPath();
		ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI*2);
		ctx.fillStyle = "#0095DD";
		ctx.fill();
		ctx.closePath();
	});
}

var shipColor = "#0095DD";

function drawShip(){
	ctx.beginPath();
	ctx.rect(ship.x, ship.y, ship.width, ship.height);
	ctx.fillStyle = shipColor;
	ctx.fill();
	ctx.closePath();
}

function drawShot(){	

	shots.forEach(function(shot){
		ctx.beginPath();
		ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI*2);
		ctx.fillStyle = "#95DD00";
		ctx.fill();
		ctx.closePath();
	});
	// shot.move();
}

function gameLoop(){
	now = Date.now();
	var dt = (now-startTime)/1000;
	// console.log(dt);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.fill;
	// console.log(hitRocks);
	// console.log(isInvincible);
	
	//SCORE-KEEPING
	document.getElementById('score').innerHTML = score;
	
	drawRock();
	drawShip();
	drawShot();

	console.log(rocks);

	//SHOOTING
	if (spacePressed && shots.length <= 1){
		fireShots();
	}

	//ROCK MOVEMENT
	for(var i = 0; i < rocks.length; i++){
		rocks[i].x -= dx;
		rocks[i].y += rocks[i].vertShift;
		if (rocks[i].x < 0-rocks[i].radius) {
			if (isGameOver === false) score += Math.round(100 * rocks[i].radius);
			rocks.splice(rocks[i], 1);
			if (hitRocks.indexOf(rocks[i])) {
				hitRocks = [];
			}
		}	
	}

	//SHOT MOVEMENT
	for (i = 0; i < shots.length; i++){
		shots[i].x += 7;
		// console.log(shots);
		if (shots[i].x > canvas.width+shots[i].radius) {
			shots.splice(shots[i], 1);
		}
	}

	//WHEN ROCKS GET HIT
	for(i = 0; i < shots.length; i++) {
		// var hit = false;
		for (var j = 0; j < rocks.length; j++){
			if (shotHit(shots[i], rocks[j])){
				// console.log('boom');
				shots.splice(shots[i], 1);
				hitRock(rocks[j]);
				// hit = true;
				break;
			}
		}
	}

	//WHEN PLAYER GETS HIT
	for(i = 0; i < rocks.length; i++){
		if (playerHit(ship, rocks[i]) && isInvincible === false && isGameOver === false){
			// console.log('collision');
			death();
			resetGame();
		}
	}

	//STEERING CONTROLS
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

    invincible();
    gameOver();
}

function hitRock(rock){
	rock.radius = rock.radius / 2;
	rock.vertShift = -1;
	score += Math.round(50 * rock.radius);
	var newRock = new Rock(rock.radius, rock.x, rock.y);
	newRock.vertShift = -rock.vertShift;
	// console.log(rocks);
	rocks.push(newRock);
	hitRocks.push(newRock);
	hitRocks.push(rock);
	// console.log(hitRocks)
}

var playerHit = function(player, enem) {
	return !(player.x + player.width < enem.x - enem.radius ||
			 player.y + player.height < enem.y - enem.radius ||
			 player.x > enem.x + enem.radius ||
			 player.y > enem.y + enem.radius);
};

var shotHit = function(shot, rock) {
	return !(shot.x + shot.width < rock.x - rock.radius ||
			 shot.y + shot.height < rock.y - rock.radius ||
			 shot.x > rock.x + rock.radius ||
			 shot.y > rock.y + rock.radius);
};

function createRocks(numRocks){
	var radius = Math.floor(Math.random() * (80 - 20)) + 20;
	var x = canvas.width + radius;
	var y = Math.floor(Math.random() * (canvas.height-radius)) + (canvas.height+radius);
	var rock = new Rock(radius, x, y);

	// rocks.push(rock);
	
	var timerId = setInterval(function() {
		
		if (numRocks > rocks.length){
			var radius = Math.floor(Math.random() * (80 - 20)) + 20;
			var x = canvas.width;
			var y = Math.floor(Math.random() * canvas.height);
			var rock = new Rock(radius, x, y);
			rocks.push(rock);
		} else {
			clearInterval(timerId);
		}
		// console.log(rocks);
	}, rockRate);
}

var shotFired = false;

function fireShots(){
	if (!shotFired){
		var radius = 5;
		var y = ship.y + ship.height/2;
		var x = ship.x + ship.width;
		var shot = new Shot(x, y);
		shots.push(shot);
		shotFired = true;
		setTimeout(function(){
			shotFired = false;
		}, 100);
	}
}

function invincible(){
	if (hitRocks.length >= 12){
		isInvincible = true;
		canvas.style.background = "url(/assets/giphy.gif) repeat fixed center";
		var timerId = window.setTimeout(function(){
			canvas.style.background = "black";
			isInvincible = false;
		}, 10000)
	}
}

function death(){
	ship.lives -= 1;
	life[ship.lives].style.display = "none";
	console.log(ship.lives);	
}

function resetGame(){
	rocks = [];
	hitRocks = [];
	ship.y = (canvas.height - 70)/2;
	ship.x = 20;
	isGameOver = false;
}

function gameOver(){
	var youLose = document.getElementById('gameOver');
	if (ship.lives < 1) {
		isGameOver = true;
		youLose.style.display = "block";
		var timerId = setTimeout(function(){
			if (spacePressed){
				resetGame();
				ship.lives = 3;
				score = 0;
				dx = 2;
				youLose.style.display = "none";
				life[0].style.display = "inline-block";
				life[1].style.display = "inline-block";
				life[2].style.display = "inline-block";
			}
		}, 1000);
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
    	spacePressed = true;
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