'use strict'

const msgpack = require('msgpack-lite')

module.exports = class Writer {
    constructor () {
        this.writes = []
    }

    msgpack (value) {
        const encoded = msgpack.encode(value)

        this.writes.push({
            type: 'copy',
            bytes: encoded.byteLength,
            value: encoded
        })

        return this
    }

    buffer (value) {
        this.writes.push({
            type: 'copy',
            bytes: value.byteLength,
            value
        })

        return this
    }

    uint8 (value) {
        this.writes.push({
            type: 'writeUInt8',
            bytes: 1,
            value
        })

        return this
    }

    uint32 (value) {
        this.uint8(0xce)

        this.writes.push({
            type: 'writeUInt32BE',
            bytes: 4,
            value
        })

        return this
    }

    uint16 (value) {
        this.uint8(0xcd)

        this.writes.push({
            type: 'writeUInt16BE',
            bytes: 2,
            value
        })

        return this
    }

    create () {
        const byteLength = this.writes.reduce((length, write) => {
            return length + write.bytes
        }, 0)

        let buffer = Buffer.allocUnsafe(byteLength)
        let offset = 0

        this.writes.forEach(write => {
            if (write.type === 'copy') {
                write.value.copy(buffer, offset)
            } else {
                buffer[write.type](write.value, offset)
            }

            offset += write.bytes
        })

        return buffer
    }
}
