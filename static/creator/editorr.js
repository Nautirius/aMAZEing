const jsonArea = document.getElementById("json-area");
const gridContainer = document.getElementById("grid-container");
const xInput = document.getElementById("grid-x-input");
const yInput = document.getElementById("grid-y-input");


document.getElementById("grid-change-button").addEventListener("click", () => { createBoard(xInput.value, yInput.value) })


let level = { grid: '10x10', start: false, end: false, objects: [], walls: [] }
let currentObjectType = "START";
let mouseDown = false
gridContainer.addEventListener("mousedown", function () {
    mouseDown = true
})
window.addEventListener("mouseup", function () {
    mouseDown = false
})


function createBoard(x, y) {
    level.grid = x + 'x' + y;
    if (x <= 1 || x >= 51 || x == null || x == undefined || x == "") { x = 2 }
    if (y <= 1 || y >= 51 || y == null || y == undefined || y == "") { y = 2 }
    gridContainer.innerHTML = ""
    gridContainer.style.height = (80 / x) * y + "vmin"
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            let div = document.createElement("div");
            div.classList.add("grid", "untagged")
            div.style.top = i * 80 / x + "vmin";
            div.style.left = j * 80 / x + "vmin";
            div.style.width = 80 / x + "vmin"
            div.style.height = 80 / x + "vmin"
            div.setAttribute("id", `${j}:${i}`);
            div.addEventListener("mouseover", () => selectDiv(div));
            div.addEventListener("mousedown", () => selectDiv(div, true))
            gridContainer.appendChild(div);
        }
    }
}
createBoard(10, 10)


function selectDiv(div, click = false) {
    if (mouseDown || click) {

        if (currentObjectType !== "") {

            let currentObjectColor = "black"

            if (currentObjectType == "START") { currentObjectColor = "green" }

            else if (currentObjectType == "META") { currentObjectColor = "red" }

            else if (currentObjectType == "PATH") { currentObjectColor = "none" }

            else { currentObjectColor = "black" }


            if (currentObjectType !== "delete") {

                let newObject = { id: div.id, x: parseInt(div.id.split(":")[1]), y: 0, z: parseInt(div.id.split(":")[0]), type: currentObjectType }

                let prev = level.objects.findIndex(object => object.id === newObject.id);

                if (prev !== -1) {
                    console.log("już jest");
                    level.objects[prev] = newObject;

                } else {

                    if (currentObjectType === "START" && level.start !== false) { console.log("start już jest") }
                    else if (currentObjectType === "META" && level.end !== false) { console.log("meta już jest") }
                    else {
                        level.objects.push(newObject);
                        div.style.background = currentObjectColor;
                        div.classList.remove("untagged")
                        if (currentObjectType === "START") { level.start = newObject }
                        if (currentObjectType === "META") { level.end = newObject }
                    }
                }
                jsonArea.value = JSON.stringify(level, null, 4);
                console.log(level.objects);

            } else {
                let prev = level.objects.findIndex(object => object.id === div.id);
                if (prev !== -1) {
                    let deletedObject = level.objects.splice(prev, 1);
                    console.log(deletedObject)
                    if (deletedObject[0].type === "START") { level.start = false }
                    if (deletedObject[0].type === "META") { level.end = false }
                    jsonArea.value = JSON.stringify(level, null, 4);
                    div.style.background = currentObjectColor;
                    div.classList.add("untagged")
                }
            }
        } else {
            alert("Wybierz typ obiektu!");
        }
    }
}


Array.from(document.getElementById("editor-buttons").children).forEach(element => {
    element.addEventListener("click", function () {
        currentObjectType = element.innerText;
        let prev = document.getElementById("selectedButton");
        if (prev) {
            prev.removeAttribute("id");
        }
        this.setAttribute("id", "selectedButton");
    })
});


document.getElementById("save-button").addEventListener("click", function () {
    level.walls = []

    level.objects.forEach(object => {
        if (level.objects.findIndex(tempObject => (tempObject.x == object.x + 1 && tempObject.z == object.z)) == -1) {
            level.walls.push(
                {
                    x: object.x + 1,
                    z: object.z
                }
            )
        }

        if (level.objects.findIndex(tempObject => (tempObject.x == object.x - 1 && tempObject.z == object.z)) == -1) {
            level.walls.push(
                {
                    x: object.x - 1,
                    z: object.z
                }
            )
        }

        if (level.objects.findIndex(tempObject => (tempObject.x == object.x && tempObject.z == object.z + 1)) == -1) {
            level.walls.push(
                {
                    x: object.x,
                    z: object.z + 1
                }
            )
        }

        if (level.objects.findIndex(tempObject => (tempObject.x == object.x && tempObject.z == object.z - 1)) == -1) {
            level.walls.push(
                {
                    x: object.x,
                    z: object.z - 1
                }
            )
        }
    });
    fetch('http://localhost:3000/saveLevel', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(level)
    })
        .then(res => res.json()).then(res => console.log(res))
        .catch(err => { console.log(err) })
})