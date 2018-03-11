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

        this.on('loadSchema', this.loadSchema.bind(this))
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



        await this.loadSchema()
    }

    async close () {
        debug('close')
        return this.connection.close()
    }

    async loadSchema () {
        debug('loadSchema')
        if (this.loadingSchema) return

        this.loadingSchema = true
        this.buffer.cork()

        const spaces = await this.connection.select(SPACE.SPACE, INDEX_SPACE.NAME, 'all', [], 10000, 0)
        this.spaces = {}
        spaces.forEach(space => this.spaces[space[2]] = space[0])

        const indexes = await this.connection.select(SPACE.INDEX, INDEX_SPACE.INDEX_NAME, 'all', [], 10000, 0)
        this.indexes = {}
        indexes.forEach(index => this.indexes[`${index[0]}:${index[2]}`] = index[1])

        this.buffer.uncork()
        this.loadingSchema = false
    }

    space (spaceName) {
        const client = this

        return {
            async insert (tuple) {
                const [spaceId] = client.getIds(spaceName)

                return client.insert(spaceId, tuple)
            },
            async select (indexName, iterator, key, limit, offset) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.select(spaceId, indexId, iterator, key, limit, offset)
            },
            async replace (tuple) {
                const [spaceId] = client.getIds(spaceName)

                return client.replace(spaceId, tuple)
            },
            async update (indexName, key, ops) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.update(spaceId, indexId, key, ops)
            },
            async upsert (indexName, ops, tuple) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.upsert(spaceId, indexId, ops, tuple)
            },
            async delete (indexName, key) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.delete(spaceId, indexId, key)
            }
        }
    }

}
