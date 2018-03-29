const msgpack = require('msgpack-lite')
const { PREFIX_LENGTH, HEAD_LENGTH } = require('../../constants')
const Decoder = msgpack.Decoder
const decoder = new Decoder()

module.exports = function (packet) {
    const response = {}
    decoder.buffer = packet

    decoder.offset = PREFIX_LENGTH
    response.head = decoder.fetch()

    decoder.offset = PREFIX_LENGTH + HEAD_LENGTH
    response.body = decoder.fetch()

    return response
}
