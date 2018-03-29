const crypto = require('crypto')
const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (user = 'guest', password = '', salt) {
    const ensalt = new Buffer(salt, 'base64')
    const step_1 = sha1(password)
    const step_2 = sha1(step_1)
    const step_3 = sha1(Buffer.concat([ensalt.slice(0, 20), step_2]))
    const scramble = xor(step_1, step_3)

    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.USER_NAME)
        .msgpack(user)

        .uint8(IPROTO.TUPLE)
        .uint8(0x92)
        .msgpack('chap-sha1')
        .uint8(0xb4).buffer(scramble)


    return body.create()
}

function sha1 (value) {
    return crypto.createHash('sha1').update(value).digest()
}

function xor (a, b) {
    const length = Math.max(a.length, b.length)
    const buffer = Buffer.allocUnsafe(length)

    for (let i = 0; i < length; ++i) {
        buffer[i] = a[i] ^ b[i]
    }

    return buffer
}
