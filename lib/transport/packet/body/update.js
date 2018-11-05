'use strict'

const { IPROTO } = require('../../../constants')
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
        .msgpack(key)

        .uint8(IPROTO.TUPLE)
        .msgpack(ops)

    return body.create()
}
