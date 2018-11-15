const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const { log } = require('./utils')

// app.use(bodyParser.urlencoded({
//     extended: true
// }))

app.use(bodyParser.json())


// 路由
const apiTopic = require('./api/topic')

app.use('/api/topic', apiTopic)

const run = (port=3000, host='') => {
    const server = app.listen(port, host, () => {
        const address = server.address()
        log(`listening server at http://${address.address}:${address.port}`)
    })
}

if (require.main === module) {
    const port = 3000
    const host = '0.0.0.0'
    run(port, host)
}