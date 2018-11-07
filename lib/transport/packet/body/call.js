'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [functionName, ...args]) {

    packetTmpl
        .uint8(0x82)

        .uint8(IPROTO.FUNCTION_NAME)
        .msgpack(functionName)

        .uint8(IPROTO.TUPLE)
        .msgpack(args)


    return packetTmpl
}
