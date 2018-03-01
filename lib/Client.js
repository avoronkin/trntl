
const net = require('net')
const msgpack = require('msgpack-lite')
const debug = require('debug')('tarantool:client')
const response = require('./response')
const { REQUEST, IPROTO } = require('./constants')
const { xor, sha1 } = require('./utils')
const makePacket = require('./commands/makePacket')
const Writer = require('./Writer')

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
            .pipe(response({
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
        await new Promise(resolve => this.write(data, resolve))
    }

    sendPacket (commandCode, body) {
        const id = ++this.id
        const packet = makePacket(commandCode, id, body)

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

    async auth () {
        const password = '12345'
        const user = msgpack.encode('test')
        const chapSha1 = msgpack.encode('chap-sha1')

        const salt = new Buffer(this.salt, 'base64')
        const step_1 = sha1(password)
        const step_2 = sha1(step_1)
        const step_3 = sha1(Buffer.concat([salt, step_2]))
        const scramble = xor(step_1, step_3)

        const writer = new Writer()

        const body = writer
            .uint8(0x82)
            .uint8(IPROTO.USER_NAME)
            .buffer(user)
            .uint8(IPROTO.TUPLE)
            .uint8(0x92)
            .buffer(chapSha1)
            .uint8(0xb4)
            .buffer(scramble)
            .create()

        return this.sendPacket(REQUEST.AUTH, body)
    }
}
