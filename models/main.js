const fs = require('fs')
const path = require('path')
const {log} = require('../utils')

const save = (data, path) => {
    const s = JSON.stringify(data, null, 2)
    fs.writeFileSync(path, s)
}

const ensureExists = (path) => {
    const exists = fs.existsSync(path)
    if (!exists) {
        const data = '[]'
        fs.writeFileSync(path, data)
    }
}

const load = (path) => {
    const options = {
        encoding: 'utf8',
    }
    ensureExists(path)
    const s = fs.readFileSync(path, options)
    const data = JSON.parse(s)
    return data
}

class Model {
    constructor(form={}) {
        this.id = form.id || undefined
        const now = Date.now()
        this.created_time = form.created_time || now
        this.updated_time = form.updated_time || now
    }

    static dbPath() {
        const classname = this.name.toLowerCase()
        const file = `db/${classname}.json`
        const p = path.join(__dirname, '..', file)
        return p
    }

    static __newFromMapper(dict) {
        return new this(dict)
    }

    static create(form={}, kwargs={}) {
        const m = new this(form)
        Object.keys(kwargs).forEach(k => m[k] = kwargs[k])
        m.save()
        return m
    }

    static remove(id) {
        const cls = this
        const ms = cls.all()
        const index = ms.findIndex(m => m.id === id)
        if (index > -1) {
            ms.splice(index, 1)
        }
        const path = cls.dbPath()
        save(ms, path)
    }

    static all() {
        const path = this.dbPath()
        const models = load(path)
        const ms = models.map(m => this.__newFromMapper(m))
        return ms
    }



    save() {
        const cls = this.constructor
        const models = cls.all()
        if (this.id === undefined) {
            if (models.length > 0) {
                const tail = models[models.length - 1]
                this.id = tail.id + 1
            } else {
                this.id = 1
            }
            models.push(this)
        } else {
            const index = models.findIndex(k => k.id === this.id)
            if (index > -1) {
                models[index] = this
            }
        }
        const path = cls.dbPath()
        save(models, path)
    }

    toString() {
        const s = JSON.stringify(this, null, 2)
        return s
    }
}

module.exports = Model
