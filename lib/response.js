const pipe = require('multipipe')
const { Transform } = require('stream')
const { TarantoolPacketStream } = require('packet-streams')
const packetParser = require('./packet/parse/packet')
const headParser = require('./packet/parse/head')
const responseParser = require('./packet/parse/body')

module.exports = function (client) {

    return pipe(
        new TarantoolPacketStream(),
        new Transform({
            objectMode: true,
            async transform (packetBuffer, enc, next) {

                try {
                    const packet = packetParser(packetBuffer)

                    const head = headParser(packet.head)

                    const request = client.requests[head.sync]

                    if (request) {
                        const [ err, res ] = responseParser(request, head, packet.body)

                        request.callback(err, res)

                        delete client.requests[head.sync]
                    }

                    next()
                }

                catch (err) {
                    next(err)
                }
            }
        }))

}
