module.exports = class Writer {
    constructor () {
        this.writes = []
    }

    string (value) {
        this.writes.push({
            type: 'string',
            value
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

    uint32be (value) {
        this.writes.push({
            type: 'writeUInt32BE',
            bytes: 4,
            value
        })

        return this
    }

    create () {
        this.writes.forEach(write => {
            if (write.type === 'string') {
                write.value = Buffer.from(write.value)
                write.bytes = write.value.byteLength
                write.type = 'copy'
            }
        })

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
    // writeDoubleBE (value) {
    //     return this
    // }
    // writeDoubleLE (value) {
    //     return this
    // }
    // writeFloatBE (value) {
    //     return this
    // }
    // writeFloatLE (value) {
    //     return this
    // }
    // writeIntBE (value) {
    //     return this
    // }
    // writeIntLE (value) {
    //     return this
    // }
    // writeUIntBE (value) {
    //     return this
    // }
    // writeUIntLE (value) {
    //     return this
    // }
    // writeInt8 (value) {
    //     return this
    // }

    // writeInt16BE (value) {
    //     return this
    // }
    // writeInt16LE (value) {
    //     return this
    // }
    // writeUInt16BE (value) {
    //     return this
    // }
    // writeUInt16LE (value) {
    //     return this
    // }
    // writeInt32BE (value) {
    //     return this
    // }
    // writeInt32LE (value) {
    //     return this
    // }
    // writeUInt32LE (value) {
    //     return this
    // }
}
