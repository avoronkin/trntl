'use strict'

const { IPROTO } = require('../../../constants')

module.exports = function (packetTmpl, [sql, params = []]) {

    packetTmpl
        .uint8(0x82)

        .uint8(IPROTO.SQL_TEXT)
        .msgpack(sql)

        .uint8(IPROTO.SQL_BIND)
        .msgpack(params)

    return packetTmpl
}
