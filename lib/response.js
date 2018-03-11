
const msgpack = require('msgpack-lite')
const pipe = require('multipipe')
const { Transform } = require('stream')
const { TarantoolPacketStream } = require('packet-streams')
const debug = require('debug')('tarantool:response')

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
            async transform (packet, enc, next) {

                try {
                    const response = {}
                    decoder.buffer = packet

                    decoder.offset = PREFIX_LENGTH
                    response.head = decoder.fetch()

                    decoder.offset = PREFIX_LENGTH + HEAD_LENGTH
                    response.body = decoder.fetch()

                    const sync = response.head[IPROTO.SYNC]
                    const code = response.head[IPROTO.CODE]
                    const schemaId = response.head[IPROTO.SCHEMA_ID]

                    debug('response', response, client.requests[sync])
                    debug('schemaId', schemaId, client.schemaId)
                    if (schemaId && (!client.schemaId || client.schemaId !== schemaId)) {
                        // await client.reloadSchema()
                        client.schemaId = schemaId
                    }


                    if (client.requests[sync]) {

                        if (code === 0) {
                            client.requests[sync].callback(null, response.body[IPROTO.DATA])
                        } else {
                            client.requests[sync].callback(new Error(response.body[IPROTO.ERROR]))
                        }

                        delete client.requests[sync]
                    }

                    next()
                }

                catch (err) {
                    next(err)
                }
            }
        }))

}
