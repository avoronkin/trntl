const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, indexId, ops, tuple) {
    const writer = new BufferMaker()

    const body = writer
        .uint8(0x84)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint16(indexId)

        .uint8(IPROTO.TUPLE)
        .buffer(msgpack.encode(ops))

        .uint8(IPROTO.OPS)
        .buffer(msgpack.encode(tuple))


        .create()

    return body
}
