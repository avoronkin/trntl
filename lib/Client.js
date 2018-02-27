
const net = require('net')
const msgpack = require('msgpack-lite')
const debug = require('debug')('tarantool:client')
const responses = require('./responses')
const { REQUEST, IPROTO } = require('./constants')
const { xor, sha1 } = require('./utils')


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
        await new Promise(resolve => this.write(data, resolve))
    }

    sendPacket (packet, id) {
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
        const id = ++this.id

        const packet = makePacket(makeHead(REQUEST.PING, id))

        return this.sendPacket(packet, id)
    }

    async auth () {
        const id = ++this.id
        const password = '12345'
        const user = 'test'

        const salt = new Buffer(this.salt, 'base64')
        const step_1 = sha1(password)
        const step_2 = sha1(step_1)
        const step_3 = sha1(Buffer.concat([salt, step_2]))
        const scramble = xor(step_1, step_3)

        const head = makeHead(REQUEST.AUTH, id)
        const body = makeBody({
            [IPROTO.USER_NAME]: user,
            [IPROTO.TUPLE]: ['chap-sha1', scramble]
        })
        const packet = makePacket(head, body)

        return this.sendPacket(packet, id)
    }
}

function makeHead (commandCode, syncId) {
    const head = Buffer.allocUnsafe(10)

    head[0] = 0x82

    head[1] = IPROTO.CODE
    head[2] = commandCode

    head[3] = IPROTO.SYNC
    head[4] = 0xce; head.writeUInt32BE(syncId, 5)

    return head
}

function makeBody (obj) {
    return msgpack.encode(obj)
}

function makePacket (head, body) {
    const length = head.byteLength + (body ? body.byteLength : 0)
    const packet = Buffer.allocUnsafe(length + 5)
    packet[0] = 0xce; packet.writeUInt32BE(length, 1)

    head.copy(packet, 5)

    if (body) {
        body.copy(packet, 5 + head.byteLength)
    }

    return packet
}
