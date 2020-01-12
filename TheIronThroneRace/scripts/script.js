var gameWidth;
var gameHeight;
const numLevel = 12;
var enemies = [];
var level = 0;
var score = 0;
var timer = 10;
var safeMargin = 5;
var safeArea = 200;
var gameBoard = document.getElementById('game_board');
var player = document.getElementById('player');
var destination = document.getElementById('destination');
var levelInfo = document.getElementById('level_info');
var ScoreInfo = document.getElementById('Score_info');
var TimerInfo = document.getElementById('Timer_info');
var welcomeMessage = document.getElementById('welcome');
var mobileMessage = document.getElementById('mobile_message');
var gameHeight = gameBoard.clientHeight;
var gameWidth = gameBoard.clientWidth;
var enemyVelocityOptions = [2, 3, 4, -2, -3, -4];
var UP_KEY_PRESSED = false;
var DOWN_KEY_PRESSED = false;
var LEFT_KEY_PRESSED = false;
var RIGHT_KEY_PRESSED = false;
var gameStarted = false;
var isMobile = false;
var freezeTouchEvent = false;
var interval = null;
var confirmMsg = "תרצה/י להתחיל את המשחק מהמקום בו הפסקת פעם שעברה?";


// ---------------- Functions ----------------------------------------------//

function startGame() {
	str = "";
	counter = 1;
	charactersTmp = shuffle(characters);
	for (k in charactersTmp) {
		if (charactersTmp[k].killed && charactersTmp[k].characterImageThumb) {
			str += "<img class='enemy' data-level='" + counter + "'src='" + charactersTmp[k].characterImageThumb + "'>";
			counter++;
		}
		if (counter == numLevel)
			break;
	}
	document.getElementById("enemy-img").innerHTML = str;

	loadFromLocalStorage();
	gameStarted = true;

	if (level != 0) {
		for (var l = 1; l <= level; l++) {
			nextLevel(l);
		}
	}

	init();
	resetTimer();
	listeners();
	gameLoop();
}

// Init function
function init() {
	welcomeMessage.remove();
	player.style.top = (gameHeight - player.clientHeight - 30) + 'px';
	player.style.left = (gameWidth - player.clientWidth - 30) + 'px';
	destination.style.opacity = 1;
	player.style.opacity = 1;
	levelInfo.innerHTML = "level: " + level;
	ScoreInfo.innerHTML = "Score: " + score;
	resetTimer();
	TimerInfo.innerHTML = "Timer: " + timer;

}

// Helper function to shuffle an array
function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

// function for score - increase or decrease
function scoreHandler(action) {
	switch (action) {
		case "up":
			score += 20;
			break;
		case "down":
			score -= 10;
			break;
	}
	saveToLocalStorage();
}

// Reset timer
function resetTimer() {
	timer = 10;
	if (interval == null) {
		interval = "started";
		setInterval(function () {
			timer--;
			document.getElementById("Timer_info").innerHTML = "Timer: " + timer;
			if (timer == 0) {
				score -= 10;
				if (score <= 0) {
					window.alert("Game Over");
					location.reload();
				}
				init();
			}
		}, 1000);
	}

}

function gameLoop() {
	update();
	checkCollision();
	requestAnimationFrame(gameLoop);
}

function update() {
	var playerOffsetTop = parseInt(player.style.top);
	var playerOffsetLeft = parseInt(player.style.left);

	if (UP_KEY_PRESSED && playerOffsetTop > safeMargin) {
		player.style.top = playerOffsetTop - 7 + 'px';
	}
	if (DOWN_KEY_PRESSED && playerOffsetTop < gameHeight - player.clientHeight - safeMargin) {
		player.style.top = playerOffsetTop + 7 + 'px';
	}
	if (RIGHT_KEY_PRESSED && playerOffsetLeft < gameWidth - player.clientWidth - safeMargin) {
		player.style.left = playerOffsetLeft + 7 + 'px';
	}
	if (LEFT_KEY_PRESSED && playerOffsetLeft > safeMargin) {
		player.style.left = playerOffsetLeft - 7 + 'px';
	}

	for (var i = 0; i < enemies.length; i++) {
		enemies[i].element.style.top = parseInt(enemies[i].element.style.top) - enemies[i].directionY + 'px';
		enemies[i].element.style.left = parseInt(enemies[i].element.style.left) - enemies[i].directionX + 'px';
	}
}

function checkCollision() {
	var playerOffsetTop = parseInt(player.style.top);
	var playerOffsetLeft = parseInt(player.style.left);

	if (playerOffsetTop < (destination.offsetHeight + destination.offsetLeft) && playerOffsetLeft < (destination.offsetWidth + destination.offsetLeft)) {
		level += 1;

		scoreHandler("up");
		if (level == numLevel) {
			alert("win");
			level = 0;
			score = 0;

			resetLocalStorage();
			location.reload();
		}
		nextLevel(level);
	}

	for (var i = 0; i < enemies.length; i++) {

		var enemy = enemies[i];
		var enemyOffsetTop = parseInt(enemy.element.style.top);
		var enemyOffsetLeft = parseInt(enemy.element.style.left);

		if (enemyOffsetTop <= 0) {
			enemy.directionY *= -1;
		}
		if (enemyOffsetLeft <= 0) {
			enemy.directionX *= -1;
		}
		if (enemyOffsetTop >= gameHeight - enemy.element.clientHeight) {
			enemy.directionY *= -1;
		}
		if (enemyOffsetLeft >= gameWidth - enemy.element.clientWidth) {
			enemy.directionX *= -1;
		}
		if (playerOffsetLeft > gameWidth - safeArea && playerOffsetTop > gameHeight - safeArea) {
			continue;
		}

		if (playerOffsetLeft > enemyOffsetLeft - player.clientWidth &&
			playerOffsetLeft < enemyOffsetLeft + enemy.element.clientWidth &&
			playerOffsetTop > enemyOffsetTop - player.clientHeight &&
			playerOffsetTop < enemyOffsetTop + enemy.element.clientHeight) {
			freezeTouchEvent = true;
			scoreHandler("down");
			if (score == 0) {
				window.alert("Game Over");
				location.reload();
			}
			init();
		}
	}
}


function nextLevel(level) {
	var nextLevel = document.querySelector("[data-level='" + level + "']");
	freezeTouchEvent = true;
	if (nextLevel) {
		nextLevel.style.opacity = 1;
		nextLevel.style.top = (gameHeight * 0.5) + 'px';
		nextLevel.style.left = (gameWidth * 0.5) + 'px';
		enemies.push({
			element: nextLevel,
			directionX: enemyVelocityOptions[Math.floor(Math.random() * enemyVelocityOptions.length)],
			directionY: enemyVelocityOptions[Math.floor(Math.random() * enemyVelocityOptions.length)]
		});
	}

	init();
}

function listeners() {
	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 38: //up
				UP_KEY_PRESSED = true;
				break;
			case 40: // down
				DOWN_KEY_PRESSED = true;
				break;
			case 39: //right
				RIGHT_KEY_PRESSED = true;
				break;
			case 37: //left
				LEFT_KEY_PRESSED = true;
				break;
		}
	}

	document.onkeyup = function (e) {
		switch (e.keyCode) {
			case 38: //up
				UP_KEY_PRESSED = false;
				break;
			case 40: // down
				DOWN_KEY_PRESSED = false;
				break;
			case 39: //right
				RIGHT_KEY_PRESSED = false;
				break;
			case 37: //left
				LEFT_KEY_PRESSED = false;
				break;
		}
	}
}

gameBoard.ontouchend = function (e) {
	if (!gameStarted && e.target.id != 'whatsapp') {
		if (localStorageExists()) {
			if (confirm(confirmMsg)) {
				loadFromLocalStorage();
			}
			else {
				resetLocalStorage();
			}
		}
		startGame();
	}
}

document.onkeydown = function (e) {
	if (!gameStarted) {
		if (localStorageExists()) {
			if (!confirm(confirmMsg)) {
				resetLocalStorage();
			}
		}
		startGame();
	}
}



//------------ LocalStorage handlers ------------------------
//
// Reset local storage
function resetLocalStorage() {
	localStorage.removeItem("game");
	level = 0;
	score = 0;
}

//
// Save game settings to local storage
function saveToLocalStorage() {
	// save the score and level to local storage
	game = {
		"lvl": level,
		"scr": score
	};
	localStorage["game"] = JSON.stringify(game);
}

//
// Load game settings from local storage
function loadFromLocalStorage() {
	// load from localstorage and set teh scroe and level variables;
	if (localStorage["game"]) {
		game = JSON.parse(localStorage["game"]);
		level = game.lvl;
		score = game.scr;
	}
}

//
// Check is there is a saved game
function localStorageExists() {
	return localStorage.getItem("game") !== null;
}