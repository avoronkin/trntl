
const msgpack = require('msgpack-lite')
const pipe = require('multipipe')
const { Transform } = require('stream')
const { TarantoolPacketStream } = require('packet-streams')
const debug = require('debug')('tarantool:response')

const {
    IPROTO,
    PREFIX_LENGTH,
    HEAD_LENGTH,
    REQUEST,
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

                    debug('response', response, client.requests[sync] && client.requests[sync].params)
                    debug('schemaId', schemaId, client.schemaId)

                    if (schemaId && (!client.schemaId || client.schemaId < schemaId)) {
                        client.emit('loadSchema', schemaId)
                    }

                    if (client.requests[sync]) {

                        if (code === 0) {
                            if (client.requests[sync].params.code === REQUEST.EXECUTE) {
                                const result = {}

                                const data = response.body[IPROTO.DATA]
                                if (data) {
                                    result.data = data
                                }

                                const metadata = response.body[IPROTO.METADATA]
                                if (metadata) {
                                    result.metadata = metadata.map(item => {
                                        return {fieldName: item[IPROTO.FIELD_NAME]}
                                    })
                                }

                                const info = response.body[IPROTO.SQL_INFO]
                                if (info) {
                                    result.info = {}

                                    Object.keys(info).forEach(key => {
                                        if (key == IPROTO.SQL_ROW_COUNT) {
                                            result.info.row_count = info[IPROTO.SQL_ROW_COUNT]
                                        }
                                    })
                                }

                                client.requests[sync].callback(null, result)
                            } else {
                                client.requests[sync].callback(null, response.body[IPROTO.DATA])
                            }
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
