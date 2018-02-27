const pipe = require('multipipe')
const { TarantoolPacketStream } = require('packet-streams')
const { Writable, Transform } = require('stream')
const msgpack = require('msgpack-lite')
const Decoder = msgpack.Decoder
const decoder = new Decoder()
const { IPROTO } = require('./constants')

module.exports = function ({handlers}) {
    return pipe(
        new TarantoolPacketStream(),
        new Transform({
            objectMode: true,
            transform (packet, enc, next) {
                decoder.buffer = packet
                const response = {}
                decoder.offset = 5
                response.head = decoder.fetch()

                decoder.offset = 28
                response.body = decoder.fetch()

                next(null, response)
            }
        }),
        new Writable({
            objectMode: true,
            write (response, enc, next) {
                const sync = response.head[IPROTO.SYNC]
                const code = response.head[IPROTO.CODE]

                if (handlers[sync]) {

                    if (code === 0) {
                        const data = response.body[IPROTO.DATA] || true
                        handlers[sync](null, data)
                    } else {
                        handlers[sync](new Error(response.body[IPROTO.ERROR]))
                    }

                    delete handlers[sync]
                }

                next()
            }
        })
    )
}
