// Define P1 P2, Observer (If can)
const p1 = "O";
const p2 = "X";

// Define Tic-Tac-Toe Board
let board_full = false;
let play_board = ["", "", "", "", "", "", "", "", ""];
let occupiedCount = 0;
let playerRound = "";

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


const check_line = (a, b, c) => {
  return (
    play_board[a] == play_board[b] &&
    play_board[b] == play_board[c] &&
    (play_board[a] == p1 || play_board[a] == p2)
  );
};

// Check match : Check line exist if true -> game over
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
    winner.innerText = "P1 Win";
    winner.classList.add("playerWin");
    board_full = true
  } else if (res == p2) {
    winner.innerText = "P2 Win";
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
  play_board.forEach((e, i) => {
    if (occupiedCount % 2 == 0) {
      playerRound = "P1";
    } else {
      playerRound = "P2";
    }
    board_container.innerHTML += `<div id="block_${i}" class="block" onclick="add${playerRound}Move(${i})">${play_board[i]}</div>`
    if (e == p1 || e == p2) {
      document.querySelector(`#block_${i}`).classList.add("occupied");
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
    game_loop();
    addP2Move();
  }
};

const addP2Move = e => {
  if (!board_full && play_board[e] == "") {
    play_board[e] = p2;
    occupiedCount++;
    game_loop();
  }
};

// Clear board and remove result
const reset_board = () => {
  play_board = ["", "", "", "", "", "", "", "", ""];
  board_full = false;
  winner.classList.remove("playerWin");
  winner.classList.remove("playerLose");
  winner.classList.remove("draw");
  winner.innerText = "";
  occupiedCount = 0;
  render_board();
};

const exit_game = () => {
  location = 'list.html';
};

//initial render
render_board();