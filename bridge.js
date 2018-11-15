const http = require('http')
const https = require('https')

const express = require('express')
const url = require('url')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')

const { log } = require('./utils')

const app = express()

app.use(bodyParser.json())


// 配置 nunjucks 模板, 第一个参数是模板文件的路径
nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    noCache: true,
})

const clientByProtocol = (protocol) => {
    if (protocol === 'http:') {
        return http
    } else {
        return https
    }
}

const apiOptions = () => {
    const envServer = process.env.apiServer
    const defaultServer = 'http://0.0.0.0:3000'
    const server = envServer || defaultServer
    const result = url.parse(server)

    const obj = {
        headers: {
            'Content-Type': 'application/json',
        },
        rejectUnauthorized: false,
    }

    const options = Object.assign({}, obj, result)

    if (options.href.length > 0) {
        delete options.href
    }

    return options
}

const httpOptions = (request) => {
    const baseOptions= apiOptions()

    const pathOptions = {
        path: request.originalUrl,
    }

    const options = Object.assign({}, baseOptions, pathOptions)
    Object.keys(request.headers).forEach((k) => {
        options.headers[k] = request.headers[k]
    })
    options.method = request.method
    return options
}

app.get('/', (request, response) => {
    response.render('index.html')

})

app.all('/api/*', (request, response) => {
    // 这里request是浏览器发送的请求，response 也是浏览器拿到的响应
    // res 是api server 给到 node server 的响应
    const options = httpOptions(request)

    const client = clientByProtocol(options.protocol)

    // http.request or https.request 这是express 方法
    const r = client.request(options, (res) => {

        response.status(res.statusCode)

        Object.keys(res.headers).forEach((k) => {
            const v = res.headers[k]
            response.setHeader(k, v)
        })

        res.on('data', (data) => {
            log('debug data', data.toString('utf8'))
            response.write(data)
        })

        res.on('end', () => {
            response.end()
        })

        res.on('error', () => {
            console.error(`error to request: ${request.url}`)
        })
    })

    r.on('error', (error) => {
        console.error(`请求 api server 遇到问题: ${request.url}`, error)
    })

    log('debug options method', options.method)
    if (options.method !== 'GET') {
        // request.body 是浏览器发送过来的数据,
        // 如果不是 GET 方法, 说明 request.body 有内容,
        // 转成 JSON 字符串之后发送到 api server
        const body = JSON.stringify(request.body)
        log('debug body', body, typeof body)
        // 把 body 里的数据发送到 api server
        r.write(body)
    }

    // 结束发送请求
    r.end()
})

const run = (port=3000, host='') => {
    const server = app.listen(port, host, () => {
        const address = server.address()
        log(`server started at http://${address.address}:${address.port}`)
    })
}

if (require.main === module) {
    const port = 3300
    const host = '0.0.0.0'
    run(port, host)
}