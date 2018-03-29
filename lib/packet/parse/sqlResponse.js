const { IPROTO } = require('../../constants')

module.exports = function (body) {
    const result = {}

    if (body[IPROTO.DATA]) {
        result.data = body[IPROTO.DATA]
    }

    if (body[IPROTO.METADATA]) {
        result.metadata = body[IPROTO.METADATA].map(item => {
            return {fieldName: item[IPROTO.FIELD_NAME]}
        })
    }

    const info = body[IPROTO.SQL_INFO]
    if (info) {
        result.info = {}

        Object.keys(info).forEach(key => {
            if (key == IPROTO.SQL_ROW_COUNT) {
                result.info.row_count = info[IPROTO.SQL_ROW_COUNT]
            }
        })
    }

    return result
}
