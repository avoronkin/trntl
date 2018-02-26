
const debug = require('debug')('tarantool:client')
const net = require('net')
const responses = require('./responses')

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
            .pipe(responses({
                handlers: this.handlers
            }))
            .on('error', err => {
                this.emit('error', err)
            })
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
        await new Promise(resolve => super.write(data, resolve))
    }

    async ping () {
        const id = ++this.id

        const buffer = Buffer.alloc(15)
        buffer[0] = 0xce; buffer.writeUInt32BE(9, 1)

        buffer[5] = 0x82

        buffer[6] = 0x00
        buffer[7] = 64

        buffer[8] = 0x01
        buffer[9] = 0xce; buffer.writeUInt32BE(id, 10)


        return new Promise(resolve => {
            this.handlers[id] = (response) => {
                resolve(response)
            }

            this.send(buffer)
        })
    }
}
