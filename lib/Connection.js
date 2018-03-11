
const net = require('net')
const debug = require('debug')('taran:connection')

module.exports = class Connection extends net.Socket{
    constructor (options = {}) {
        debug('init', options)
        options.allowHalfOpen = true
        super(options)

        this.host = options.host || 'localhost'
        this.port = options.port || 3301

        this.setKeepAlive(true)
        this.setNoDelay(true)

        if (options.socketTimeout) {
            this.setTimeout(options.socketTimeout)
            this.once('timeout', () => {
                this.end()
            })
        }
    }

    async connect () {
        debug('connect')
        if (this.connecting) { return }

        await new Promise((resolve, reject) => {
            function onConnect () {
                this.removeListener('error', onError)
                resolve()
            }

            function onError (error) {
                this.removeListener('connect', onConnect)
                reject(error)
            }

            this.once('connect', onConnect.bind(this))
            this.once('error', onError.bind(this))

            super.connect(this.port, this.host)
        })

    }

    async close (error) {
        debug('close')
        if (this.destroyed) { return }

        await new Promise((resolve, reject) => {
            this.once('close', had_error => {
                if (had_error) {
                    return reject()
                }

                resolve()
            })
            super.destroy(error)
        })
    }

    // async send (data) {
    //     debug('send', data)
    //     await new Promise(resolve => this.write(data, resolve))
    // }
}
