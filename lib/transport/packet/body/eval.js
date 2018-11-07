'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [expession, ...args]) {

    packetTmpl
        .uint8(0x82)

        .uint8(IPROTO.EXPR)
        .msgpack(expession)

        .uint8(IPROTO.TUPLE)
        .msgpack(args)

    return packetTmpl
}
