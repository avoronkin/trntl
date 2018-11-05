'use strict'

const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (expession, ...args) {
    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.EXPR)
        .msgpack(expession)

        .uint8(IPROTO.TUPLE)
        .msgpack(args)

    return body.create()
}
