'use strict'

const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, indexId, key) {
    key = Array.isArray(key) ? key : [key]

    const body = new BufferMaker()

    body
        .uint8(0x83)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint8(indexId)

        .uint8(IPROTO.KEY)
        .msgpack(key)

    return body.create()
}
