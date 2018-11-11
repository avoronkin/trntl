'use strict'

const EventEmitter = require('events')
const Protocol = require('./protocol')
const { SPACE, INDEX_SPACE } = require('./constants')

module.exports = class Client extends EventEmitter {
    constructor (options = {}) {
        super()

        this.options = options
        this.protocol = new Protocol(options)
    }

    async connect () {
        const {port, host} = this.options

        return this.protocol.connect(port, host)
    }

    async close () {
        return this.protocol.close()
    }

    async ping () {
        return this.protocol.ping()
    }

    async auth (...args) {
        return this.protocol.auth.apply(this.protocol, args)
    }

    async call (...args) {
        return this.protocol.call.apply(this.protocol, args)
    }

    async delete (...args) {
        return this.protocol.delete.apply(this.protocol, args)
    }

    async eval (...args) {
        return this.protocol.eval.apply(this.protocol, args)
    }

    async execute (...args) {
        return this.protocol.execute.apply(this.protocol, args)
    }

    async insert (...args) {
        return this.protocol.insert.apply(this.protocol, args)
    }

    async replace (...args) {
        return this.protocol.replace.apply(this.protocol, args)
    }

    async select (...args) {
        return this.protocol.select.apply(this.protocol, args)
    }

    async update (...args) {
        return this.protocol.update.apply(this.protocol, args)
    }

    async upsert (...args) {
        return this.protocol.upsert.apply(this.protocol, args)
    }

    async loadSchema () {
        const [spaces, indexes] = await this.protocol.loadSchema.apply(this.protocol)

        this.spaces = spaces
        this.indexes = indexes
    }

    getIds (spaceName, indexName) {
        const spaceId = this.spaces[spaceName]
        const indexId = indexName ? this.indexes[spaceId + ':' + indexName] : undefined

        return [spaceId, indexId]
    }
}
