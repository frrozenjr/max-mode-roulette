// fetchAndProcessData.js

export async function fetchAndProcessData(ml, ul, extended) {
    try {
        // Api link
        const api = "https://fnafmml.com/api/maxmodes/list"

        const extractedData = []
        let list = "ml"

        if (ul == true) {
            list = "ul"
        }

        let data = []

        for (let i = 1; i <= 3; i++) {

            const targetUrl = encodeURIComponent(`${api}?list=${list}&page=${i}`);

            await fetch(`https://corsproxy.io/?${targetUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(newres => {
                data.push(...newres.maxmodes)
            })
            .catch(error => {
                console.error('Error:', error)
            });

        }



// 
        let levels = extended ? 150 : 75
        for (let i = 0; i < levels; i++) {
            let dataChunk = data[i]

            let maxmode = {}
            maxmode.position = i + 1
            maxmode.gameTitle = dataChunk.title
            maxmode.gameLink = dataChunk.game.link
            maxmode.gameTitleLink = dataChunk.game.title
            console.log(maxmode.gameTitle, dataChunk)

            let nightLength = dataChunk.avg_length_seconds
            if (nightLength === 0) {
                nightLength = dataChunk.completion_avg_time
            }

            /*const numbers = nightLength.split(" ")
            let minutes = 0
            let seconds = 0
            const minuteStrings = ["minutes", "mins.", "min."]

            if (numbers[0] !== "N/A") {
                if (numbers[1] && minuteStrings.includes(numbers[1].toLowerCase())) {
                    minutes = parseInt(numbers[0])
                } else {
                    minutes = parseInt(numbers[0])
                }
                if (numbers[1] === "minutes" && numbers[2]) {
                    seconds = parseInt(numbers[2])
                }
            }

            seconds += minutes * 60
            nightLength = seconds.toString()*/

            maxmode.nightLength = nightLength

            // Cache youtube image
            maxmode.image = dataChunk.thumbnail_url
            maxmode.videoID = maxmode.image.split("/")[4]

            extractedData.push(maxmode)
        }

        const numbers = []

        for (let i = 0; i < extractedData.length; i++) {
            if (extractedData[i].nightLength !== "0") {
                numbers.push(parseInt(extractedData[i].position))
            }
        }

        const result = []
        while (result.length < 50) {
            const randomIndex = Math.floor(Math.random() * numbers.length)
            result.push(numbers[randomIndex])
            numbers.splice(randomIndex, 1)
        }
        extractedData.push(0) // New score

        extractedData.push(false) // Toggle if you want to 100% all max modes.

        extractedData.push("FNaF Max Mode Roulette") // Title

        extractedData.push(result)

        // console.log(JSON.stringify(extractedData, null, 2))

        extractedData.push(1) // The number of max modes you've done so far

        return extractedData
    } catch (error) {
        console.error('Error fetching or processing data:', error)
        return [{ error: 'Error fetching or processing data' }]
    }
}

export function createBox(table) {
    // let goodbyetext = document.body.getElementsByClassName('goodbye')[0]
    // if (goodbyetext !== undefined) {
    //     goodbyetext.remove()
    // }
    if (table !== null) {
        const imageUrl = table[0]
        const title = table[1]
        const game = table[2]
        const progress = table[3]
        const gamelink = table[4]
        const videoID = table[5]
        const box = document.createElement('div')
        box.className = 'mode'

        const img = document.createElement('img')
        img.src = imageUrl
        img.alt = 'Image'

        const imgContainer = document.createElement('div')
        imgContainer.className = 'image-container'
        if (videoID !== undefined) {
            const a = document.createElement('a')
            a.href = `https://www.youtube.com/watch?v=${videoID}`
            a.target = "_blank"

            imgContainer.append(a)
            a.append(img)
        } else {
            imgContainer.append(img)
        }

        const h2 = document.createElement('h2')
        h2.textContent = title

        const h4 = document.createElement('h4')
        h4.textContent = progress
        h4.className = "progress"

        const link = document.createElement('a')
        const p = document.createElement('p')
        link.textContent = game
        link.href = gamelink
        link.target = "_blank"

        p.appendChild(link)

        const textContainer = document.createElement('div')
        textContainer.className = 'text-container'

        textContainer.appendChild(h2)
        textContainer.appendChild(p)
        textContainer.appendChild(h4)

        const h3 = document.createElement('h3')
        h3.textContent = ""
        h3.className = "progress"

        const buttonContainer = document.createElement('div')
        buttonContainer.className = 'button-container'

        const button1 = document.createElement('button')
        button1.textContent = 'Skip'
        button1.className = "skip"
        
        const button2 = document.createElement('button')
        button2.textContent = 'Next'
        button2.className = "next"
        
        buttonContainer.appendChild(button1)
        buttonContainer.appendChild(button2)

        box.appendChild(imgContainer)
        box.appendChild(textContainer)
        box.appendChild(h3)
        box.appendChild(buttonContainer)

        return box
    } else {
        const box = document.createElement('div')
        box.className = 'mode'

        const h2 = document.createElement('h6')
        h2.textContent = `Good job! You beat the roulette. Final ${document.getElementsByClassName('score')[0].textContent}`

        box.appendChild(h2)
        
        return box
    }
}

