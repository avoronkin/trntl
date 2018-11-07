'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [spaceId, tuple]) {
    packetTmpl
        .uint8(0x82)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.TUPLE)
        .msgpack(tuple)

    return packetTmpl
}
