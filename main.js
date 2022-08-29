import ancientsData from '/data/ancients.js'
import difficaltiesLevel from '/data/difficulties.js'
import { brownCards, blueCards, greenCards } from '/data/mythicCards/index.js'

let greenCardsArray = []
let blueCardsArray = []
let brownCardsArray = []

let currentAncient // один из 4-х
let difficaltieLevel // (1 - очень легкий, 2 - легкий, 3 - средний, 4 - высокий, 5 - очень высокий)
let currentStep = 0 // 0 - выбор древнего, 1 - выбор сложности, 2 - замешивание колоды, 3 - финальный экран с колодой 4 
let finalCardArray = []
let currentCard
let currentCardIndex = 0

const render = (domElementId, template) => {
    if (!domElementId || !template) false
    document.querySelector(domElementId).innerHTML = template
}

const byStepRenderFunction = (step) => {
    switch (step) {
        case 1: 
            difficaltieLevelRender()
            break
        case 2: 

            buttonRender() 
            break
        case 3: 
            finalRender();
            break
    }
}

// рендер и логика отображения древних
const getDrTemplate = (activeIndex) => {
    const ancTemplate = ancientsData.map((anc, index) => {
        return (`
        <div class='anc-item' data-indexNumber=${index}>
            <img src='./assets/Ancients/${anc.name}.png'/>
        </div>`)
    })

    render('#anc', ancTemplate)

    const allAncient = document.querySelectorAll('.anc-item')

    allAncient.forEach((anc) => {
        anc.addEventListener('click', () => setAncActive(anc, allAncient))
    })
}

const setAncActive = (anc, allAncient) => {
    allAncient.forEach((item) => {
        item.classList.remove('active')
    })
    anc.classList.add('active')
    currentAncient = anc.dataset.indexnumber
    currentStep = 1
    changeStepEventEmit(currentStep)
}

const changeStepEventEmit = (step) => {
    const chagngeStepEvent = new CustomEvent('changeStep', { 
        detail : {
            step: step,
            currentAncient: currentAncient
        }
    })
    document.body.dispatchEvent(chagngeStepEvent)
}
//////////////////


// рендер и логика работы уровня сложности
const difficaltieLevelRender = () => {
    const difTemplate = difficaltiesLevel.map((dif) => {
        return (`
        <div class='dif-item' data-dif=${dif.id}>
           <p> ${dif.name} </p>
        </div>`)
    })
    render('#dif', difTemplate)
    const allDif = document.querySelectorAll('.dif-item')
    allDif.forEach((dif) => {
        dif.addEventListener('click', () => setDifActive(dif, allDif))
    })
}

const setDifActive = (dif, allDif) => {
    allDif.forEach((item) => {
        item.classList.remove('active')
    })
    dif.classList.add('active')
    difficaltieLevel = dif.dataset.dif
    currentStep = 2
    changeStepEventEmit(currentStep)
}
//////////////

// кнопку замешивания рендер
const buttonRender = () => {
    const butTemplate = `<div class='but'> Замешать карты </div>`
    render('#but', butTemplate)
    document.querySelector('.but').addEventListener('click', (e) => goCardCalculate(e))
}
////////////////

// логика смешения карт
const goCardCalculate = (e) => {
    e.currentTarget.classList.add('visited')
    currentStep = 3
    changeStepEventEmit(currentStep)
}
/////////////

// рендер колод
const finalRender = () => {
    initCardArrays()
    finalCardArray = finalCardsCalculate() 
    currentCard = finalCardArray[currentCardIndex][0]
    const imgTemplate = `
        <div class='cards'>
            <div class='cards-template'>
                <img src='./assets/mythicCardBackground.png' />
            </div> 
            <div class='cards-current'>
                
            </div>
        </div>
    `
    render('#final', imgTemplate)
    document.querySelector('.cards-template').addEventListener('click', onCardTemplateClick)
}

const onCardTemplateClick = () => {
    if (currentCardIndex >= finalCardArray.length) {
        return false
    }
    let currentCardUrl = currentCard.id + '.png'
    let img = new Image(200, 300)
    img.src = `./assets/MythicCards/${currentCardUrl}`
    document.querySelector('.cards-current').appendChild(img)
    currentCardIndex++
    if (currentCardIndex <= finalCardArray.length - 1) {
        currentCard = finalCardArray[currentCardIndex][0]
    }

}
//////////////////





// подсчеты и логика выбора карт
const finalCardsCalculate = () => {
    let finishArr = [...setCardsFunction('firstStage'), ...setCardsFunction('secondStage'), ...setCardsFunction('thirdStage')]
    currentStep = 4
    return finishArr
}

const setCardsFunction = (stage) => {
    const greenCount = ancientsData[currentAncient][stage].greenCards
    const blueCount = ancientsData[currentAncient][stage].blueCards
    const brownCount = ancientsData[currentAncient][stage].brownCards
    return [
        ...getRandomCards(greenCardsArray, greenCount),
        ...getRandomCards(blueCardsArray, blueCount),
        ...getRandomCards(brownCardsArray, brownCount)
    ]
}

const getRandomCards = (cardsArray, count) => {
    let resArray = []
    let currentDifCardsArray = setDiffArray(cardsArray)
    let currentItem
    for (let i = 0; i < count; i++) {
        currentItem = currentDifCardsArray.splice(Math.floor(Math.random()*currentDifCardsArray.length), 1)
        const index = cardsArray.map(o => o.id).indexOf(currentItem[0].id)
        cardsArray.splice(index, 1)
        resArray.push(currentItem)
    }
    return resArray
}

const initCardArrays = () => {
    greenCardsArray = [...greenCards]
    blueCardsArray = [...blueCards]
    brownCardsArray = [...brownCards]
    console.log(greenCardsArray)
    currentCardIndex = 0
}

const setDiffArray = (arr) => {
    switch (difficaltieLevel) {
        case 'easy':
            return arr.filter((item) => item.difficulty !== 'hard')
        case 'normal':
            return arr
        case 'hard':
            return arr.filter((item) => item.difficulty !== 'easy')
    }
}
//////////////////

document.body.addEventListener('changeStep', (e) => byStepRenderFunction(e.detail.step, e))

getDrTemplate()

