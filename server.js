const path = require('path');
const express = require('express');
const Datastore = require('nedb');
const WebSocket = require('ws');
const cors = require('cors');
const session = require('express-session');
const uuid = require('uuid').v4;

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

app.use(express.static("./dist"));
app.use(express.static("./static"));
app.use(express.static("./static/home"));
app.use(express.static("./static/creator"));
app.use(express.static("./static/lobby"));
app.use(express.static("./static/end"));
app.use(express.static("./static/sidemenu"));

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server: server });
const rooms = [];
const levelThemes = ["library", "cave", "redstone", "nether", "end", "aether"];
// let wsId = 0;

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
            // console.log(jsMsg);

            let room = rooms.find(room => room.players.find(player => player.id === jsMsg.playerId));
            // room.websockets.push(ws);
            // console.log(room);
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
                case "set move":
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id) && client !== ws) {
                            client.send(message);
                        }
                    });
                case "del move":
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id) && client !== ws) {
                            client.send(message);
                        }
                    });
                case "update position":
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id) && client !== ws) {
                            client.send(message);
                        }
                    });
                case "end":
                    console.log(jsMsg)
                    room.win = jsMsg.win
                    room.time = Date.now() - room.timeStart
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id)) {
                            // room.time = Date.now() - room.timeStart
                            client.send(message);
                        }
                    });
                default:
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id) && client !== ws) {
                            client.send(message);
                        }
                    });
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
    res.sendFile(path.join(__dirname, 'dist/game.html'))
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
app.post('/selectLevel', (req, res) => {
    let id = req.body.levelId
    let theme = req.body.theme
    let room = rooms.find(room => room.players.find(player => player.id === req.sessionID))
    if (room) {
        room.timeStart = Date.now()
        room.levelId = id
        room.theme = theme
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && room.websockets.includes(client.id)) {
                console.log(room)
                client.send("Ładuj Poziom");
            }
        });
        console.log(id)
    }
    res.end()
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
                websockets: [req.sessionID],
                levelId: "none",
                win: undefined
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
    const level = req.body.level;
    const dbPromise = new Promise((resolve, reject) => {
        database.update({ _id: req.body.id }, { $set: { name: level.name, author: level.author, size: level.size, start: level.start, end: level.end, objects: level.objects, walls: level.walls } }, {}, function (err, newDoc) {
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

    let room = rooms.find(room => room.players.find(player => player.id === req.sessionID));
    if (room) {
        console.log(room.theme)
        const levelId = room.levelId;
        const dbPromise = new Promise((resolve, reject) => {
            database.findOne({ _id: levelId }, function (err, doc) {
                console.log("document id: " + doc._id, "LOADED: " + new Date().getMilliseconds())
                if (err) { console.log(err) }
                resolve(doc)
                reject("error")
            });
        });
        dbPromise.then(outcome => {
            // let player = rooms.find(room => room.players.find(player => player.id === req.sessionID));
            let playerRole = room.players.find(player => player.id === req.sessionID).role
            res.end(JSON.stringify({ levelData: outcome, theme: room.theme, playerRole: playerRole, playerId: req.sessionID }));
        });
    } else {
        res.end("ni mo");
    }

});
app.get('/getLevels', (req, res) => {
    const dbPromise = new Promise((resolve, reject) => {
        database.find({}, function (err, doc) {
            // console.log("document id: " + doc._id, "LOADED: " + new Date().getMilliseconds())
            if (err) { console.log(err) }
            resolve(doc)
            reject("error")
        });
    });
    dbPromise.then(outcome => {
        res.end(JSON.stringify({ result: outcome, id: req.sessionID }));
    });
})
app.get('/endPrint', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/end/static.html'))
});
app.get('/endPrintData', (req, res) => {
    let room = rooms.find(room => room.players.find(player => player.id === req.sessionID));
    if (room) {
        let player = room.players.find(player => player.id === req.sessionID);
        if (player.role == "player") {
            room.playerfinished = true
        }
        else if (player.role == "spectator") {
            room.spectatorfinished = true
        }
        if (room.playerfinished && room.spectatorfinished) {
            rooms.splice(rooms.findIndex(el => el == room), 1)
        }
        res.end(JSON.stringify({ room: room }))

    } else {
        res.end(JSON.stringify({ room: "ni mo" }));
    }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});