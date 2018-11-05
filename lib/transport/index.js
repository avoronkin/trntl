
'use strict'

const net = require('net')
const EventEmitter = require('events')
const { PassThrough, pipeline } = require('stream')
const PacketSpliter = require('./packetSpliter')
const packetHandler = require('./packetHandler')
const makeBody = require('./packet/body')
const makeHead = require('./packet/head')
const makePrefix = require('./packet/prefix')
const commands = require('./commands')

module.exports = class Transport extends EventEmitter {
    constructor (options = {}) {
        super()

        this.requests = {}
        this.id = 0
        this.maxId = 1 << 30
        // this.queue = new PassThrough({
        //     objectMode: true,
        //     highWaterMark: 10000
        // })

        this.socket = new net.Socket()
        this.socket.setKeepAlive(true)

        this.packetSpliter = new PacketSpliter()
        this.packetHandler = packetHandler(this.requests)

        if (options.socketTimeout) {
            this.socket.setTimeout(options.socketTimeout)
            this.socket.once('timeout', () => {
                this.socket.end()
            })
        }
    }

    sendCommand (code, args) {
        const sync = this.id === this.maxId ? 0 : ++this.id

        this.requests[sync] = {
            params: {
                code,
                sync,
                schemaId: this.schemaId,
                args
            }
        }

        const body = makeBody[code].apply(this, args)
        const head = makeHead(code, sync, this.schemaId)
        const prefix = makePrefix(head, body)

        return new Promise((resolve, reject) => {
            this.requests[sync].callback = (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            }

            this.socket.write(prefix)
            this.socket.write(head)
            if (body) {
                this.socket.write(body)
            }
        })
    }

    connect (...args) {

        return new Promise((resolve, reject) => {

            this.socket.once('data', data => {
                const handshake = data.toString().split('\n')
                this.greeting = handshake[0]
                this.salt = handshake[1].trim()

                pipeline(
                    // this.queue,
                    this.socket,
                    this.packetSpliter,
                    this.packetHandler,
                    (err) => {
                        if (err) {
                            this.emit('error', err)
                        }
                    }
                )

                resolve()

                // if (this.options.user && this.options.password) {
                //     // await this.auth(this.options.user, this.options.password)
                // }
            })

            this.socket.connect(...args)
        })

    }

    close () {
        return new Promise((resolve, reject) => {
            this.socket.once('close', resolve)

            if(this.socket) {
                this.socket.end()
            }
        })
    }
}

commands(module.exports)
