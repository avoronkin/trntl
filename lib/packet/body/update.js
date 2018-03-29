const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, indexId, key, ops) {
    const body = new BufferMaker()

    body
        .uint8(0x84)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint16(indexId)

        .uint8(IPROTO.KEY)
        .buffer(msgpack.encode(key))

        .uint8(IPROTO.TUPLE)
        .buffer(msgpack.encode(ops))

    return body.create()
}
