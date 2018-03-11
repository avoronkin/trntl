const EventEmitter = require('events')
const debug = require('debug')('taran:client')
const { PassThrough } = require('stream')
const Connection = require('./Connection')
const response = require('./response')
const commands = require('./commands')
const {
    INDEX_SPACE,
    SPACE,
} = require('./constants')

module.exports = class Client extends EventEmitter {
    constructor (options = {}) {
        debug('init', options)
        super()

        this.connection = new Connection(options)
        this.buffer = new PassThrough({
            objectMode: true
        })
        this.buffer.pipe(this.connection)
        Object.assign(this, commands(this, this.buffer))
        Object.assign(this.connection, commands(this, this.connection))
        this.requests = {}
        this.spaces = {}
        this.indexes = {}
        this.id = 0
    }

    async connect () {
        debug('connect')
        if (this.connection.connecting) { return }

        await new Promise((resolve, reject) => {
            function onHandshake (data) {
                this.connection.removeListener('error', onError)
                const handshake = data.toString().split('\n')
                this.greeting = handshake[0]
                this.salt = handshake[1].trim()

                resolve()
            }

            function onError (error) {
                this.connection.removeListener('data', onHandshake)
                reject(error)
            }

            this.connection.once('data', onHandshake.bind(this))
            this.connection.once('error', onError.bind(this))

            this.connection.connect(this.port, this.host)
        })

        this.connection
            .pipe(response(this))
            .on('error', err => {
                this.emit('error', err)
            })

        await this.reloadSchema()
    }

    async close () {
        debug('close')
        return this.connection.close()
    }

    async reloadSchema () {
        debug('reloadSchema')
        this.buffer.cork()
        const spaces = await this.connection.select(SPACE.SPACE, INDEX_SPACE.NAME, 'all', [], 10000, 0)
        this.spaces = {}
        spaces.forEach(space => this.spaces[space[2]] = space[0])

        const indexes = await this.connection.select(SPACE.INDEX, INDEX_SPACE.INDEX_NAME, 'all', [], 10000, 0)
        this.indexes = {}
        indexes.forEach(index => this.indexes[`${index[0]}:${index[2]}`] = index[1])
        this.buffer.uncork()
    }

    // sendPacket (code, body) {
    //     const sync = ++this.id
    //     debug('send', code, sync, this.schemaId, body)
    //     const packet = makePacket(code, sync, this.schemaId, body)
    //
    //     this.requests[sync] = {
    //         params: {
    //             code,
    //             sync,
    //             schemaId: this.schemaId,
    //             body
    //         }
    //     }
    //
    //     return new Promise((resolve, reject) => {
    //         this.requests[sync].callback = (err, res) => {
    //             if (err) {
    //                 reject(err)
    //             } else {
    //                 resolve(res)
    //             }
    //         }
    //
    //         this.connection.send(packet)
    //     })
    // }
    //
    // async ping () {
    //     debug('ping')
    //     return this.sendPacket(REQUEST.PING)
    // }
    //
    // async auth (user, password) {
    //     debug('auth', user, password)
    //     return this.sendPacket(REQUEST.AUTH, body.auth(user, password, this.salt))
    // }
    //
    // async eval (expession, ...args) {
    //     debug('eval', expession, args)
    //     return this.sendPacket(REQUEST.EVAL, body.eval.apply(null, [expession, ...args]))
    // }
    //
    // async call (functionName, ...args) {
    //     debug('call', functionName, args)
    //     return this.sendPacket(REQUEST.CALL, body.call.apply(null, [functionName, ...args]))
    // }
    //
    // async select (spaceId, indexId, iterator = 'eq', key = [], limit = 1, offset = 0) {
    //     debug('select', spaceId, indexId, iterator, key, limit, offset)
    //     return this.sendPacket(REQUEST.SELECT, body.select(spaceId, indexId, iterator, key, limit, offset))
    // }
    //
    // async insert (spaceId, tuple) {
    //     debug('insert', spaceId, tuple)
    //     return this.sendPacket(REQUEST.INSERT, body.insert(spaceId, tuple))
    // }
    //
    // async replace (spaceId, tuple) {
    //     debug('replace')
    //     return this.sendPacket(REQUEST.REPLACE, body.replace(spaceId, tuple))
    // }
    //
    // async update (spaceId, indexId, key, ops) {
    //     debug('update', spaceId, indexId, key, ops)
    //     return this.sendPacket(REQUEST.UPDATE, body.update(spaceId, indexId, key, ops))
    // }
    //
    // async upsert (spaceId, indexId, ops, tuple) {
    //     debug('upsert', spaceId, indexId, ops, tuple)
    //     return this.sendPacket(REQUEST.UPSERT, body.upsert(spaceId, indexId, ops, tuple))
    // }
    //
    // async delete (spaceId, indexId, key) {
    //     debug('delete', spaceId, indexId, key)
    //     return this.sendPacket(REQUEST.DELETE, body.delete(spaceId, indexId, key))
    // }
    //
    // async reloadSchema () {
    //     debug('reloadSchema')
    //     const spaces = await this.select(SPACE.SPACE, INDEX_SPACE.NAME, 'all', [], 10000, 0)
    //     this.spaces = {}
    //     spaces.forEach(space => this.spaces[space[2]] = space[0])
    //
    //     const indexes = await this.select(SPACE.INDEX, INDEX_SPACE.INDEX_NAME, 'all', [], 10000, 0)
    //     this.indexes = {}
    //     indexes.forEach(index => this.indexes[`${index[0]}:${index[2]}`] = index[1])
    // }
    //
    // getIds (spaceName, indexName) {
    //     const spaceId = this.spaces[spaceName]
    //     const indexId = indexName ? this.indexes[spaceId + ':' + indexName] : undefined
    //
    //     return [spaceId, indexId]
    // }

}
