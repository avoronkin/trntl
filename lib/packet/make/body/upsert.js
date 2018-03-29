const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, indexId, ops, tuple) {
    const body = new BufferMaker()

    body
        .uint8(0x84)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint16(indexId)

        .uint8(IPROTO.TUPLE)
        .msgpack(ops)

        .uint8(IPROTO.OPS)
        .msgpack(tuple)

    return body.create()
}
