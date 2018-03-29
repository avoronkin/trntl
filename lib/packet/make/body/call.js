const { IPROTO } = require('../../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (functionName, ...args) {
    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.FUNCTION_NAME)
        .msgpack(functionName)

        .uint8(IPROTO.TUPLE)
        .msgpack(args)


    return body.create()
}
