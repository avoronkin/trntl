const msgpack = require('msgpack-lite')
const { IPROTO, ITERATOR_TYPES } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, indexId, iterator = 'eq', key, limit = 1, offset = 0) {
    key = Array.isArray(key) ? key : [key]

    const writer = new BufferMaker()

    const body = writer
        .uint8(0x86)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.INDEX_ID)
        .uint16(indexId)

        .uint8(IPROTO.LIMIT)
        .uint32(limit)

        .uint8(IPROTO.OFFSET)
        .uint32(offset)

        .uint8(IPROTO.ITERATOR)
        .uint8(ITERATOR_TYPES[iterator])

        .uint8(IPROTO.KEY)
        .buffer(msgpack.encode(key))

        .create()

    return body
}