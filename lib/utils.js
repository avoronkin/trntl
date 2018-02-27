const crypto = require('crypto')

module.exports = {
    async resolveOnEvent (listener, event) {
        return new Promise(resolve => listener.once(event, resolve))
    },

    async rejectOnEvent (listener, event) {
        return new Promise((resolve, reject) => listener.once(event, reject))
    },

    sha1 (value) {
        return crypto.createHash('sha1').update(value).digest()
    },

    xor (a, b) {
        const length = Math.max(a.length, b.length)
        const buffer = Buffer.allocUnsafe(length)

        for (let i = 0; i < length; ++i) {
            buffer[i] = a[i] ^ b[i]
        }

        return buffer
    }
}
