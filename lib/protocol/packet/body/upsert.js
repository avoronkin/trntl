'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [spaceId, indexId, ops, tuple]) {
    packetTmpl
        .uint8(0x84)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint16(indexId)

        .uint8(IPROTO.TUPLE)
        .msgpack(ops)

        .uint8(IPROTO.OPS)
        .msgpack(tuple)

    return packetTmpl
}
