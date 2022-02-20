// ========================================================================================
// General
// ========================================================================================

const name = sessionStorage.getItem('name');
if (!name) {
    location = 'index.html';
    throw 'ERROR: Invalid name';
}

const gameId = new URL(location).searchParams.get('gameId');
if (!gameId) {
    location = 'list.html';
    throw 'ERROR: Invalid game id';
}

let started = false;
let me = null; // A or B
const $status = $('#status');
let playerA = null;
let playerB = null;
let pX = null;

// ========================================================================================
// Events
// ========================================================================================

$('#leave').click(e => location = 'list.html');

// ========================================================================================
// Connect
// ========================================================================================

const param = $.param({ page: 'game', name, gameId });

const con = new signalR.HubConnectionBuilder().withUrl('/hub?' + param).build();

con.onclose(err => {
    alert('Disconnected');
    location = 'index.html';
});

con.on('Reject', () => location = 'list.html');


con.on('Ready', (letter, game) => {
  if (game.playerA && game.playerB) {
    playerA = game.playerA.name;
    playerB = game.playerB.name
    $status.text(`${ playerA } VS ${ playerB }`);
    
    let html = `
    <table id="player">
        <tr>
            <td>Player A</td>
            <td>${ game.playerA.name }</td>
            <td>${ p1 }</td>
        </tr>
        <tr>
            <td>Player B</td>
            <td>${ game.playerB.name }</td>
            <td>${ p2 }</td>
        </tr>
    </table>
    <h4 id="you_are">You are: Player ${ me }</h4>
    `;
    console.log(playerA + " vs " + playerB + "\nMe: " + me);
    $('#playerSymbol').html(html);
}

  
});

con.on("Left", () => {
    let id = setTimeout(() => location = 'list.html', 5000);

    while (id--) {
      clearTimeout(id);
    }
    console.log("Player Disconnected");
    started = false;
    // if (letter == 'A') {
    //   $status.text(`${ playerA } has left the game. You will be redirected back to lobby immediately.`);
    //   console.log("Display A left message");
    // } else {
    //   $status.text(`${ playerB } has left the game. You will be redirected back to lobby immediately.`);
    //   console.log("Display B left message");
    // }
    $status.text(`Your opponent has left the game.\nYou will be redirected back to lobby soon.`);
});


con.start().then(main);

function main() {

}

// ========================================================================================
// Game
// ========================================================================================

// Define Player
const p1 = "⭕";
const p2 = "❌";

// Define Tic-Tac-Toe Board
let board_full = false;
let play_board = ["", "", "", "", "", "", "", "", ""];
let occupiedCount = 0;
let playerRound = "P1";

// Board Container : Whole activity changes at this const
const board_container = document.querySelector(".play-area");

// Winner Statement : Display winner result after game over
const winner_statement = document.getElementById("winner");

//Check if game over then display result
check_board_complete = () => {
  let flag = true;
  play_board.forEach(element => {
    if (element != p1 && element != p2) {
      flag = false;
    }
  });
  board_full = flag;
};

// Check line for every move
const check_line = (a, b, c) => {
  return (
    play_board[a] == play_board[b] &&
    play_board[b] == play_board[c] &&
    (play_board[a] == p1 || play_board[a] == p2)
  );
};

// Check match : Check line exist if true -> game end
const check_match = () => {
  for (i = 0; i < 9; i += 3) {
    if (check_line(i, i + 1, i + 2)) {
      document.querySelector(`#block_${i}`).classList.add("win");
      document.querySelector(`#block_${i + 1}`).classList.add("win");
      document.querySelector(`#block_${i + 2}`).classList.add("win");
      return play_board[i];
    }
  }
  for (i = 0; i < 3; i++) {
    if (check_line(i, i + 3, i + 6)) {
      document.querySelector(`#block_${i}`).classList.add("win");
      document.querySelector(`#block_${i + 3}`).classList.add("win");
      document.querySelector(`#block_${i + 6}`).classList.add("win");
      return play_board[i];
    }
  }
  if (check_line(0, 4, 8)) {
    document.querySelector("#block_0").classList.add("win");
    document.querySelector("#block_4").classList.add("win");
    document.querySelector("#block_8").classList.add("win");
    return play_board[0];
  }
  if (check_line(2, 4, 6)) {
    document.querySelector("#block_2").classList.add("win");
    document.querySelector("#block_4").classList.add("win");
    document.querySelector("#block_6").classList.add("win");
    return play_board[2];
  }
  return "";
};

// Winner and loser results
const check_for_winner = () => {
  let res = check_match()
  if (res == p1) {
    winner.innerText = "Player A Win";
    winner.classList.add("playerWin");
    board_full = true
  } else if (res == p2) {
    winner.innerText = "Player B Win";
    winner.classList.add("playerLose");
    board_full = true
  } else if (board_full) {
    winner.innerText = "Draw!";
    winner.classList.add("draw");
  }
};

// Allow both player to click on the board
const render_board = () => {
  board_container.innerHTML = ""
  // Use forEach loop to define all blocks
  con.on('ReceiveMove', (player, move, occcupiedCount, currentGameId) => {
    if (gameId == currentGameId) {
      occupiedCount = occcupiedCount;
      console.log("Player " + me + ": " + "\nReceive Move " + player + "\nMove: " + move + "\nReceive Occupied Count: " + occupiedCount);
      play_board[move] = player;
      game_loop();
    }    
  });
  if (occupiedCount % 2 == 0) {
    playerRound = "P1";
  } else {
    playerRound = "P2";
  }

  console.log("Current round: " + (playerRound == "P1" ? "Player A" : "Player B"));
  $('#playerRound').text(`${ playerRound == "P1" ? "Player A" : "Player B" }\'s Turn.`);
  play_board.forEach((e, i) => {
    board_container.innerHTML += `<div id="block_${ i }" class="block" onclick="add${ playerRound }Move(${ i })">${ play_board[i] }</div>`
    if (e == p1 || e == p2) {
      document.querySelector(`#block_${ i }`).classList.add("occupied");
    }
  });
};

const game_loop = () => {
  render_board();
  check_board_complete();
  check_for_winner();
}

const addP1Move = e => {
  if (!board_full && play_board[e] == "") {
    play_board[e] = p1;
    occupiedCount++;
    con.invoke('SendMove', p1, e, occupiedCount, gameId);
    console.log("Player A: " + p1 + "\nMove: " + e + "\nGame ID: " + gameId + "\nOccupied Count: " + occupiedCount);
    game_loop();
  }
};

const addP2Move = e => {
  if (!board_full && play_board[e] == "") {
    play_board[e] = p2;
    occupiedCount++;
    con.invoke('SendMove', p2, e, occupiedCount, gameId);
    console.log("Player B: " + p2 + "\nMove: " + e + "\nGame ID: " + gameId + "\nOccupied Count: " + occupiedCount);
    game_loop();
  }
};

// Clear board and remove result
const reset_board = () => {
  console.log("Send reset command\n Game ID: " + gameId);
  play_board = ["", "", "", "", "", "", "", "", ""];
  board_full = false;
  winner.classList.remove("playerWin");
  winner.classList.remove("playerLose");
  winner.classList.remove("draw");
  winner.innerText = "";
  occupiedCount = 0;
  render_board();
  con.invoke('Reset', gameId);
  console.log("Send reset command");
  console.clear();
};

con.on('ReceiveReset', currentGameId => {
  if (gameId == currentGameId) {
    console.log("Receive reset command\nGame ID: " + currentGameId);
    play_board = ["", "", "", "", "", "", "", "", ""];
    board_full = false;
    winner.classList.remove("playerWin");
    winner.classList.remove("playerLose");
    winner.classList.remove("draw");
    winner.innerText = "";
    occupiedCount = 0;
    render_board();
    console.clear();
  }
});

const exit_game = () => { location = 'list.html'; };

//initial render
render_board();