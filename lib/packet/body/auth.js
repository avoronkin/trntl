const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const { xor, sha1 } = require('../../utils')
const BufferMaker = require('../BufferMaker')

module.exports = function (user = 'guest', password = '', salt) {
    const step_1 = sha1(password)
    const step_2 = sha1(step_1)
    const step_3 = sha1(Buffer.concat([new Buffer(salt, 'base64'), step_2]))
    const scramble = xor(step_1, step_3)

    const writer = new BufferMaker()

    const body = writer
        .uint8(0x82)

        .uint8(IPROTO.USER_NAME)
        .buffer(msgpack.encode(user))

        .uint8(IPROTO.TUPLE)
        .uint8(0x92)
        .buffer(msgpack.encode('chap-sha1'))
        .uint8(0xb4).buffer(scramble)

        .create()

    return body
}
