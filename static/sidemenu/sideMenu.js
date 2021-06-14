const sideMenu = document.getElementById("side-menu")
const resizeButton = document.getElementById("resize-menu")
const homeButton = document.getElementById("home")
const playerLobbyButton = document.getElementById("player-lobby")
const levelCreatorButton = document.getElementById("level-creator")
let retracted = true

// console.log(sideMenuElements)

resizeButton.addEventListener("click", function(){
    if(retracted){
        sideMenu.classList.remove("retracted")
        resizeButton.innerText = "Schowaj Menu"
        homeButton.innerText = "Strona Główna"
        playerLobbyButton.innerText = "Dołącz do gry"
        levelCreatorButton.innerText = "Stwórz Labirynt"
        retracted = false
    }
    else{
        sideMenu.classList.add("retracted")
        resizeButton.innerText = ""
        homeButton.innerText = ""
        playerLobbyButton.innerText = ""
        levelCreatorButton.innerText = ""
        retracted = true
    }
})

homeButton.addEventListener("click", function(){
    document.location.href='http://localhost:3000/'
})
playerLobbyButton.addEventListener("click", function(){
    document.location.href='http://localhost:3000/lobby'
})
levelCreatorButton.addEventListener("click", function(){
    document.location.href='http://localhost:3000/creator'
})