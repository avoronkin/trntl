const { IPROTO, REQUEST } = require('../../constants')
const sqlResponseParser = require('./sqlResponse')

module.exports = function (request, head, body) {
    if (!request) return []

    if (head.code !== 0) {
        return [new Error(body[IPROTO.ERROR])]
    }

    if (request.params.code === REQUEST.EXECUTE) {
        return [null, sqlResponseParser(body)]
    } else {
        return [ null, body[IPROTO.DATA] ]
    }
}
