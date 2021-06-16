fetch('http://localhost:3000/endPrintData', {
        method: "GET",
    })
        .then(res => res.json()).then(res => {
            let app = document.getElementById("app")
            if(res.room === "ni mo"){
                app.innerText = "ni mo"
            }
            else{
                console.log(res.room)

                if(res.room.win){
                    app.innerHTML=`<h1 style="color:green;">Gratulacje, wygrałeś!</h1><h2>Twój czas to: ${Math.floor(res.room.time/1000)}s</h2><img src="Science_Emoji_Vita.jpg" alt="Wygrana_zdj">`
                }else{
                    app.innerHTML=`<h1 style="color:red;">Przegrana</h1><h2>Czas po jakim się poddałeś: ${Math.floor(res.room.time/1000)}s</h2><img id="img" src="./20210529_235718.jpg" alt="Przegrana_zdj">`
                }
            }
        })
        .catch(err => { console.log(err) })