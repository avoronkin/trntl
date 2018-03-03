
const net = require('net')
const debug = require('debug')('tarantool:client')
const {
    IPROTO,
    INDEX_SPACE,
    REQUEST,
    SPACE,
} = require('./constants')
const response = require('./response')

const makePacket = require('./packet/make')
const authBody = require('./packet/body/auth')
const evalBody = require('./packet/body/eval')
const callBody = require('./packet/body/call')
const deleteBody = require('./packet/body/delete')
const selectBody = require('./packet/body/select')

module.exports = class Client extends net.Socket{
    constructor (options = {}) {
        debug('init', options)
        options.allowHalfOpen = true
        super(options)

        this.setKeepAlive(true)
        this.setNoDelay(true)

        if (options.socketTimeout) {
            this.setTimeout(options.socketTimeout)
            this.once('timeout', () => {
                this.end()
            })
        }

        this.handlers = {}
        this.id = 0
    }

    async connect () {
        debug('connect')
        if (this.connecting) { return }

        await new Promise((resolve, reject) => {
            function onHandshake (data) {
                this.removeListener('error', onError)
                const handshake = data.toString().split('\n')
                this.greeting = handshake[0]
                this.salt = handshake[1].trim()

                resolve()
            }

            function onError (error) {
                this.removeListener('data', onHandshake)
                reject(error)
            }

            this.once('data', onHandshake.bind(this))
            this.once('error', onError.bind(this))

            super.connect(3301, 'localhost')
        })

        this
            .pipe(response(this))
            .on('error', err => {
                this.emit('error', err)
            })

        await this.loadSchema()
    }

    async close () {
        debug('close')
        if (this.destroyed) { return }

        await new Promise(resolve => {
            this.once('close', resolve)
            super.destroy()
        })
    }

    async send (data) {
        debug('send', data)
        await new Promise(resolve => this.write(data, resolve))
    }

    sendPacket (commandCode, body) {
        const id = ++this.id
        const packet = makePacket(commandCode, id, body, this.schemaId)

        return new Promise((resolve, reject) => {
            this.handlers[id] = (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            }

            this.send(packet)
        })
    }

    async ping () {
        return this.sendPacket(REQUEST.PING)
    }

    async auth (password, user) {
        return this.sendPacket(REQUEST.AUTH, authBody(user, password, this.salt))
    }

    async eval (expession, ...args) {
        return this.sendPacket(REQUEST.EVAL, evalBody.apply(null, [expession, ...args]))
    }

    async call (functionName, ...args) {
        return this.sendPacket(REQUEST.CALL, callBody.apply(null, [functionName, ...args]))
    }

    async select (spaceId, indexId, iterator = 'eq', key = [], limit = 1, offset = 0) {
        return this.sendPacket(REQUEST.SELECT, selectBody(spaceId, indexId, iterator, key, limit, offset))
    }

    async delete (spaceId, indexId, key) {
        return this.sendPacket(REQUEST.DELETE, deleteBody(spaceId, indexId, key))
    }

    async loadSchema () {
        console.log('loadSchema')
        const spaces = await this.select(SPACE.SPACE, INDEX_SPACE.NAME, 'all', [], 10000, 0)
        this.spaces = {}
        spaces.forEach(space => this.spaces[space[2]] = space[0])

        const indexes = await this.select(SPACE.INDEX, INDEX_SPACE.INDEX_NAME, 'all', [], 10000, 0)
        this.indexes = {}
        indexes.forEach(index => this.indexes[`${index[0]}:${index[2]}`] = index[1])
    }

    getIds (spaceName, indexName) {
        const spaceId = this.spaces[spaceName]
        const indexId = this.indexes[spaceId + ':' + indexName]

        return [spaceId, indexId]
    }

}
