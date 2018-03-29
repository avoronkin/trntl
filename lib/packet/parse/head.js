const { IPROTO } = require('../../constants')

module.exports = function (head) {
    return {
        sync: head[IPROTO.SYNC],
        code: head[IPROTO.CODE],
        schemaId: head[IPROTO.SCHEMA_ID]
    }
}
