
'use strict'

const EventEmitter = require('events')
const net = require('net')
const { PassThrough, pipeline } = require('stream')
const PacketSpliter = require('./packetSpliter')
const packetHandler = require('./packetHandler')
const makePacket = require('./packet/make')
const commands = require('./commands')
const { SPACE, INDEX_SPACE } = require('../constants')
const { promisifyEvents } = require('./utils')

module.exports = class Transport extends EventEmitter {
    constructor (options = {}) {
        super()

        this.requests = {}
        this.id = 0
        this.maxId = 1 << 30

        this.queue = new PassThrough()

        this.socket = new net.Socket(options)

        this.packetSpliter = new PacketSpliter()
        this.packetHandler = packetHandler(this.requests)

        pipeline(
            this.packetSpliter,
            this.packetHandler,
            (err) => {
                if (err) {
                    this.emit('error', err)
                }
            }
        )

        // if (options.socketTimeout) {
        //     this.socket.setTimeout(options.socketTimeout)
        //     this.socket.once('timeout', () => {
        //         this.socket.end()
        //     })
        // }
    }

    sendCommand (code, args) {
        const sync = this.id === this.maxId ? 0 : ++this.id
        const schemaId = this.schemaId

        this.requests[sync] = {
            params: {
                code,
                sync,
                schemaId,
                args
            }
        }

        const packet = makePacket([code, sync, schemaId], args)

        return new Promise((resolve, reject) => {
            this.requests[sync].callback = (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            }

            this.queue.write(packet)
        })
    }

    async connect (...args) {
        if (this.socket.connecting) {
            return
        }

        this.queue.unpipe(this.socket)
        this.socket.unpipe(this.packetSpliter)

        await promisifyEvents(this.socket, 'connect', ['error', 'timeout'], 'connect', args)

        const buffer = await promisifyEvents(this.socket, 'data')

        this.parseHandshake(buffer)

        this.queue.pipe(this.socket)
        this.socket.pipe(this.packetSpliter)

        if (this.user) {
            await this.auth(this.user, this.password)
        }

        await this.loadSchema()
    }

    async close () {
        if (this.socket.destroyed) {
            return
        }

        await promisifyEvents(this.socket, 'close', 'error', 'end')
    }

    parseHandshake (buffer) {
        const handshake = buffer.toString().split('\n')
        this.greeting = handshake[0]
        this.salt = handshake[1].trim()
    }

    async loadSchema () {
        const [_spaces, _indexes] = await Promise.all([
            this.select(SPACE.SPACE, INDEX_SPACE.NAME, 'all', [], 10000, 0),
            this.select(SPACE.INDEX, INDEX_SPACE.INDEX_NAME, 'all', [], 10000, 0)
        ])

        const spaces = {}
        _spaces.forEach(space => spaces[space[2]] = space[0])

        const indexes = {}
        _indexes.forEach(index => indexes[`${index[0]}:${index[2]}`] = index[1])

        return [ spaces, indexes ]
    }
}

commands(module.exports)
