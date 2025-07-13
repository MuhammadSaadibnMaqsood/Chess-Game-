const chess = new Chess();
const socket = io();
const chessBoard = document.querySelector(".chessBoard");

let sourceSquare = null;
let playerRole = null;
let dragPiece = null;

const getUnicodePiece = (type, color) => {
  const unicodePieces = {
    w: {
      k: "♔",
      q: "♕",
      r: "♖",
      b: "♗",
      n: "♘",
      p: "♙",
    },
    b: {
      k: "♚",
      q: "♛",
      r: "♜",
      b: "♝",
      n: "♞",
      p: "♟",
    },
  };
  return unicodePieces[color][type] || "";
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to:  `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };
  socket.emit("move", move);
};

const renderBoard = () => {
  chessBoard.innerHTML = ""; 

  const board = chess.board();

  board.forEach((row, rowIndex) => {
    row.forEach((cell, squareIndex) => {
      // Create the square
      const squareBox = document.createElement("div");
      squareBox.classList.add(
        "square",
        "w-full",
        "h-full",
        "flex",
        "items-center",
        "justify-center",
        (squareIndex + rowIndex) % 2 === 0 ? "bg-amber-200" : "bg-amber-700"
      );

      squareBox.dataset.row = rowIndex;
      squareBox.dataset.col = squareIndex;

      if (cell) {
        // Create the piece
        const piece = document.createElement("div");
        piece.classList.add(
          "piece",
          cell.color === "w" ? "text-white" : "text-black",
          "text-3xl",
          "font-bold",
          "select-none",
          "cursor-grab"
        );

        piece.innerText = getUnicodePiece(cell.type, cell.color);
        piece.draggable = playerRole === null || playerRole === cell.color;

        piece.addEventListener("dragstart", (e) => {
          if (piece.draggable) {
            dragPiece = piece;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        piece.addEventListener("dragend", () => {
          sourceSquare = null;
          dragPiece = null;
        });

        squareBox.appendChild(piece);
      }

      squareBox.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareBox.addEventListener("drop", (e) => {
        e.preventDefault();
        if (dragPiece && sourceSquare) {
          const target = {
            row: +squareBox.dataset.row,
            col: +squareBox.dataset.col,
          };
          handleMove(sourceSquare, target);
          console.log("Drop from:", sourceSquare, "to:", target);
        }
      });

      chessBoard.append(squareBox);
    });
  });
};

renderBoard();

socket.on("Player", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("Spectator", function () {
  playerRole = null;
  renderBoard();
});

socket.on("BoardState", function (fen) {
  chess.load(fen);
  renderBoard();
});
socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});
