const { Writable } = require('stream')
const { IPROTO } = require('../constants')

module.exports = function ({ handlers }) {
    return new Writable({
        objectMode: true,
        write (response, enc, next) {
            const sync = response.head[IPROTO.SYNC]
            const code = response.head[IPROTO.CODE]

            if (handlers[sync]) {

                if (code === 0) {
                    const data = response.body[IPROTO.DATA]

                    handlers[sync](null, data)
                } else {
                    handlers[sync](new Error(response.body[IPROTO.ERROR]))
                }

                delete handlers[sync]
            }

            next()
        }
    })
}
