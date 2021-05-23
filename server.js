const path = require('path');
const express = require('express');
const Datastore = require('nedb');
const WebSocket = require('ws');
const cors = require('cors')
const session = require('express-session');
const uuid = require('uuid').v4

const database = new Datastore({
    filename: 'databases/levels.db',
    autoload: true
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
    genid: (req) => {
        console.log('Inside the session middleware')
        console.log(req.sessionID)
        return uuid()
    },
    secret: "fubuki",
    resave: false,
    saveUninitialized: true
}));

// app.use(express.static("./dist"));
app.use(express.static("./static/home"));
app.use(express.static("./static/creator"));
app.use(express.static("./static/lobby"));

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server: server });

const rooms = [];
let wsId = 0;

wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');
    ws.send('Welcome New Client!');
    // ws.id = wsId;
    // wsId++;
    console.log(ws.id)


    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        if (JSON.parse(message).action) {
            let jsMsg = JSON.parse(message);
            console.log(jsMsg);

            let room = rooms.find(room => room.players.find(player => player.id === jsMsg.playerId));
            room.websockets.push(ws);
            console.log(room);
            switch (jsMsg.action) {
                case "set id":
                    ws.id = jsMsg.playerId;
                    break;
                case "change role":
                    let player = room.players.find(player => player.id === jsMsg.playerId)
                    let response;
                    let otherPlayer = room.players.find(player => player.id !== jsMsg.playerId);
                    if (!room.full) {
                        console.log("oooo")
                        if (player.role !== jsMsg.data) {
                            player.role = jsMsg.data
                            response = JSON.stringify({ playerId: jsMsg.playerId, action: "add", role: player.role, otherRole: "" })
                        } else {
                            response = JSON.stringify({ playerId: jsMsg.playerId, action: "remove", role: player.role, otherRole: "" })
                            player.role = "";
                        }

                    } else if (otherPlayer.role !== jsMsg.data) {
                        console.log("oooo")
                        if (player.role !== jsMsg.data) {
                            player.role = jsMsg.data
                            response = JSON.stringify({ playerId: jsMsg.playerId, action: "add", role: player.role, otherRole: otherPlayer.role })
                        } else {
                            response = JSON.stringify({ playerId: jsMsg.playerId, action: "remove", role: player.role, otherRole: otherPlayer.role })
                            player.role = "";
                        }
                    } else {
                        console.log("no")
                    }
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id)) {
                            client.send(response);
                        }
                    });
                    break;
                default:
                    break;
            }
        } else {
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/home/home.html'))
});
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/creator/editor.html'))
});
app.get('/creator', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/creator/editor.html'))
});
app.get('/lobby', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/lobby/lobby.html'))
});
app.get('/waitingRoom', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/lobby/waitingRoom.html'))
});
app.get('/levelSelector', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/lobby/levelSelector.html'))
});
app.post('/joinLobby', function (req, res) {
    let room = rooms.find(room => room.players.find(player => player.id === req.sessionID));
    if (room) { //gracz już jest w roomie
        res.end(JSON.stringify({ room: room, playerId: req.sessionID }));
    } else {    //dołączabie do pokoju
        room = rooms.find(room => !room.full)
        if (room) {
            room.players.push({ id: req.sessionID, role: "" })
            room.websockets.push(req.sessionID)
            room.full = true;
            res.end(JSON.stringify({ room: room, playerId: req.sessionID }));
        } else {    //nowy pokój
            room = {
                full: false,
                players: [
                    { id: req.sessionID, role: "" }
                ],
                websockets: [req.sessionID]
            }
            rooms.push(room);
            res.end(JSON.stringify({ room: room, playerId: req.sessionID }))
        }
    }
});
app.post('/levelSelector', (req, res) => {
    let room = rooms.find(room => room.players.find(player => player.id === req.sessionID));
    let player = room.players.find(player => player.id === req.sessionID);
    if (player.role === "player") {
        // res.sendFile(path.join(__dirname, 'static/lobby/waitingRoom.html'))
        res.redirect("/waitingRoom")
    } else {
        // res.sendFile(path.join(__dirname, 'static/lobby/levelSelector.html'))
        res.redirect("/levelSelector")
    }
});

app.post('/saveLevel', (req, res) => {
    const level = req.body;
    const dbPromise = new Promise((resolve, reject) => {
        database.insert(level, function (err, newDoc) {
            console.log("document id: " + newDoc._id, "ADDED: " + new Date().getMilliseconds())
            if (err) { console.log(err) }
        });
        resolve("success")
        reject("error")
    });
    dbPromise.then(outcome => {
        res.end(JSON.stringify({ result: outcome }));
    });
});
app.post('/loadLevel', (req, res) => {
    const levelId = req.body.levelId;
    const dbPromise = new Promise((resolve, reject) => {
        database.findOne({ _id: levelId }, function (err, doc) {
            console.log("document id: " + doc._id, "LOADED: " + new Date().getMilliseconds())
            if (err) { console.log(err) }
            resolve(doc)
            reject("error")
        });
    });
    dbPromise.then(outcome => {
        res.end(JSON.stringify({ result: outcome }));
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});