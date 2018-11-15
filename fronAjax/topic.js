const log = console.log.bind(console)
const e = (selector) => document.querySelector(selector)
const appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)

const ajax = (method, path, data, callback) => {
    const r = new XMLHttpRequest()
    r.open(method, path, true)
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = () => {
        if (r.readyState === 4) {
            callback(r.response)
        }
    }
    r.send(data)
}

const insertInput = () => {
    const t = `
        <div>
            <div>
                title: <input id="id-input-title">
            </div>
            <div>
                content: <input id="id-input-content">
            </div>
            <button id="id-button-add" class="topic-add" data-action="topic_add">add button</button>
        </div>
    `
    const element = e('#id-div-container')
    appendHtml(element, t)
}

const templateTopic = (topic) => {
    log('topic', topic, typeof topic)
    const title = topic.data.title
    const content = topic.data.content
    log('content', content)
    const id = topic.data.id
    const t = `
        <div class="topic-cell" data-id="${id}">
            <button class="topic-edit" data-action="topic_edit">编辑</button>
            <button class="topic-delete" data-action="topic_delete">删除</button>
            <span class="topic-title">${title}</span>
            <span class="topic-content">${content}</span>
        </div>
    `
    return t
}

const insertTopic = (topic) => {
    const container = e('#id-div-container')
    const html = templateTopic(topic)
    appendHtml(container, html)
}

class TopicApi {
    constructor() {
        this.baseUrl = 'http://0.0.0.0:3300/api/topic'
    }

    get(path, callback) {
        const url = this.baseUrl + path
        ajax('GET', url, '', (r) => {
            const data = JSON.parse(r)
            callback(data)
        })
    }

    post(path, data, callback) {
        const url = this.baseUrl + path
        ajax('POST', url, data, (r) => {
            const data = JSON.parse(r)
            callback(data)
        })
    }

    all(callback) {
        const path = '/all'
        this.get(path, callback)
    }

    add(data, callback) {
        const path = '/add'
        this.post(path, data, callback)
    }
}

const actionAdd = (event) => {
    const title = e('#id-input-title').value
    const content = e('#id-input-content').value
    let data = {
        title,
        content,
    }
    data = JSON.stringify(data)
    const api = new TopicApi()
    api.add(data, (topic) => {
        insertTopic(topic)
    })
}

const bindEventDelegates = () => {
    const actions = {
        topic_add: actionAdd,
        // topic_delete: actionDelete,
        // topic_edit: actionEdit,
    }

    const container = e('#id-div-container')
    container.addEventListener('click', (event) => {
        const self = event.target
        const actionName = self.dataset.action
        const action = actions[actionName]
        if (action !== undefined) {
            action(event)
        }
    })
}



const bindEvents = () => {
    bindEventDelegates()
    // bindEventUpdate()
}

const __main = () => {
    insertInput()
    bindEvents()
}

__main()
