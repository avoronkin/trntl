const { IPROTO } = require('../../constants')
const BufferMaker = require('./BufferMaker')
const debug = require('debug')('tarantool:packet:head')

module.exports = function (code, sync, schemaId) {
    debug(code, sync, schemaId)
    const head = new BufferMaker()

    if (schemaId) {
        head
            .uint8(0x83)

            .uint8(IPROTO.CODE)
            .uint32(code)

            .uint8(IPROTO.SYNC)
            .uint32(sync)

            .uint8(IPROTO.SCHEMA_ID)
            .uint32(schemaId)
    } else {
        head
            .uint8(0x82)

            .uint8(IPROTO.CODE)
            .uint32(code)

            .uint8(IPROTO.SYNC)
            .uint32(sync)
    }

    return head.create()
}
