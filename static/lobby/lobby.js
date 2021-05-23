let playerButton = document.getElementById("player");
let spectatorButton = document.getElementById("spectator");
let playerId;

const socket = new WebSocket('ws://localhost:3000');
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server');
});
fetch('http://localhost:3000/joinLobby', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: "helo" })
})
    .then(res => res.json())
    .then(res => {
        console.log(res);
        playerId = res.playerId;
        // socket.id = playerId;
        socket.send(JSON.stringify({ action: "set id", playerId: playerId }))
        res.room.players.forEach(player => {
            if (player.role !== "") {
                if (player.id === playerId) {
                    document.getElementById(player.role).style.background = "green";
                } else {
                    document.getElementById(player.role).style.background = "red";
                }
            }
        })
    })
    .catch(err => { console.log(err) })


socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    if (event.data[0] === "{") {
        let data = JSON.parse(event.data)
        let button = document.getElementById(data.role);
        if (data.action === "remove") {
            button.style.background = "black";
        } else {
            let secondButton = document.getElementById(data.role === "player" ? "spectator" : "player")
            if (data.playerId === playerId) {
                button.style.background = "green";
                if (data.otherRole === "")
                    secondButton.style.background = "black";
            } else {
                button.style.background = "red";
                if (data.otherRole === "")
                    secondButton.style.background = "black";
            }
            if (data.role !== "" && data.otherRole !== "") {
                // fetch('http://localhost:3000/levelSelector', {
                //     method: "POST",
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({ playerId: playerId })
                // })
                //     .then(res => console.log(res))
                //     .catch(err => { console.log(err) })
                let form = document.createElement("form")
                form.method = "POST"
                form.action = "/levelSelector"
                document.body.appendChild(form);
                form.submit();
            }
        }
    }

});

// const sendMessage = () => {
//     socket.send('Hello form Client!');
// }

playerButton.addEventListener("click", function () {
    socket.send(JSON.stringify({ action: "change role", data: "player", playerId: playerId }))
});

spectatorButton.addEventListener("click", function () {
    socket.send(JSON.stringify({ action: "change role", data: "spectator", playerId: playerId }))
});