levelSelect = document.getElementById("levels")


const socket = new WebSocket('ws://localhost:3000');
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server');
    fetch('http://localhost:3000/getLevels', {
        method: "GET",
    })
        .then(res => res.json()).then(res => {
            socket.send(JSON.stringify({ action: "set id", playerId: res.id }))
            // let levelsGrid = document.getElementById('div')
            res.result.forEach(maze => {
                let mazeOption = document.createElement('div')
                mazeOption.classList.add("level")
                let mazeLabel = document.createElement("span")
                mazeLabel.innerText = "LEVEL: " + maze.name + '    AUTOR: ' + maze.author + maze.size
                mazeOption.appendChild(mazeLabel)
                let canvas = document.createElement("canvas")
                canvas.width = 200
                canvas.height = 200
                mazeOption.appendChild(canvas)
                if (canvas.getContext) {
                    var ctx = canvas.getContext('2d');

                    let gridSize = 200 / maze.size
                    console.log(maze.objects)

                    maze.objects.forEach(object => {
                        if (object.type == "PATH") {
                            ctx.fillStyle = 'rgb(200, 200, 200)';
                        }
                        else if (object.type == "START") {
                            ctx.fillStyle = 'rgb(0, 255, 0)';
                        }
                        else if (object.type == "META") {
                            ctx.fillStyle = 'rgb(255, 0, 0)';
                        }
                        ctx.fillRect(object.z * gridSize, object.x * gridSize, gridSize, gridSize);
                    });
                    ctx.fillStyle = 'rgb(0, 0, 0)';
                    maze.walls.forEach(wall => {
                        ctx.fillRect(wall.z * gridSize, wall.x * gridSize, gridSize, gridSize);
                    });
                }
                mazeOption.value = maze._id

                mazeOption.addEventListener("click", function () {
                    const http = new XMLHttpRequest();
                    var url = 'http://localhost:3000/selectLevel';
                    let theme = document.getElementById("theme-select").value
                    if(document.getElementById("aether").checked){
                        theme = "aether"
                    }
                    var params = `levelId=${maze._id}&theme=${theme}`
                    http.open('POST', url, true);
                    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    http.send(params);
                    // console.log(maze._id)
                })

                levelSelect.appendChild(mazeOption)
            })

            let sendLevel = document.createElement('div')
            sendLevel.id = 'send-level'
            sendLevel.innerText = 'NADPISZ LEVEL'
        })
        .catch(err => { console.log(err) })

    socket.addEventListener('message', function (event) {
        if (event.data === "Ładuj Poziom") {
            document.location.href = 'http://localhost:3000/game'
        }
        console.log('Message from server ', event.data);
    })
});







