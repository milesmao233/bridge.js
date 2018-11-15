const Model = require('./main')
const { log } = require('../utils')

class Topic extends Model {
    constructor(form={}) {
        super(form)
        this.title = form.title || ''
        this.content = form.content || ''
    }
}

module.exports = Topic