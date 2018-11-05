'use strict'

const msgpack = require('msgpack-lite')
const { Writable } = require('stream')
const { PREFIX_LENGTH, HEAD_LENGTH, IPROTO, REQUEST } = require('../constants')

module.exports = function (requests) {
    const Decoder = msgpack.Decoder
    const decoder = new Decoder()

    return new Writable({
        objectMode: true,
        write (buffer, enc, next) {
            decoder.buffer = buffer
            decoder.offset = PREFIX_LENGTH
            const head = decoder.fetch()
            const sync = head[IPROTO.SYNC]
            const code = head[IPROTO.CODE]
            const schemaId = head[IPROTO.SCHEMA_ID]

            decoder.offset = PREFIX_LENGTH + HEAD_LENGTH
            const body = decoder.fetch()

            const request = requests[sync]

            if (request) {
                let error = null
                let response

                if (code !== 0) {
                    error = new Error(body[IPROTO.ERROR])
                } else if (request.params.code === REQUEST.EXECUTE) {

                    response = {}
                    console.log(body)

                    const data = body[IPROTO.DATA]
                    const metadata = body[IPROTO.METADATA]
                    const info = body[IPROTO.SQL_INFO]

                    if (data) {
                        response.data = data
                    }

                    if (metadata) {
                        response.metadata = metadata.map(item => {
                            return { fieldName: item[IPROTO.FIELD_NAME] }
                        })
                    }

                    if (info) {
                        response.info = {}

                        Object.keys(info).forEach(key => {
                            if (key == IPROTO.SQL_INFO_ROW_COUNT) {
                                response.info.row_count = info[IPROTO.SQL_INFO_ROW_COUNT]
                            }
                        })
                    }

                } else {
                    response = body[IPROTO.DATA]
                }

                request.callback(error, response)

                delete requests[sync]
            }

            next()
        }
    })
}
