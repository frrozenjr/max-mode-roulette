// fetchAndProcessData.js

export async function fetchAndProcessData(ml, ul, extended) {
    try {
        // Fetch the HTML from the proxy using the provided URL
        const urls = {
            "ML": "https://sites.google.com/view/maxmodelist/main-list/ml-primary",
            "MLextended": "https://sites.google.com/view/maxmodelist/main-list/ml-extended",
            "UL": "https://sites.google.com/view/maxmodelist/unlimited-list/ul-primary",
            "ULextended": "https://sites.google.com/view/maxmodelist/unlimited-list/ul-extended"
        }

        let response
        let html = ""
        if (ml == true) {
            response = await fetch(`https://fritty.7m.pl/proxy.php?url=${urls.ML}`)
            html = await response.text()
            if (extended == true) {
                response = await fetch(`https://fritty.7m.pl/proxy.php?url=${urls.MLextended}`)
                html = html + await response.text()
            }
        } else if (ul == true) {
            response = await fetch(`https://fritty.7m.pl/proxy.php?url=${urls.UL}`)
            html = await response.text()
            if (extended == true) {
                response = await fetch(`https://fritty.7m.pl/proxy.php?url=${urls.ULextended}`)
                html = html + await response.text()
            }
        }

        // Parse HTML
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        // Prepare to extract data
        const extractedData = []
        const sections = doc.querySelectorAll('div.tyJCtd.mGzaTb.Depvyb.baZpAe')

        sections.forEach((section, index) => {
            const data = {}

            // Extract Position and Game Title
            let titleElement = section.querySelector('h1')
            if (!titleElement) {
                titleElement = section.querySelector('p')
            }

            if (titleElement) {
                const titleText = titleElement.textContent.trim()

                // Adjusted regex to handle different formats
                const positionMatch = titleText.match(/#\s*(\d+)\s*[-\s]*(.*)$/)
                if (positionMatch) {
                    data.position = positionMatch[1].trim()
                    data.gameTitle = positionMatch[2].trim()
                } else {
                    data.position = 'Unknown'
                    data.gameTitle = 'Unknown'
                }
            } else {
                data.position = 'Unknown'
                data.gameTitle = 'Unknown'
            }

            const games = {
                "True Nightmare No Post Mortem": "https://gamejolt.com/games/OblitusCasa/356260",
                "Ultimate Despair": "https://gamejolt.com/games/MonolithicChristmasNight/723872",
                "True Nightmare No Luring Together": "https://gamejolt.com/games/OblitusCasa/356260"
            }

            // Extract Game Link
            if (!Object.keys(games).includes(data.gameTitle)) {
                const gameLinkElement = section.querySelector('a.XqQF9c')
                if (gameLinkElement) {
                    data.gameLink = gameLinkElement.href
                } else {
                    data.gameLink = 'No link available'
                }
            } else {
                data.gameLink = games[data.gameTitle]
            }

            // Extract Game Title
            const gameTitleElement = section.querySelector('span.Ztu2ge.C9DxTc')
            if (gameTitleElement) {
                data.gameTitleLink = gameTitleElement.textContent
            } else {
                data.gameTitleLink = 'No title available'
            }

            // Extract Length of Night
            let nightLength = 'No length available'
            const pElements = section.querySelectorAll('p.zfr3Q.CDt4Ke')

            pElements.forEach(p => {
                const labelSpan = p.querySelector('span.C9DxTc')
                if (labelSpan && labelSpan.textContent.includes('Length of Night:')) {
                    const nextElement = labelSpan.nextElementSibling
                    if (nextElement && nextElement.tagName.toLowerCase() === 'span') {
                        nightLength = nextElement.textContent.trim()
                    }
                }
            })

            // Process and convert night length to seconds
            if (nightLength !== 'No length available') {
                const numbers = nightLength.split(" ")
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
                nightLength = seconds.toString()
                if (!extractedData[extractedData.length - 1].ignore) {
                    extractedData[extractedData.length - 1].nightLength = nightLength
                }
            }

            const hardCodedGames = {
                "Puppet Night All Challenges": "360",
                "Nightmare All Challenges": "540",
                "Girlboss": "373",
                "Final Night All Challenges No Stalling": "780",
                "The Challenge": "20",
                "Neverending Nightmare": "690",
                "15/22 Aggressive": "420",
                "Sorrow Spring": "406",
                "14/22 Mode": "120",
                "GRADUATION DAY": "540",
                "Parasitic Pals Aggressive AIs": "600",
                "Hasta La Pasta!": "460",
                "8/20 Mode": "202"
            }

            if (Object.keys(hardCodedGames).includes(data.gameTitle)) {
                data.nightLength = hardCodedGames[data.gameTitle] // this is for either N/A night lengths or the length is broken
                data.ignore = true
            }

            // Store the extracted data
            if (data.gameTitle !== 'Unknown') {
                extractedData.push(data)
            }
        })

        // Extract YouTube URLs
        const youtubeLinks = []
        const sections2 = doc.querySelectorAll('a.fqo2vd')

        sections2.forEach((section) => {
            const link = section.href
            const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^"&?\/\s]{11})/
            const match = link.match(regex)
            youtubeLinks.push(`https://img.youtube.com/vi/${match ? match[1] : ''}/0.jpg`)
        })

        // Add YouTube images to extracted data, accounting for the offset
        extractedData.forEach((data, index) => {
            const isExtended = parseInt(data.position) > 75 // Determine if the data is from the extended list
            const imageIndex = isExtended ? index + 1 : index // Adjust index based on list type

            if (youtubeLinks[imageIndex]) {
                data.image = youtubeLinks[imageIndex]
            } else {
                data.image = 'No image available'
            }
        })

        if (extractedData.length === 0) {
            extractedData.push({ error: 'No relevant data found' })
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

        //console.log(JSON.stringify(extractedData, null, 2))

        extractedData.push(1) // The number of max modes you've done so far

        return extractedData
    } catch (error) {
        console.error('Error fetching or processing data:', error)
        return [{ error: 'Error fetching or processing data' }]
    }
}

export function createBox(table) {
    if (table !== null) {
        const imageUrl = table[0]
        const title = table[1]
        const game = table[2]
        const progress = table[3]
        const gamelink = table[4]
        const box = document.createElement('div')
        box.className = 'mode'

        const img = document.createElement('img')
        img.src = imageUrl
        img.alt = 'Image'

        const imgContainer = document.createElement('div')
        imgContainer.className = 'image-container'

        imgContainer.append(img)

        const h2 = document.createElement('h2')
        h2.textContent = title

        const h4 = document.createElement('h4')
        h4.textContent = progress
        h4.className = "progress"

        const link = document.createElement('a')
        const p = document.createElement('p')
        link.textContent = game
        link.href = gamelink

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

