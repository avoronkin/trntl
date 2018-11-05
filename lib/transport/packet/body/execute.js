'use strict'

const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (sql, params = []) {
    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.SQL_TEXT)
        .msgpack(sql)

        .uint8(IPROTO.SQL_BIND)
        .msgpack(params)

    return body.create()
}
