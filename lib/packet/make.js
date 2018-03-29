const makeHead = require('./head')
const BufferMaker = require('./BufferMaker')

module.exports = function (code, sync, schemaId, body) {
    const packet = new BufferMaker()
    const head = makeHead(code, sync, schemaId)

    const length = head.byteLength + (body ? body.byteLength : 0)

    packet.uint32(length)
    packet.buffer(head)

    if (body) {
        packet.buffer(body)
    }

    return packet.create()
}
