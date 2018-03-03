
const msgpack = require('msgpack-lite')
const pipe = require('multipipe')
const { Transform } = require('stream')
const { TarantoolPacketStream } = require('packet-streams')
const {
    IPROTO,
    PREFIX_LENGTH,
    HEAD_LENGTH,
} = require('./constants')
const Decoder = msgpack.Decoder
const decoder = new Decoder()

module.exports = function (client) {

    return pipe(
        new TarantoolPacketStream(),
        new Transform({
            objectMode: true,
            transform (packet, enc, next) {
                const response = {}
                decoder.buffer = packet

                decoder.offset = PREFIX_LENGTH
                response.head = decoder.fetch()

                decoder.offset = PREFIX_LENGTH + HEAD_LENGTH
                response.body = decoder.fetch()

                const sync = response.head[IPROTO.SYNC]
                const code = response.head[IPROTO.CODE]
                const schemaId = response.head[IPROTO.SCHEMA_ID]

                if (!client.schemaId) {
                    client.schemaId = schemaId
                }

                if (schemaId && client.schemaId !== schemaId) {
                    client.schemaId = schemaId
                    client.emit('reloadSchema')
                }

                if (client.handlers[sync]) {

                    if (code === 0) {
                        const data = response.body[IPROTO.DATA]

                        client.handlers[sync](null, data)
                    } else {
                        client.handlers[sync](new Error(response.body[IPROTO.ERROR]))
                    }

                    delete client.handlers[sync]
                }

                next()
            }
        }))

}
