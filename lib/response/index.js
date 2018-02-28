const pipe = require('multipipe')
const { TarantoolPacketStream } = require('packet-streams')
const encode = require('./encode')
const runHandler = require('./runHandler')

module.exports = function ({handlers}) {
    return pipe(
        new TarantoolPacketStream(),
        encode(),
        runHandler({handlers})
    )
}
