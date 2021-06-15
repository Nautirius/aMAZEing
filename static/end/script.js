fetch('http://localhost:3000/endPrintData', {
        method: "GET",
    })
        .then(res => res.json()).then(res => {
            let app = document.getElementById("app")
            if(res.room === "ni mo"){
                app.innerText = "ni mo"
            }
            else{
                console.log(res.room.time)
            }
        })
        .catch(err => { console.log(err) })