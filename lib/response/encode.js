const { Transform } = require('stream')
const msgpack = require('msgpack-lite')
const Decoder = msgpack.Decoder
const decoder = new Decoder()
const { PREFIX_LENGTH } = require('../constants')

module.exports = function () {
    return new Transform({
        objectMode: true,
        transform (packet, enc, next) {
            const response = {}
            decoder.buffer = packet

            decoder.offset = PREFIX_LENGTH
            response.head = decoder.fetch()

            decoder.offset = PREFIX_LENGTH + 23
            response.body = decoder.fetch()

            next(null, response)
        }
    })
}
