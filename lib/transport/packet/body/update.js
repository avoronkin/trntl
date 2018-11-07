'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [spaceId, indexId, key, ops]) {

    packetTmpl
        .uint8(0x84)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint16(indexId)

        .uint8(IPROTO.KEY)
        .msgpack(key)

        .uint8(IPROTO.TUPLE)
        .msgpack(ops)

    return packetTmpl
}
