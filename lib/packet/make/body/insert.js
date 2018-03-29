const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (spaceId, tuple) {
    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.SPACE_ID)
        .uint16(spaceId)

        .uint8(IPROTO.TUPLE)
        .msgpack(tuple)

    return body.create()
}
