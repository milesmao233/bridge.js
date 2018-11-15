const express = require('express')
const Topic = require('../models/topic')
const { jsonResponse } = require('./main')

const router = express.Router()

router.get('/all', (request, response) => {
    const ms = Topic.all()
    const dict = {
        success: true,
        data: ms,
        message: '',
    }
    jsonResponse(request, response, dict)
})

router.post('/add', (request, response) => {
    const form = request.body
    const m = Topic.create(form)
    const dict = {
        success: true,
        data: m,
        message: '',
    }

    jsonResponse(request, response, dict)
})

module.exports = router
