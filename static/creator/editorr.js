console.log("elo")

const jsonArea = document.getElementById("json-area");
const gridContainer = document.getElementById("grid-container");
let level = {start:false, meta:false, objects:[]}
let currentObjectType = "";
let currentObjectColor = "";

function createBoard( x, y, w){
    gridContainer.innerHTML=""
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            let div = document.createElement("div");
            div.classList.add("grid");
            div.style.top = i * w + "vmin";
            div.style.left = j * w + "vmin";
            div.style.width = w + "vmin"
            div.style.height = w + "vmin"
            div.setAttribute("id", `${j}:${i}`);


            div.addEventListener("contextmenu", function(e){
                e.preventDefault()
                let prev = level.findIndex(object => object.id === div.id);
                        if (prev !== -1) {
                            level.splice(prev, 1);
                            jsonArea.value = JSON.stringify(level, null, 4);
                            div.style.background = "none";
                        }
            })

            div.addEventListener("click", function () {
                if (currentObjectType !== "") {
                    if (currentObjectType !== "delete") {
                        let newObject = { id: div.id, x: parseInt(div.id.split(":")[1]), y: 0, z: parseInt(div.id.split(":")[0]), type: currentObjectType }
                        div.style.background = currentObjectColor;
                        let prev = level.findIndex(object => object.id === newObject.id);
                        if (prev !== -1) {
                            console.log("już jest");
                            level[prev] = newObject;
                        } else {
                            level.push(newObject);
                        }
                        jsonArea.value = JSON.stringify(level, null, 4);
                        console.log(level);
                    } else {
                        let prev = level.findIndex(object => object.id === div.id);
                        if (prev !== -1) {
                            level.splice(prev, 1);
                            jsonArea.value = JSON.stringify(level, null, 4);
                            div.style.background = currentObjectColor;
                        }
                    }
                } else {
                    alert("Wybierz typ obiektu!");
                }
            });


            gridContainer.appendChild(div);
        }
    }
}

createBoard(20, 20, 4)


// document.getElementById("save-button").addEventListener("click", function () {
//     fetch('http://localhost:5000/add', {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(levelObjects)
//     })
//         .then(result => { console.log(result); })
//         .catch(error => { console.log(error); })
// });
// document.getElementById("load-button").addEventListener("click", function () {
//     fetch('http://localhost:5000/load', {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//         .then(res => res.json())
//         .then(result => { loadLevel(result); })
//         .catch(error => { console.log(error); })
// });

// function loadLevel(data) {
//     jsonArea.value = JSON.stringify(data, null, 4);
//     level = data;
//     gridContainer.childNodes.forEach(div => {
//         // console.log(div);
//         let object = level.findIndex(object => String(object.id) === div.id);
//         if (object !== -1) {
//             console.log(level[object]);
//             switch (level[object].type) {
//                 case "wall":
//                     div.style.background = "green";
//                     break;
//                 case "enemy":
//                     div.style.background = "red";
//                     break;
//                 case "treasure":
//                     div.style.background = "blue";
//                     break;
//                 case "light":
//                     div.style.background = "yellow";
//                     break;
//                 default:
//                     div.style.background = "none";
//                     break;
//             }
//         } else {
//             div.style.background = "none";
//         }
//     });
// }


document.getElementById("grid-10-10-button").addEventListener("click", ()=>{createBoard(10,10,8)})
document.getElementById("grid-20-20-button").addEventListener("click", ()=>{createBoard(20,20,4)})
document.getElementById("grid-40-40-button").addEventListener("click", ()=>{createBoard(40,40,2)})

document.getElementById("wall-button").addEventListener("click", function () {
    currentObjectType = "START";
    currentObjectColor = "green";
    let prev = document.getElementById("selectedButton");
    if (prev) {
        prev.removeAttribute("id");
    }
    this.setAttribute("id", "selectedButton");
});
document.getElementById("enemy-button").addEventListener("click", function () {
    currentObjectType = "META";
    currentObjectColor = "red";
    let prev = document.getElementById("selectedButton");
    if (prev) {
        prev.removeAttribute("id");
    }
    this.setAttribute("id", "selectedButton");


});
document.getElementById("treasure-button").addEventListener("click", function () {
    currentObjectType = "treasure";
    currentObjectColor = "blue";
    let prev = document.getElementById("selectedButton");
    if (prev) {
        prev.removeAttribute("id");
    }
    this.setAttribute("id", "selectedButton");

});
document.getElementById("light-button").addEventListener("click", function () {
    currentObjectType = "light";
    currentObjectColor = "yellow";
    let prev = document.getElementById("selectedButton");
    if (prev) {
        prev.removeAttribute("id");
    }
    this.setAttribute("id", "selectedButton");

});
document.getElementById("delete-button").addEventListener("click", function () {
    currentObjectType = "delete";
    currentObjectColor = "none";
    let prev = document.getElementById("selectedButton");
    if (prev) {
        prev.removeAttribute("id");
    }
    this.setAttribute("id", "selectedButton");
});