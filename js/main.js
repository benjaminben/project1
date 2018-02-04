var baseUrl = '/api'
var srisSelected = true;

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
  this.drawSprite = function() {
		this.animX = (this.count % 8) * 128;
		this.animY = Math.floor(this.count / 8) * 128;
		ctx.drawImage(img, this.animX, this.animY, 128, 128, this.x - this.radius * 1.5, this.y - this.radius * 1.5, this.radius * 3, this.radius * 3);
		if(this.count == 32)
			this.count = 0;
		else
			this.count++
  }
}

var Shot = function(x, y){
  this.x = x;
  this.y = y;
  this.width = 12;
  this.height = 4;
}

var canvas = document.getElementById("canvas");
canvas.width = canvas.scrollWidth;
canvas.height = canvas.scrollHeight;
var ctx = canvas.getContext("2d");

var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;
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
var scores = [];

var rocks = [];
var hitRocks = 0;
var rockRate = 2000;
var pausedRockRate;
var initialRockVelocity = 2;
var rockVelocity = initialRockVelocity;

var shots = [];
var shotFired = false;

var ship = {
  height: 50,
  width: 50,
  lives: 3
};
var shipVelocity = 6

var shipSprite = document.createElement('img');
shipSprite.src = "/assets/ship_sprite.png";
var shipInvSprite = document.createElement('img');
shipInvSprite.src = "/assets/ship_sprite_invincible.png";
var giphy = "/assets/giphy.gif",
    starsBg = "/assets/stars.jpg"

var arkitect = new Audio('/assets/arkitect.mp3');
var speaker = document.getElementById('speaker');

if (!localStorage.getItem("playSound")) {
  localStorage.setItem("playSound", true)
};

function initSound() {
  if (localStorage.getItem("playSound") === "true") {
    arkitect.volume = 1;
    speaker.innerHTML = "<img src='/assets/speaker_on.png'></img>";
    arkitect.play();
  } else {
    arkitect.volume = 0;
    speaker.innerHTML = "<img src='/assets/speaker_off.png'></img>";
    arkitect.play();
  }
}

var count = 0;
var img = new Image();
img.src = "/assets/asteroid_sprites.png";

var game;
var startTime;
var now = Date.now();

setInterval(function(){
  if (rockVelocity < 10 && !isPaused) rockVelocity += 1;
}, 10000);
setInterval(function(){
  if (rockRate > 300 && !isPaused) rockRate -= 100;
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
		if(e.keyCode == 32 && srisSelected) {
        document.removeEventListener("keydown", nextHandler, false);
        next();
      }
  };
  document.addEventListener("keydown", nextHandler, false);
}

function getScores() {
  $.ajax({
    method: 'GET',
    url: baseUrl + '/scores',
    success: function(res) {
      scores = res.scores;
    },
    error: function(res) {
      console.log(res)
    }
  })
}

function postScore(name, score) {
	$.ajax({
    method: 'POST',
    url: baseUrl + '/scores',
    contentType: 'application/json',
    data: JSON.stringify({name: name, score: score}),
    success: function(res) {
			console.log('posted', res)
    },
    error: function(res) {
      console.log(res)
    }
  })
}

function pauseGame(e) {
  if (!isPaused) {
    // game = clearInterval(game);
		game = cancelAnimationFrame(game)
    isPaused = true;
    marqueeUpper.innerHTML = "move: arrows<br>fire: space<br>pause: p";
    marqueeLower.innerHTML = "<br>hit rocks for<br>INVINCIBILITY";
    marquee.style.display = "block"
    songDataEnter();
  } else if (isPaused) {
    // game = setInterval(gameLoop, 10);
    game = requestAnimationFrame(gameLoop)
    isPaused = false;
    marquee.style.display = "none";
    songDataExit();
  }
}

function startGame(){
  getScores()
  marquee.style.display = "none";
  ship.y = (canvas.height - ship.height)/2;
  ship.x = 20;
  rockRate = 2000;
  rockVelocity = initialRockVelocity;
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
  // game = setInterval(gameLoop, 10);
	game = requestAnimationFrame(gameLoop);
  startTime = now;
  isGameOver = false;
}

function resize(canvas) {
  if (canvas.width  != canvas.scrollWidth ||
      canvas.height != canvas.scrollHeight) {

    canvas.width  = canvas.scrollWidth;
    canvas.height = canvas.scrollHeight;
  }
}

document.getElementById('score').innerHTML = score;

function drawRocks(){
  rocks.forEach(function(rock){
    ctx.beginPath();
    rock.drawSprite();
    ctx.closePath();
  })
}

function drawShip(){
  ctx.beginPath();
  ctx.drawImage(
		isInvincible ? shipInvSprite : shipSprite,
		ship.x,
		ship.y,
		ship.width,
		ship.height
	);
  ctx.closePath();
}

function drawShot(){
  var shotSprite = document.createElement('img');
  shots.forEach(function(shot){
    ctx.beginPath();
		ctx.fillStyle = '#98d5b5';
    ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
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
    if( !isPaused ){
      var radius = Math.floor(Math.random() * (80 - 20)) + 20;
      var x = canvas.width+radius;
      var y = Math.floor(Math.random() * canvas.height);
      var rock = new Rock(radius, x, y);
      rocks.push(rock);
    }
    setTimeout(createRock, rockRate);
  }
}

var playerHit = function(player, enem) {
  return !( player.x + player.width < enem.x - enem.radius ||
            player.y + player.height < enem.y - enem.radius * 0.8 ||
            player.x > enem.x + enem.radius ||
            player.y > enem.y + enem.radius * 0.8 );
};

var shotHit = function(shot, rock) {
  return !(shot.x + shot.width < rock.x - rock.radius ||
       shot.y + shot.height < rock.y - rock.radius ||
       shot.x > rock.x + rock.radius ||
       shot.y > rock.y + rock.radius);
};

function invincible(){
  isInvincible = true;
  canvas.style.backgroundImage = "url('"+giphy+"')";
  setTimeout(function(){
    canvas.style.backgroundImage = "url('"+starsBg+"')";
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
  rockVelocity = initialRockVelocity;
  rockRate = 2000;
  marquee.style.display = "none";
  life[0].style.display = "inline-block";
  life[1].style.display = "inline-block";
  life[2].style.display = "inline-block";
}

function gameOver(){
  isGameOver = true;

  marquee.style.display = "block";
  marqueeUpper.innerHTML = "GAME OVER";
  marqueeLower.innerHTML = "<input maxlength='3' type='text' id='initialField' placeholder='initials'></input><br/><span id='scoreSubmit'>submit score</span>";
  showSongData = true;
  songDataEnter();

  var submit = document.querySelector('#scoreSubmit');
  submit.addEventListener('click', function(e){
    var initials = document.getElementById('initialField').value;
    while( initials.length > 3 ){
      initials += ' '
    }

    postScore(initials, score);

    scores.push({name: initials, score: score});
    scores.sort(function(a,b){
      if( a.score > b.score ) return -1;
      if( a.score < b.score ) return 1;
      return 0
    });
    while( scores.length > 10 ){
      scores.pop()
    }

    var scoresHTML = scores.map(function(s){
          return '<span class="score">'+s.name+': '+s.score+'</span>'
        }).join('');

    showScores(scoresHTML);

    e.target.removeEventListener(e.type, arguments.callee);
  });
}

function showScores(html){
  marqueeUpper.innerHTML = '';
  marqueeLower.innerHTML = html + '<br/><span>(space to restart)</span>';

  document.addEventListener("keyup", function(e){
    if( e.keyCode == 32 ){
      resetGame();
      document.removeEventListener(e.type, arguments.callee);
    }
  }, false)
}

document.addEventListener("keydown", function(e){
  if( srisSelected ){
    keyDownHandler(e)
  }
}, false);
document.addEventListener("keyup", function(e){
  if( srisSelected ){
    keyUpHandler(e)
  }
}, false);

function keyDownHandler(e) {
  if(e.keyCode == 39) {
    e.preventDefault();
    rightPressed = true;
  }
  else if(e.keyCode == 37) {
    e.preventDefault();
    leftPressed = true;
  }
  else if(e.keyCode == 38) {
    e.preventDefault();
    upPressed = true
  }
  else if(e.keyCode == 40) {
    e.preventDefault();
    downPressed = true
  }
  else if(e.keyCode == 32) {
    e.preventDefault();
    spacePressed = true;
  }
  else if(e.keyCode == 80 && !isGameOver) {
    e.preventDefault();
    pauseGame(e);
  }
}
function keyUpHandler(e) {
  if(e.keyCode == 39) {
    e.preventDefault();
    rightPressed = false;
  }
  else if(e.keyCode == 37) {
    e.preventDefault();
    leftPressed = false;
  }
  else if(e.keyCode == 38) {
    e.preventDefault();
    upPressed = false
  }
  else if(e.keyCode == 40) {
    e.preventDefault();
    downPressed = false
  }
  else if(e.keyCode == 32) {
    e.preventDefault();
    spacePressed = false
  }
}

arkitect.addEventListener('ended', function(){
  this.currentTime = 0;
  this.play();
}, false);

function toggleSound() {
  if (localStorage.getItem("playSound") === "true") {
    arkitect.volume = 0;
    localStorage.setItem("playSound", "false");
    speaker.innerHTML = "<img src='/assets/speaker_off.png'></img>"
  } else {
    arkitect.volume = 1;
    localStorage.setItem("playSound", "true");
    speaker.innerHTML = "<img src='/assets/speaker_on.png'></img>"
  }
}

speaker.addEventListener('click', function(){
  toggleSound();
})

function gameLoop(){
  if( isPaused ){
    return false
  }

  resize(canvas);

  now = Date.now();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fill;

  //SCORE-KEEPING
  document.getElementById('score').innerHTML = score;

  drawRocks();
  drawShip();
  drawShot();

  //SHOOTING
  if (spacePressed && !isGameOver){
    fireShots();
  }

  //ROCK MOVEMENT
  for(var i = 0; i < rocks.length; i++){
    rocks[i].x -= rockVelocity;
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
  if( !isInvincible && !isGameOver ){
    for(i = 0; i < rocks.length; i++){
      if (playerHit(ship, rocks[i]) && rocks[i].radius >= 4){
        death();
        resetRound();
      }
    }
  }

  //STEERING CONTROLS
  if (rightPressed && ship.x < canvas.width-ship.width){
      ship.x += shipVelocity;
    } else if (leftPressed && ship.x > 0){
      ship.x -= shipVelocity;
    }
    if (upPressed && ship.y > 0){
      ship.y -= shipVelocity;
    }
    else if (downPressed && ship.y < canvas.height-ship.height){
      ship.y += shipVelocity;
    }

  if (hitRocks >= 20 && !isInvincible){
    invincible();
  }

  if (ship.lives < 1 && !isGameOver) {
    gameOver();
  }

	game = requestAnimationFrame(gameLoop)
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
}

// $('#canvas').on('click', function(e){
//   e.stopPropagation();
//   srisSelected = true;
// })
// $('body').on('click', function(e){
//   if( e.target !== $('#sris') || e.target.parents("#canvas").length ){
//     if( !isPaused && !isIntro && !isGameOver ){
//       pauseGame(e);
//     }
//     // srisSelected = false;
//   }
// })

document.querySelector('#canvas')
  .addEventListener('touchend', function(){
    document.querySelector('#touchblock').style.display = 'table';
})
