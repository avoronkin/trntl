const { IPROTO, REQUEST } = require('../../constants')
const sqlBodyParser = require('./sqlBody')

module.exports = function (request, head, body) {
    if (!request) return []

    if (head.code !== 0) {
        return [new Error(body[IPROTO.ERROR])]
    }

    if (request.params.code === REQUEST.EXECUTE) {
        return [null, sqlBodyParser(body)]
    } else {
        return [ null, body[IPROTO.DATA] ]
    }
}
