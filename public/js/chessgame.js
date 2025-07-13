const chess = new Chess();
const socket = io();
const chessBoared = document.querySelector(".chessBoard");

let sourceSquare = null;
let playerRole = null;
let dragPeice = null;
const renderBored = () => {
  const board = chess.board();
  // console.log(board);

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      let square = document.createElement("div");
      square.ClassList.add(
        "square",
        squareIndex + (rowIndex % 2) === 0 ? "light" : "dark"
      );

      if (square) {
        let peice = document.createElement("div");
        peice.classList.add("peice", square.color === "w" ? "white" : "black");

        peice.innerText = "";
      }

      peice.draggable = playerRole === square.color;

      peice.addEventListner("dragsstart", () => {
        if (peice.draggable) {
          dragPeice = peice;
        }
      });
    });
  });
};
renderBored();
