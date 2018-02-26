const pipe = require('multipipe')
const { TarantoolPacketStream } = require('packet-streams')
const { Writable } = require('stream')
const msgpack = require('msgpack-lite')
const Decoder = msgpack.Decoder
const decoder = new Decoder()

module.exports = function ({handlers}) {
    return pipe(
        new TarantoolPacketStream(),
        new Writable({
            objectMode: true,
            write (packet, enc, next) {
                decoder.buffer = packet
                const response = {}
                decoder.offset = 5
                response.head = decoder.fetch()
                // console.log('head', response.head)
                const sync = response.head[1]

                if (!handlers[sync]) {
                    return next()
                }

                decoder.offset = 28
                response.body = decoder.fetch()
                // console.log('response', sync, packet, response)

                handlers[sync](response)

                delete handlers[sync]
                next()
            }
        })
    )
}
