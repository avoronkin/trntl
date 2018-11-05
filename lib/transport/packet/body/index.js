'use strict'

const { REQUEST } = require('../../../constants')

module.exports = {
    [REQUEST.AUTH]: require('./auth'),
    [REQUEST.CALL]: require('./call'),
    [REQUEST.DELETE]: require('./delete'),
    [REQUEST.EVAL]: require('./eval'),
    [REQUEST.EXECUTE]: require('./execute'),
    [REQUEST.INSERT]: require('./insert'),
    [REQUEST.REPLACE]: require('./replace'),
    [REQUEST.SELECT]: require('./select'),
    [REQUEST.UPDATE]: require('./update'),
    [REQUEST.UPSERT]: require('./upsert'),
    [REQUEST.PING]: function () {},
}
