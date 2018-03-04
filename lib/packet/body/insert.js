const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, tuple) {
    const writer = new BufferMaker()

    const body = writer
        .uint8(0x82)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.TUPLE)
        .buffer(msgpack.encode(tuple))

        .create()

    return body
}
