'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [spaceId, indexId, key]) {
    key = Array.isArray(key) ? key : [key]

    packetTmpl
        .uint8(0x83)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint8(indexId)

        .uint8(IPROTO.KEY)
        .msgpack(key)

    return packetTmpl
}
