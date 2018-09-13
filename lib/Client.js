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

// module.exports =
class Client extends EventEmitter {
    constructor (options = {}) {
        debug('init', options)
        super()

        this.options = options

        this.connection = new Connection(options)
        this.buffer = new PassThrough({
            objectMode: true,
            highWaterMark: 10000
        })
        this.buffer.pipe(this.connection)
        Object.assign(this, commands(this, this.buffer))
        Object.assign(this.connection, commands(this, this.connection))
        this.requests = {}
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

        if (this.options.user && this.options.password) {
            await this.auth(this.options.user, this.options.password)
        }
    }

    async close () {
        debug('close')
        return this.connection.close()
    }
}


module.exports = Client
