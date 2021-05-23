const jsonArea = document.getElementById("json-area");
const gridContainer = document.getElementById("grid-container");
const xInput = document.getElementById("grid-x-input");


document.getElementById("grid-change-button").addEventListener("click", ()=>{createBoard(xInput.value)})


let level = {start:false, end:false, objects:[], walls:[]}
let currentObjectType = "START";
let currentSize = 10
let mouseDown = false
gridContainer.addEventListener("mousedown", function(){
    mouseDown = true
})
window.addEventListener("mouseup", function(){
    mouseDown = false
})


function createBoard(x){
    xInput.value = null
    level = {start:false, end:false, objects:[], walls:[]}

    if(x<=1||x>=51||x==null||x==undefined||x==""){x=currentSize}
    currentSize = x
    gridContainer.innerHTML=""
    gridContainer.style.height= 50 + "vw"
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < x; j++) {
            let div = document.createElement("div");
            div.classList.add("grid", "untagged")
            div.style.top = i * 50/x + "vw";
            div.style.left = j * 50/x + "vw";
            div.style.width = 50/x + "vw"
            div.style.height = 50/x + "vw"
            div.setAttribute("id", `${j}:${i}`);
            div.addEventListener("mouseover", ()=>selectDiv(div));
            div.addEventListener("mousedown", ()=>selectDiv(div, true))
            gridContainer.appendChild(div);
        }
    }
}
createBoard(10)


function widgetCreate(){

    let widgetCover = document.createElement('div')
    widgetCover.id = "widget-cover"
    document.body.appendChild(widgetCover)
    let widgetBody = document.createElement("div")
    widgetBody.id = "widget-body"
    document.body.appendChild(widgetBody)

    let nickInput = document.createElement("input")
    nickInput.id = "nick-input"
    widgetBody.appendChild(nickInput)
    let nameInput = document.createElement("input")
    nameInput.id = "name-input"
    widgetBody.appendChild(nameInput)

    let levelSelect = document.createElement('select')




    widgetCover.addEventListener("click", function(){
        document.body.removeChild(widgetCover)
        document.body.removeChild(widgetBody)
    })
}


function selectDiv (div, click=false) {
    if(mouseDown || click){

        if (currentObjectType !== "") {

            let currentObjectColor = "black"

            if(currentObjectType=="START"){currentObjectColor="green"}

            else if(currentObjectType=="META"){currentObjectColor="red"}

            else if(currentObjectType=="PATH"){currentObjectColor="none"}

            else{currentObjectColor="black"}


            if (currentObjectType !== "DELETE") {

                let newObject = { id: div.id, x: parseInt(div.id.split(":")[1]), y: 0, z: parseInt(div.id.split(":")[0]), type: currentObjectType }

                let prev = level.objects.findIndex(object => object.id === newObject.id);

                if(currentObjectType === "START" && level.start!==false){console.log("start już jest")}
                else if(currentObjectType === "META" && level.end!==false){console.log("meta już jest")}

                else{
                    if (prev !== -1) {
                        console.log("już jest");
                        if(level.objects[prev].type === "START"){level.start = false}
                        if(level.objects[prev].type === "META"){level.end = false}
                        level.objects[prev] = newObject;

                    } else {
                        level.objects.push(newObject);
                        div.classList.remove("untagged")
                    }

                    div.style.background = currentObjectColor;
                    if(currentObjectType === "START"){level.start=newObject}
                    if(currentObjectType === "META"){level.end=newObject}

                    jsonArea.value = JSON.stringify(level.objects, null, 4);
                    console.log(level);
                }

            } else {
                let prev = level.objects.findIndex(object => object.id === div.id);
                if (prev !== -1) {
                    let deletedObject = level.objects.splice(prev, 1);
                    console.log(deletedObject)
                    if(deletedObject[0].type === "START"){level.start = false}
                    if(deletedObject[0].type === "META"){level.end = false}
                    jsonArea.value = JSON.stringify(level.objects, null, 4);
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
    element.addEventListener("click", function(){
    currentObjectType = element.id.split("-")[0].toUpperCase()
    let prev = document.getElementById("selectedButton");
    if (prev) {
        prev.removeAttribute("id");
    }
    this.setAttribute("id", "selectedButton");
    })
});


document.getElementById("save-button").addEventListener("click", function(){
    if(level.start !== false && level.end !== false){
        console.log("tworzenie poziomu")
        widgetCreate()

        level.walls = []

        level.objects.forEach(object => {
            if(level.objects.findIndex(tempObject => (tempObject.x==object.x+1 && tempObject.z==object.z)) == -1){
                level.walls.push(
                    {
                        x:object.x+1,
                        z:object.z
                    }
                )
            }

            if(level.objects.findIndex(tempObject => (tempObject.x==object.x-1 && tempObject.z==object.z)) == -1){
                level.walls.push(
                    {
                        x:object.x-1,
                        z:object.z
                    }
                )
            }

            if(level.objects.findIndex(tempObject => (tempObject.x==object.x && tempObject.z==object.z+1)) == -1){
                level.walls.push(
                    {
                        x:object.x,
                        z:object.z+1
                    }
                )
            }

            if(level.objects.findIndex(tempObject => (tempObject.x==object.x && tempObject.z==object.z-1)) == -1){
                level.walls.push(
                    {
                        x:object.x,
                        z:object.z-1
                    }
                )
            }
        });
    }
})