'use strict'

const EventEmitter = require('events')
const Transport = require('./transport')
const commands = [
    'auth',
    'call',
    'delete',
    'eval',
    'execute',
    'ping',
    'insert',
    'repace',
    'select',
    'update',
    'upsert',
]


module.exports = class Client extends EventEmitter {
    constructor (options = {}) {
        super()

        this.options = options
        this.transport = new Transport(options)
    }

    async connect () {
        const {port, host} = this.options

        return this.transport.connect(port, host)
    }

    async close () {
        return this.transport.close()
    }

    ping () {
        return this.transport.ping()
    }

    auth (...args) {
        return this.transport.auth.apply(this.transport, args)
    }

    call (...args) {
        return this.transport.call.apply(this.transport, args)
    }

    delete (...args) {
        return this.transport.delete.apply(this.transport, args)
    }

    eval (...args) {
        return this.transport.eval.apply(this.transport, args)
    }

    execute (...args) {
        return this.transport.execute.apply(this.transport, args)
    }

    insert (...args) {
        return this.transport.insert.apply(this.transport, args)
    }


    replace (...args) {
        return this.transport.replace.apply(this.transport, args)
    }

    select (...args) {
        return this.transport.select.apply(this.transport, args)
    }

    update (...args) {
        return this.transport.update.apply(this.transport, args)
    }

    upsert (...args) {
        return this.transport.upsert.apply(this.transport, args)
    }
}
