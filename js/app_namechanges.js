// Initialize Firebase
var config = {
    apiKey: "AIzaSyCyTdEvdSWoS9QHn8QsJ_Kwlb4HwytmLHc",
    authDomain: "paperrockscissors-17bfa.firebaseapp.com",
    databaseURL: "https://paperrockscissors-17bfa.firebaseio.com",
    projectId: "paperrockscissors-17bfa",
    storageBucket: "paperrockscissors-17bfa.appspot.com",
    messagingSenderId: "360987259347"
};

firebase.initializeApp(config);

var database = firebase.database();


// the players directory
var players = database.ref("/players");
// each player enters in as their own folder in the database
var playerOne = database.ref("/players/playerOne");
var playerTwo = database.ref("/players/playerTwo");
// keep track of who hasn't got yet
var playerTurn = database.ref();


// Initialize all global variables and reset them to zero at the beginning of the game
var player;
var playerOne = null;
var playerTwo = null;
var winsOneCounter = 0;
var winsTwoCounter = 0;
var lossOneCounter = 0;
var lossTwoCounter = 0;
var playerNumber = 0;
var playerOneSnapshot;
var playerTwoSnapshot;
var playerOneResult;
var playerTwoResult;


// check changes made to the player 1 database
playerOne.on("value", function(snapshot) {
	if (snapshot.val() !== null) {
        // Database not empty so there is a game being played
		playerOne = snapshot.val().player;
		winsOneCounter = snapshot.val().wins;
		lossOneCounter = snapshot.val().losses;
		$("#playerOneName").html("<h2>" + playerOne + "</h2>");
		$("#playerOneResults").html("<p>Wins: " + winsOneCounter + "  Losses: " + lossOneCounter + "</p>");
	} else {
		$("#playerOneName").html("Waiting for Player 1");
		$("#playerOneResults").empty();
	};
}, function(errorObject) {
	console.log("The read failed: " + errorObject.code);
});

// check changes made to the player 2 database
playerTwo.on("value", function(snapshot) {
	if (snapshot.val() !== null) {
        // Database not empty so there is a game being played
		playerTwo = snapshot.val().player;
		winsTwoCounter = snapshot.val().wins;
		losses = snapshot.val().losses;
		$("#playerTwoName").html("<h2>" + playerTwo + "</h2>");
		$("#playerTwoResults").html("<p>Wins: " + winsTwoCounter + "  Losses: " + lossTwoCounter + "</p>");
	} else {
		$("#playerTwoName").html("Waiting for Player 2");
		$("#playerTwoResults").empty();
	};
}, function(errorObject) {
	console.log("The read failed: " + errorObject.code);
});


// On submit add player
$("#enterPlayer").on("click", function() {
	event.preventDefault();
    var player = $("#playerName").val().trim();
    // this runs only once... so it adds the first player to player 1
	playerOne.once("value", function(snapshot) {
		playerOneSnapshot = snapshot;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});
	playerTwo.once("value", function(snapshot) {
		playerTwoSnapshot = snapshot;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});
	// if there is no player 1
	if (!playerOneSnapshot.exists()) {
		// sets local variable of player number, to know which page to display choices on and who is taunting
		playerNumber = 1;
		// if player disconnects, remove them from the database
		playerOne.onDisconnect().remove();
		// sets a new player 1
		playerOne.set({
			player: player,
			wins: 0,
			losses: 0
		});
		$("#playerInfo").html("Hi " + player + "! You are Player 1");
		// If there is no player 2
		if (!playerTwoSnapshot.exists()) {
			$("#playerTurn").html("Waiting for Player 2 to join...");
		};
	// if there is no player 2
	} else if (!playerTwoSnapshot.exists()) {
		// sets local variable of player number, to know which page to display choices on and who is taunting
		playerNumber = 2;
		// if player disconnects, remove them from the database
		playerTwo.onDisconnect().remove();
		// sets a new player 2
		playerTwo.set({
			player: player,
			wins: 0,
			losses: 0
		});
		// This starts the game
		playerTurn.update({
			turn: 1
		});
		$("#playerInfo").html("Hi " + player + "! You are Player 2");
		$("#playerTurn").html("Waiting for " + playerOne + " to choose.");
	// if both players have already joined, don't let a third join
	} else {
		$("#playerInfo").html("Sorry. Two people are already playing");
	};
});


// Displays player's choice while they wait for the other player
$("#playerOneChoices").on("click", "div", function() {
	var choice = $(this).text();
	$("#playerOneChoices").html("<br><br><br><h1>" + choice + "</h1>");
	setTimeout(function() {
		playerTurn.update({
			turn: 2
		});
		playerOne.update({
			choice: choice
		}); 
	}, 500);
});
$("#playerTwoChoices").on("click", "div", function() {
	var choice = $(this).text();
	$("#playerTwoChoices").html("<br><br><br><h1>" + choice + "</h1>");
	setTimeout(function() {
		playerTwo.update({
			choice: choice
		}); 
		playerTurn.update({
			turn: 3
		});
	}, 500);
});


players.on("value", function(snapshot) {
	// If both players leave, everything is deleted from database to reset for next game
	if (snapshot.val() == null) {
		$("#playerOne").css("border-color", "black");
		$("#playerTwo").css("border-color", "black");
		playerTurn.set({});
	};
}, function(errorObject) {
	console.log("The read failed: " + errorObject.code);
});


// Results checker
var rpsResults = function() {
	// once this function is called, grabs both players' data
	playerOne.once("value", function(snapshot) {
		playerOneResult = snapshot;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});
	playerTwo.once("value", function(snapshot) {
		playerTwoResult = snapshot;
	}, function(errorObject) {
		console.log("The read failed: " + errorObject.code);
	});
	// Logic for round result
	if (playerOneResult.val() !== null && playerTwoResult.val() !== null) {
		// If both players choose the same item
		if (playerOneResult.val().choice == playerTwoResult.val().choice) {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>Tie Game!</h1>");
		// Player one wins
		} else if (playerOneResult.val().choice == "Rock" && playerTwoResult.val().choice == "Scissors") {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>" + playerOne + " wins!</h1>");
			winsOneCounter++;
			lossTwoCounter++;
		// Player two wins
		} else if (playerOneResult.val().choice == "Rock" && playerTwoResult.val().choice == "Paper") {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>" + playerTwo + " wins!</h1>");
			winsTwoCounter++;
			lossOneCounter++;
		// Player two wins
		} else if (playerOneResult.val().choice == "Paper" && playerTwoResult.val().choice == "Scissors") {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>" + playerTwo + " wins!</h1>");
			winsTwoCounter++;
			lossOneCounter++;
		// Player one wins
		} else if (playerOneResult.val().choice == "Paper" && playerTwoResult.val().choice == "Rock") {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>" + playerOne + " wins!</h1>");
			winsOneCounter++;
			lossTwoCounter++;
		// Player one wins
		} else if (playerOneResult.val().choice == "Scissors" && playerTwoResult.val().choice == "Paper") {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>" + playerOne + " wins!</h1>");
			winsOneCounter++;
			lossTwoCounter++;
		// Player two wins
		} else if (playerOneResult.val().choice == "Scissors" && playerTwoResult.val().choice == "Rock") {
			$("#playerOneChoices").html("<br><br><br><h1>" + playerOneResult.val().choice + "</h1>");
			$("#playerTwoChoices").html("<br><br><br><h1>" + playerTwoResult.val().choice + "</h1>");
			$("#results").html("<br><br><br><br><br><h1>" + playerTwo + " wins!</h1>");
			winsTwoCounter++;
			lossOneCounter++;
		};
		// After results are calculated, reset the round in 4 seconds
		setTimeout(function() {
			playerTurn.update({
				turn: 1
			});
			playerOne.once("value", function(snapshot) {
				playerOneResult = snapshot;
			}, function(errorObject) {
				console.log("The read failed: " + errorObject.code);
			});
			if (playerOneResult.val() !== null) {
				playerOne.update({
					wins: winsOneCounter,
					losses: lossOneCounter
				});
			};
			playerTwo.once("value", function(snapshot) {
				playerTwoResult = snapshot;
			}, function(errorObject) {
				console.log("The read failed: " + errorObject.code);
			});
			if (playerTwoResult.val() !== null) {
				playerTwo.update({
					wins: winsTwoCounter,
					losses: lossTwoCounter
				});
			};
			$("#results").html("");
			$("#playerTwoChoices").html("");
			$("#playerTwo").css("border-color", "black");
			}, 1000*4);
	};
};

// Checks whos turn it is
playerTurn.on("value", function(snapshot) {
	if (snapshot.val() !== null) {
		// Highlights the border around whoever's turn it is
		if (snapshot.val().turn == 1) {
			$("#playerOne").css("border-color", "blue");
		} else if (snapshot.val().turn == 2) {
			$("#playerTwo").css("border-color", "blue");
			$("#playerOne").css("border-color", "black");
		}
		// Display waiting for other player whenever it's their turn
		if (snapshot.val().turn == 2 && playerNumber == 1) {
			$("#playerTurn").html("Waiting for " + playerTwo + " to choose.");
		} else if (snapshot.val().turn == 1 && playerNumber == 2) {
			$("#playerOneChoices").html("");
			$("#playerTurn").html("Waiting for " + playerOne + " to choose.");
		}
		// If it's player 1's turn, display choices on their specific page
		if (snapshot.val().turn == 1 && playerNumber == 1) {
			$("#playerOneChoices").empty();
			$("#playerOneChoices").append("<div>Rock</div>");
			$("#playerOneChoices").append("<div>Paper</div>");
			$("#playerOneChoices").append("<div>Scissors</div>");
			$("#playerTurn").html("It's your turn!");
		// If it's player 2's turn, display choices on their specific page
		} else if (snapshot.val().turn == 2 && playerNumber == 2) {
			$("#playerTwoChoices").empty();
			$("#playerTwoChoices").append("<div>Rock</div>");
			$("#playerTwoChoices").append("<div>Paper</div>");
			$("#playerTwoChoices").append("<div>Scissors</div>");
			$("#playerTurn").html("It's your turn!");
		// After both turns, call rpsResults
		} else if (snapshot.val().turn == 3) {
			$("#playerTurn").html("");
			rpsResults();
		};
	};
});
