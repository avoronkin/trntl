'use strict'

const { Transform, Duplex } = require('stream')

module.exports = class Accumulator extends Duplex {
    constructor (options) {
        super(options)

        this.chunks = []
        this.chunksByteLength = 0
        this.size = 128
        this.interval = 30

        this.intervalId = setInterval(this.flush.bind(this), this.interval)
    }

    _write (chunk, enc, next) {

        this.chunks.push(chunk)
        this.chunksByteLength += chunk.byteLength
        // console.log('write', this.chunksByteLength, chunk.byteLength)
        if (this.chunksByteLength > this.size) {
            this.flush()
        }

        next()
    }

    _read () { }

    flush () {
        if (this.flushing) return
        if (!this.chunks.length) return

        this.flushing = true

        // console.log('flush', this.chunksByteLength, this.size, new Date())

        // if (this.chunksByteLength > this.size) {
        if (this.chunks.length === 1) {
            this.push(this.chunks[0])
        } else {
            this.push(Buffer.concat(this.chunks))
        }

        this.chunks = []
        this.chunksByteLength = 0
        // }

        this.flushing = false
    }
}
