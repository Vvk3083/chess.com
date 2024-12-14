//Import: express, http, socket.io, chess.js, path
const express = require('express');
const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require('path');
//Create Express app instance
const app = express();
//Initialize HTTP server with Express
const server = http.createServer(app);
//Instantiate Socket.io on HTTP server
const io = socket(server);//whatever socket can perform now it can be made by io also
//Create Chess object instance (chess.js)
const chess = new Chess();
//Initialize:
//  Players object: track socket IDs, roles (white/black)
//  CurrentPlayer: track current turn
let players = {};
let CurrentPlayer = "W";
//for static files
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,"public")));
//routes
app.get("/",function(req,res){
    res.render("index", {title:"chess"});
});
io.on("connection",function(uniquesocket){
    console.log("connected"); //socket in backend
    //uniquesocket.on("churan",function(){
    //     console.log("churan received");
    //     io.emit("churan papdi");
    //})
    // uniquesocket.on("disconnected",function(){
    //     console.log("disconnected");
    //})
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("spectator role");
    }
    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id == players.white){
            delete players.white;
        } 
        else if(uniquesocket.id == players.black){
            delete players.black;
        } 
    });
    uniquesocket.on("move", (move)=>{
        try{
            if(chess.turn() === 'w' && uniquesocket.id != players.white) return;
            if(chess.turn() === 'b' && uniquesocket.id != players.black) return;
            const result = chess.move(move);
            if(result){
                CurrentPlayer = chess.turn();
                io.emit("move",move);//sabko send kar rahe hai
                io.emit("boardState",chess.fen());
            }
            else{
                console.log("invalid move:" , move);
                uniquesocket.emit("invalid move:",move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("Invalid move:", move);
        }
    });
});
server.listen(3000,function(){
    console.log("listening on port 3000");
});