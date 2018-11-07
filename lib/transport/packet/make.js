'use strict'

const { IPROTO } = require('../../constants')
const BufferMaker = require('./BufferMaker')
const makeBody = require('./body')

module.exports = function ([code, sync, schemaId], bodyArgs) {
    const packet = new BufferMaker()

    //prefix
    packet.uint32(0)

    //head
    packet.uint8(schemaId ? 0x83 : 0x82)
        .uint8(IPROTO.CODE)
        .uint32(code)

        .uint8(IPROTO.SYNC)
        .uint32(sync)

    if (schemaId) {
        packet
            .uint8(IPROTO.SCHEMA_ID)
            .uint32(schemaId)
    }

    //body
    makeBody[code](packet, bodyArgs)

    const buffer = packet.create()

    buffer.writeUInt32BE(buffer.byteLength - 5, 1)

    return buffer
}
