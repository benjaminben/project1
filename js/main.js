var Rock = function(radius, x, y){
	this.radius = radius;
	this.x = x;
	this.y = y;
	this.width = radius * 2;
	this.height = radius * 2;
	this.vertShift = 0;
	this.hit = false;
	this.animX = 0;
	this.animY = 0;
	this.count = 0;
}

Rock.prototype.drawSprite = function() {
	this.animX = (this.count % 8) * 128;
	this.animY = Math.floor(this.count / 8) * 128;
	ctx.drawImage(img, this.animX, this.animY, 128, 128, this.x - this.radius * 1.5, this.y - this.radius * 1.5, this.radius * 3, this.radius * 3);
	if(this.count == 32)
		this.count = 0;
	else
		this.count++
}

var Shot = function(x, y){
	this.radius = 5;
	this.x = x;
	this.y = y;
	this.width = 10;
	this.height = 10;
}

var canvas = document.getElementById("theCanvas");
var ctx = canvas.getContext("2d");

var dx = 2;
var dy = 2;
var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;
var pPressed = false;
var life = document.getElementsByClassName('life');
var marquee = document.getElementById('marquee');
var marqueeUpper = document.getElementById('marquee-upper')
var marqueeLower = document.getElementById('marquee-lower');
var isPaused = false;
var isGameOver = false;
var isIntro = true;
var isInvincible = false;
var score = 0;
var finalScore;
var highScore = localStorage.getItem("highScore");

var rocks = [];
var hitRocks = 0;
var rockRate = 2000;
var pausedRockRate;

var shots = [];
var shotFired = false;

var ship = {
	height: 70,
	width: 40,
	y: (canvas.height - 70)/2,
	x: 20,
	lives: 3
};

var arkitect = new Audio('./assets/arkitect.mp3');
var speaker = document.getElementById('speaker');

if (!localStorage.getItem("playSound")) {
	localStorage.setItem("playSound", true)
};

function initSound() {
	if (localStorage.getItem("playSound") === "true") {
		arkitect.volume = 1;
		speaker.innerHTML = "<img src='./assets/speaker_on.png'></img>";
		arkitect.play();
	} else {
		arkitect.volume = 0;
		speaker.innerHTML = "<img src='./assets/speaker_off.png'></img>";
		arkitect.play();
	}
}

var count = 0;
var img = new Image();
img.src = "./assets/asteroid_sprites.png";

var game;
var startTime;
var now = Date.now();

setInterval(function(){
	if (dx < 8) dx++;
}, 10000);
setInterval(function(){
	if (rockRate > 300) rockRate -= 100;
}, 5000);

function intro() {
	modal("SMOKE ROCKS", "(in space)", instructions);
};

function instructions() {
	modal("move: arrows<br>fire: space<br>pause: p", "<br>hit rocks for<br>INVINCIBILITY", isIntro ? startGame : run);
	isIntro = false;
};

var modal = function(upper, lower, next) {
	marquee.style.display = "block";
	marqueeUpper.innerHTML = upper;
	marqueeLower.innerHTML = lower;

	var nextHandler = function(e) {
		if(e.keyCode == 32) {
	    	document.removeEventListener("keydown", nextHandler, false);
	    	next();
	    }
	};
	document.addEventListener("keydown", nextHandler, false);
}

// var pause = function() {
// 	game = clearInterval(game);
// 	pausedRockRate = rockRate;
// 	instructions();
// }

// var pauseGame = function(e) {
// 	if (e.keyCode == 80) {
// 		isPaused = true;
// 		pause();
// 	}
// }

// var unpauseGame = function(e) {
// 	if (e.keyCode == 80 && isPaused == true) {
// 		isPaused = false;
// 		rockRate = pausedRockRate;
// 	}
// }

function pauseGame(e) {
	if (e.keyCode == 80) {
		if (!isPaused) {
			game = clearInterval(game);
			isPaused = true;
			marqueeUpper.innerHTML = "move: arrows<br>fire: space<br>pause: p";
			marqueeLower.innerHTML = "<br>hit rocks for<br>INVINCIBILITY";
			marquee.style.display = "block"
			console.log(marqueeUpper);
			songDataEnter();
		} else if (isPaused) {
			game = setInterval(gameLoop, 10);
			isPaused = false;
			marquee.style.display = "none";
			songDataExit();
		}
	}
}

function startGame(){
	marquee.style.display = "none";
	rockRate = 2000;
	dx = 2;
	createRocks(Infinity);
	drawShip();
	run();
	initSound();
	songDataEnter();
	setTimeout(function() {
		songDataExit();
	}, 3000)
}

var run = function() {
	marquee.style.display = "none";
  game = setInterval(gameLoop, 10);
	startTime = now;
	isGameOver = false;
}

document.getElementById('score').innerHTML = score;

function drawRocks(){
	rocks.forEach(function(rock){
		ctx.beginPath();
		rock.drawSprite();
		ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI*2);
		ctx.closePath();
	})
}

function drawShip(){
	var shipSprite = document.createElement('img');
	shipSprite.src = "./assets/ship_sprite.png";
	ctx.beginPath();
	ctx.rect(ship.x, ship.y, ship.width, ship.height);
	ctx.drawImage(shipSprite, ship.x - 10, ship.y, ship.width + 20, ship.height);
	ctx.closePath();
}

function drawShot(){
	shots.forEach(function(shot){
		ctx.beginPath();
		ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI*2);
		ctx.fillStyle = "#D1FFFF";
		ctx.fill();
		ctx.closePath();
	});
}

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

function hitRock(rock, idx){
	rock.radius = rock.radius / 2;
	rock.vertShift = -1;
	if (!rock.hit) hitRocks++;
	rock.hit = true;
	score += Math.round(50 * rock.radius);
	var newRock = new Rock(rock.radius, rock.x, rock.y);
	newRock.vertShift = -rock.vertShift;
	newRock.hit = true;
	hitRocks++;
	rocks.splice(idx, 0, newRock);
}

function createRocks(numRocks){
	var radius = Math.floor(Math.random() * (80 - 20)) + 20;
	var x = canvas.width + radius;
	var y = Math.floor(Math.random() * (canvas.height-radius)) + (canvas.height+radius);
	var rock = new Rock(radius, x, y);

	setTimeout(createRock, rockRate);
	function createRock(){
		if (numRocks > rocks.length){
			var radius = Math.floor(Math.random() * (80 - 20)) + 20;
			var x = canvas.width+radius;
			var y = Math.floor(Math.random() * canvas.height);
			var rock = new Rock(radius, x, y);
			rocks.push(rock);
			setTimeout(createRock, rockRate);
		}
	}
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

function invincible(){
	isInvincible = true;
	canvas.style.background = "url('./assets/giphy.gif')";
	canvas.style.backgroundSize = "cover";
	var timerId = setTimeout(function(){
		canvas.style.background = "url('./assets/stars.jpg')";
		canvas.style.backgroundSize = "cover";
		isInvincible = false;
	}, 10000)
}

function death(){
	ship.lives -= 1;
	life[ship.lives].style.display = "none";
}

function resetRound(){
	rocks = [];
	hitRocks = 0;
	ship.y = (canvas.height - 70)/2;
	ship.x = 20;
	isGameOver = false;
}

function resetGame(){
	rocks = [];
	hitRocks = 0;
	ship.y = (canvas.height - 70)/2;
	ship.x = 20;
	isGameOver = false;
	ship.lives = 3;
	score = 0;
	dx = 2;
	rockRate = 2000;
	marquee.style.display = "none";
	life[0].style.display = "inline-block";
	life[1].style.display = "inline-block";
	life[2].style.display = "inline-block";
	// songDataExit();
}

function getUserInfo() {
	ship.lives = 3;
	marqueeUpper.innerHTML = "WAIT!<br>ONE THING:"
	marqueeLower.innerHTML = "save score? enter name:" + "<br>" +
													 "<form id='saveNameForm'>" +
													 	"<input id='nameInput' placeholder='name goes here'>" +
													 	"</input></form>";
	var input = document.getElementById("nameInput");
	input.setAttribute('size',input.getAttribute('placeholder').length);
	$("#saveNameForm").submit(function() {
		storeName();
		resetGame();
		return false;
	})
}

function storeName() {
	var userName = document.getElementById("nameInput").value;
	localStorage.setItem("userName", userName);
}

function setHighScore() {
		finalScore = score;
		if (finalScore > highScore || highScore === null) {
			localStorage.setItem("highScore", finalScore)
			highScore = localStorage.getItem("highScore");
		}
}

function gameOver(){
	isGameOver = true;
	setHighScore();
	marquee.style.display = "block";
	marqueeUpper.innerHTML = "GAME OVER";
	marqueeLower.innerHTML = "(space to reset)";
	showSongData = true;
	songDataEnter();
	var timerId = setTimeout(function(){
		if (spacePressed){
			if (localStorage.getItem('userName')) {
				songDataExit();
				resetGame();
			} else {
				getUserInfo();
			}
		}
	}, 1000);
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
    else if(e.keyCode == 80) {
    	pPressed = true;
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
    else if(e.keyCode == 80) {
    	pPressed = false;
    }
}


document.addEventListener("keydown", pauseGame, false);

arkitect.addEventListener('ended', function(){
	this.currentTime = 0;
	this.play();
}, false);

function toggleSound() {
	if (localStorage.getItem("playSound") === "true") {
		arkitect.volume = 0;
		localStorage.setItem("playSound", "false");
		speaker.innerHTML = "<img src='./assets/speaker_off.png'></img>"
	} else {
		arkitect.volume = 1;
		localStorage.setItem("playSound", "true");
		speaker.innerHTML = "<img src='./assets/speaker_on.png'></img>"
	}
}

speaker.addEventListener('click', function(){
	toggleSound();
})

function gameLoop(){
	now = Date.now();
	var dt = (now-startTime)/1000;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fill;

	//SCORE-KEEPING
	document.getElementById('score').innerHTML = score;

	drawRocks();
	drawShip();
	drawShot();

	//SHOOTING
	if (spacePressed){
		fireShots();
	}

	//ROCK MOVEMENT
	for(var i = 0; i < rocks.length; i++){
		rocks[i].x -= dx;
		rocks[i].y += rocks[i].vertShift;
		if (rocks[i].x < 0-rocks[i].radius) {
			if (!isGameOver) score += Math.round(100 * rocks[i].radius);
			if (rocks[i].hit){
				hitRocks--;
			}
			if(rocks[i])
			rocks.splice(rocks[i], 1);
		}
	}

	//SHOT MOVEMENT
	for (i = 0; i < shots.length; i++){
		shots[i].x += 7;
		if (shots[i].x > canvas.width+shots[i].radius) {
			shots.splice(shots[i], 1);
		}
	}

	//WHEN ROCKS GET HIT
	for(i = 0; i < shots.length; i++) {
		for (var j = 0; j < rocks.length; j++){
			if (shotHit(shots[i], rocks[j])){
				shots.splice(shots[i], 1);
				hitRock(rocks[j], j);
				break;
			}
		}
	}

	//WHEN PLAYER GETS HIT
	for(i = 0; i < rocks.length; i++){
		if (playerHit(ship, rocks[i]) && isInvincible === false && isGameOver === false && rocks[i].radius >= 4){
			death();
			resetRound();
		}
	}

	//STEERING CONTROLS
	if (rightPressed && ship.x < canvas.width-ship.width){
    	ship.x += 6;
    } else if (leftPressed && ship.x > 0){
    	ship.x -= 6;
    }
    if (upPressed && ship.y > 0){
    	ship.y -= 6;
    }
    else if (downPressed && ship.y < canvas.height-ship.height){
    	ship.y += 6;
    }

  if (hitRocks >= 15){
		invincible();
	}

  if (ship.lives < 1) {
    gameOver();
	}

}

intro();

var songData = document.getElementById('songData');

var right = $('#songData').offset().right

var showSongData = false;

function songDataEnter(){
	showSongData = true;
	$('#songData').css({right:right}).animate({right: '0px'}, "slow");
}

function songDataExit(){
	showSongData = false;
	$('#songData').css({right:right}).animate({right: '-200px'}, "slow");
	console.log('fur');
}
