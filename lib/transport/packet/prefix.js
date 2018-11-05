'use strict'

const BufferMaker = require('./BufferMaker')

module.exports = function (head, body) {
    const prefix = new BufferMaker()

    const length = head.byteLength + (body ? body.byteLength : 0)

    prefix.uint32(length)

    return prefix.create()
}
