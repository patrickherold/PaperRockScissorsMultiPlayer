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


// each player enters in as their own folder in the database
var playerTurn = database.ref();
var players = database.ref("/players");
var player1 = database.ref("/players/player1");
var player2 = database.ref("/players/player2");
// Initialize all global variables
var player;
var p1snapshot;
var p2snapshot;
var p1result;
var p2result;
var p1 = null;
var p2 = null;
var wins1 = 0;
var wins2 = 0;
var losses1 = 0;
var losses2 = 0;
var playerNum = 0;

// initial submit form to enter as a player
$("#playerInfo").html("<input id=playerName type=text placeholder='Enter your name to begin'><input id=enterPlayer type=submit value=Start>");


// publishes changes made to the player 1 database
player1.on("value", function(snapshot) {
    if (snapshot.val() !== null) {
        p1 = snapshot.val().player;
        wins1 = snapshot.val().wins;
        losses1 = snapshot.val().losses;
        $("#p1name").html("<h2>" + p1 + "</h2>");
        $("#p1stats").html("<h4>Wins: " + wins1 + "  Losses: " + losses1 + "</h4>");
    } else {
        $("#p1name").html("Waiting for Player 1");
        $("#p1stats").empty();
    };
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Publishes changes made to the player 2 database
player2.on("value", function(snapshot) {
    if (snapshot.val() !== null) {
        p2 = snapshot.val().player;
        wins2 = snapshot.val().wins;
        losses = snapshot.val().losses;
        $("#p2name").html("<h2>" + p2 + "</h2>");
        $("#p2stats").html("<h4>Wins: " + wins2 + "  Losses: " + losses2 + "</h4>");
    } else {
        $("#p2name").html("Waiting for Player 2");
        $("#p2stats").empty();
    };
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// On Submit button, added player depending on who is already in the firebase database by checking if exists
$("#enterPlayer").on("click", function() {
    event.preventDefault();
    player = $("#playerName").val().trim();
    player1.once("value", function(snapshot) {
        p1snapshot = snapshot;
    }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
    player2.once("value", function(snapshot) {
        p2snapshot = snapshot;
    }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
    // if there is no player 1
    if (!p1snapshot.exists()) {
        // sets local variable of player number, to know which page to display choices on and who is taunting
        playerNum = 1;
        // if player disconnects, remove them from the database
        player1.onDisconnect().remove();
        // sets a new player 1
        player1.set({
            player: player,
            wins: 0,
            losses: 0
        });
        $("#playerInfo").html("Hi " + player + "! You are Player 1");
        // If there is no player 2
        if (!p2snapshot.exists()) {
            $("#playerTurn").html("Waiting for Player 2 to join...");
        };
    // if there is no player 2
    } else if (!p2snapshot.exists()) {
        // sets local variable of player number, to know which page to display choices on and who is taunting
        playerNum = 2;
        // if player disconnects, remove them from the database
        player2.onDisconnect().remove();
        // sets a new player 2
        player2.set({
            player: player,
            wins: 0,
            losses: 0
        });
        // This starts the game
        playerTurn.update({
            turn: 1
        });
        $("#playerInfo").html("Hi " + player + "! You are Player 2");
        $("#playerTurn").html("Waiting for " + p1 + " to choose.");
    // if both players have already joined, don't let a third join
    } else {
        $("#playerInfo").html("Sorry. Two people are already playing");
    };
});

players.on("value", function(snapshot) {
    // If both players leave, everything is deleted from database to reset for next game
    if (snapshot.val() == null) {
        playerTurn.set({});
    };
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


// Results checker
var rpsResults = function() {

    // clear out the selected choice to display the results
    $("#p1Selected").html("");
    $("#p2Selected").html("");

    // once this function is called, grabs both players' data
    player1.once("value", function(snapshot) {
        p1result = snapshot;
    }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
    player2.once("value", function(snapshot) {
        p2result = snapshot;
    }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
    // Logic for round result
    if (p1result.val() !== null && p2result.val() !== null) {
        // If both players choose the same item
        console.log("The is line 157");

        if (p1result.val().choice == p2result.val().choice) {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>Tie Game!</h1>");
        // Player one wins
        } else if (p1result.val().choice == "rock" && p2result.val().choice == "scissors") {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>" + p1 + " wins!</h1>");
            // increment the wins and losses
            wins1++;
            losses2++;
        // Player two wins
        } else if (p1result.val().choice == "rock" && p2result.val().choice == "paper") {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>" + p2 + " wins!</h1>");
            wins2++;
            losses1++;
        // Player two wins
        } else if (p1result.val().choice == "paper" && p2result.val().choice == "scissors") {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>" + p2 + " wins!</h1>");
            wins2++;
            losses1++;
        // Player one wins
        } else if (p1result.val().choice == "paper" && p2result.val().choice == "rock") {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>" + p1 + " wins!</h1>");
            wins1++;
            losses2++;
        // Player one wins
        } else if (p1result.val().choice == "scissors" && p2result.val().choice == "paper") {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>" + p1 + " wins!</h1>");
            wins1++;
            losses2++;
        // Player two wins
        } else if (p1result.val().choice == "scissors" && p2result.val().choice == "rock") {
            $("#p1choices").html("<img src='images/" + p1result.val().choice + ".png'/>");
            $("#p2choices").html("<img src='images/" + p2result.val().choice + ".png'/>");
            $("#results").html("<h1>" + p2 + " wins!</h1>");
            wins2++;
            losses1++;
        };

        // After game then reset
        setTimeout(function() {
            playerTurn.update({
                // set the turn back to start a new game
                turn: 1
            });
            player1.once("value", function(snapshot) {
                p1result = snapshot;
            }, 
                function(errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

            if (p1result.val() !== null) {
                // update the player1 win loss total 
                player1.update({
                    wins: wins1,
                    losses: losses1
                });
            };

            player2.once("value", function(snapshot) {
                p2result = snapshot;
            }, 
                function(errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

            if (p2result.val() !== null) {
                // update the player2 win loss total 
                player2.update({
                    wins: wins2,
                    losses: losses2
                });
            };
            $("#results").html("");
            $("#p2choices").empty();
            $("#p2Selected").empty();
            }, 5000);
    };
};

// each time this changes it's time for the other players turn. 
playerTurn.on("value", function(snapshot) {
    if (snapshot.val() !== null) {
        // Display waiting for other player whenever it's their turn
        if (snapshot.val().turn == 2 && playerNum == 1) {
        $("#p2choices").empty();
        $("#playerTurn").html("Waiting for " + p2 + " to choose.");
        } else if (snapshot.val().turn == 1 && playerNum == 2) {
        $("#p1choices").empty();
        $("#playerTurn").html("Waiting for " + p1 + " to choose.");
        }
        // If it's player 1's turn, display choices on their specific page
        if (snapshot.val().turn == 1 && playerNum == 1) {
            $("#p1choices").empty();
            $("#p1choices").append("<img src='images/rock.png' data-rps='rock' class='rpsImage'>");
            $("#p1choices").append("<img src='images/scissors.png' data-rps='scissors' class='rpsImage'>");
            $("#p1choices").append("<img src='images/paper.png' data-rps='paper' class='rpsImage'>");
            $("#playerTurn").html("It's your turn!");
        // If it's player 2's turn, display choices on their specific page
        } else if (snapshot.val().turn == 2 && playerNum == 2) {
            $("#p2choices").empty();
            $("#p2choices").append("<img src='images/rock.png' data-rps='rock' class='rpsImage'>");
            $("#p2choices").append("<img src='images/scissors.png' data-rps='scissors' class='rpsImage'>");
            $("#p2choices").append("<img src='images/paper.png' data-rps='paper' class='rpsImage'>");
            $("#playerTurn").html("It's your turn!");
        // After both turns, call rpsResults
        } else if (snapshot.val().turn == 3) {
            $("#playerTurn").html("");
            rpsResults();
        };
    };
});

// Displays player's choice while they wait for the other player
$("#p1choices").on("click", "img", function() {
    var choice = $(this).data("rps");
    $("#p1choices").empty();
    $("#p1Selected").append("<img src='images/" + choice + ".png'/>");
    console.log("The is line 284");

    // update player turn to swith players
    setTimeout(function() {
        playerTurn.update({
            turn: 2
        });
        // store the choice for later scoring
        player1.update({
            choice: choice
        }); 
        // wait a little bit to let the writes complete
    }, 500);
});
$("#p2choices").on("click", "img", function() {
    var choice = $(this).data("rps");
    $("#p2choices").empty();
    $("#p2Selected").html("<img src='images/" + choice + ".png'/>");
    setTimeout(function() {
        player2.update({
            choice: choice
        }); 
        playerTurn.update({
            turn: 3
        });
    }, 500);
  });