const makeHead = require('./head')

module.exports = function (code, sync, body, schemaId) {
    const head = makeHead(code, sync, schemaId)

    const length = head.byteLength + (body ? body.byteLength : 0)

    const packet = Buffer.allocUnsafe(length + 5)

    packet[0] = 0xce; packet.writeUInt32BE(length, 1)

    head.copy(packet, 5)

    if (body) {
        body.copy(packet, 5 + head.byteLength)
    }

    return packet
}
