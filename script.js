'use strict';

(()=>{

const GEN_FIELD = (qId, value, text, cls=null) => {
    const fieldName = `q-${qId}--f`
    const fieldId = `q-${qId}--f-${value}`

    let container = document.createElement('div')
    container.classList.add('q-field')
    if (cls) container.classList.add(cls)
    let inputNode = document.createElement('input')
    inputNode.classList.add('q-field-input')
    inputNode.type = 'radio'
    inputNode.name = fieldName
    inputNode.id = fieldId
    inputNode.value = value
    let labelNode = document.createElement('label')
    labelNode.setAttribute('for', fieldId)
    let textNode = document.createElement('span')
    textNode.classList.add('q-field-text')
    textNode.innerText = text
    labelNode.appendChild(textNode)

    container.appendChild(inputNode)
    container.appendChild(labelNode)
    return container;
}

const GEN = {
    "yes-no": (qConf, id, CONF) => {
        let container = document.createElement('div')
        container.classList.add('question')
        container.classList.add('qType-yes-no')

        let text = document.createElement('div')
        text.classList.add('q-text')
        text.innerText = qConf.text

        let fieldset = document.createElement('fieldset');
        [
            {v:"NA", t: CONF.strings.noAnswer, c: 'opt-na'},
            {v:"n", t: CONF.strings.no},
            {v:"y", t: CONF.strings.yes}
        ].forEach(d => {
            fieldset.appendChild(GEN_FIELD(id, d.v, d.t, d.c || null))
        })

        container.appendChild(text)
        container.appendChild(fieldset)
        return container
    },
    "scale-5": (qConf, id, CONF) => {
        let container = document.createElement('div')
        container.classList.add('question')
        container.classList.add('qType-scale-5')

        let text = document.createElement('div')
        text.classList.add('q-text')
        text.innerText = qConf.text

        let fieldset = document.createElement('fieldset');
        [
            {v:"NA", t: CONF.strings.noAnswer, c: 'opt-na'},
            {v:"1", t: "1"},
            {v:"2", t: "2"},
            {v:"3", t: "3"},
            {v:"4", t: "4"},
            {v:"5", t: "5"}
        ].forEach(d => {
            fieldset.appendChild(GEN_FIELD(id, d.v, d.t, d.c || null))
        })

        container.appendChild(text)
        container.appendChild(fieldset)
        return container
    }
}

let confPromise = fetch('./config.json').then(data=>data.json())

window.addEventListener('DOMContentLoaded', ()=> confPromise.then(CONF=>{
    console.debug('loaded')
    console.debug('config', CONF)

    const ROOT = document.querySelector(':root')
    ROOT.setAttribute('data-active', 'start')

    let secStart = document.createElement('section')
    secStart.classList.add('sec-start')
    let startText = document.createElement('p')
    startText.innerText = CONF.strings.clickToStart
    secStart.appendChild(startText)
    let startBtn = document.createElement('button')
    startBtn.textContent = CONF.strings.btnStart
    startBtn.addEventListener('click', e => {
        e.preventDefault()
        ROOT.setAttribute('data-active', 'questions')
        return false
    })
    secStart.appendChild(startBtn)

    let secQs = document.createElement('section')
    secQs.classList.add('sec-questions')
    CONF.questions.forEach((q,idx) => {
        if (!GEN[q.type]) return console.warn('question type not found!', {q})
        let qNode = GEN[q.type](q, idx, CONF)
        secQs.appendChild(qNode)
    })
    let errorTxt = document.createElement('p')
    errorTxt.classList.add('errorMsg')
    errorTxt.classList.add('empty')
    let _err = txt => {
        errorTxt.innerText = txt
        errorTxt.classList.remove('empty')
        errorTxt.focus()
    }
    secQs.appendChild(errorTxt)
    let finishBtn = document.createElement('button')
    finishBtn.textContent = CONF.strings.btnFinish
    finishBtn.addEventListener('click', e => {
        e.preventDefault()
        let okay = true
        document.querySelectorAll('.sec-questions .question').forEach(qNode => {
            let answered = qNode.querySelectorAll('.q-field input:checked').length > 0
            if (!answered) okay = false
        })
        if (okay)
            ROOT.setAttribute('data-active', 'result')
        else
            _err(CONF.strings.errMissingFields)

        return false
    })
    secQs.appendChild(finishBtn)

    let result = CONF.results[Math.floor(Math.random()*CONF.results.length)]
    let resHeader = document.createElement('header')
    resHeader.innerText = CONF.strings.resultTitlePrefix + result.title
    let resDesc = document.createElement('p')
    resDesc.innerText = result.description
    let secResult = document.createElement('section')
    secResult.classList.add('sec-result')
    secResult.appendChild(resHeader)
    secResult.appendChild(resDesc)

    let main = document.createElement('main')
    main.appendChild(secStart)
    main.appendChild(secQs)
    main.appendChild(secResult)
    document.querySelector('#main').replaceWith(main)
}))

})()
