const { IPROTO } = require('../constants')

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
    const head = Buffer.allocUnsafe(9)

    head[0] = 0x82

    head[1] = IPROTO.CODE
    head[2] = commandCode

    head[3] = IPROTO.SYNC
    head[4] = 0xce; head.writeUInt32BE(syncId, 5)

    return head
}
