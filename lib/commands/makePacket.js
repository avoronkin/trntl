const { IPROTO } = require('../constants')
const Writer = require('../Writer')

module.exports = function makePacket (commandCode, syncId, body) {
    const head = makeHead(commandCode, syncId)

    const length = head.byteLength + (body ? body.byteLength : 0)

    const packet = Buffer.allocUnsafe(length + 5)

    packet[0] = 0xce; packet.writeUInt32BE(length, 1)

    head.copy(packet, 5)

    if (body) {
        body.copy(packet, 5 + head.byteLength)
    }

    return packet
}

function makeHead (commandCode, syncId) {
    const writer = new Writer()

    const head = writer
        .uint8(0x82)
        .uint8(IPROTO.CODE)
        .uint8(commandCode)
        .uint8(IPROTO.SYNC)
        .uint8(0xce)
        .uint32be(syncId)
        .create()

    return head
}
