//basic socket io setup
// socket.emit("churan")
// socket.on("churan papdi",function(){
//     console.log("churan papdi received");
// })
const socket = io();
const chess = new Chess();
const boardElement  = document.querySelector(".chessboard"); 

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderboard  = function(){
    const board = chess.board();
    boardElement.innerHTML = "";
    // console.log(board);
    board.forEach(function(row,rowindex){
        row.forEach(function(square,squareindex){
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex+squareindex) %2 === 0 ? "light" : "dark" 
            );
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;
            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
                pieceElement.addEventListener("dragstart", function(e){
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = { row:rowindex , col:squareindex};
                        e.dataTransfer.setData("text/plain","");
                    }
                });
                pieceElement.addEventListener("dragend", function(e){
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener('dragover',function(e){
                e.preventDefault();
            });
            squareElement.addEventListener('drop',function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource  = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare,targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        }); 
    });
};

const handleMove  = function(source,target){
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8-source.row}`,
        to : `${String.fromCharCode(97 + target.col)}${8-target.row}`,
        promotion: "q",
    };
    socket.emit("move",move);
};
const getPieceUnicode  = function(piece){
    const unicodePieces = {
        p:"♟",
        r:"♜",
        n:"♞",
        b:"♝",
        q:"♛",
        k:"♚",
        P:"♙",
        R:"♖",
        N:"♘",
        B:"♗",
        Q:"♕",
        K:"♔"
    };
    return unicodePieces[piece.type] || "";
};
socket.on("playerRole",function(role){
    playerRole = role;
    renderboard();
});
socket.on("spectatorRole",function(){
    playerRole = null;
    renderboard();
});
socket.on("boardState",function(fen){
    chess.load(fen);
    renderboard();
})
socket.on("move",function(move){
    chess.load(move);
    renderboard();
})

renderboard();