const debug = require('debug')('taran:commands')
const {
    INDEX_SPACE,
    REQUEST,
    SPACE,
} = require('./constants')

const body = require('./packet/body')
const makePacket = require('./packet/make')

module.exports = function (client, connection) {

    return {

        async send (data) {
            debug('send', data)
            await new Promise(resolve => connection.write(data, resolve))
        },

        sendPacket (code, body) {
            const sync = ++client.id
            debug('send', code, sync, client.schemaId, body)
            const packet = makePacket(code, sync, client.schemaId, body)

            client.requests[sync] = {
                params: {
                    code,
                    sync,
                    schemaId: client.schemaId,
                    body
                }
            }

            return new Promise((resolve, reject) => {
                client.requests[sync].callback = (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(res)
                    }
                }

                this.send(packet)
            })
        },

        async ping () {
            debug('ping')
            return this.sendPacket(REQUEST.PING)
        },

        async auth (user, password) {
            debug('auth', user, password)
            return this.sendPacket(REQUEST.AUTH, body.auth(user, password, client.salt))
        },

        async eval (expession, ...args) {
            debug('eval', expession, args)
            return this.sendPacket(REQUEST.EVAL, body.eval.apply(null, [expession, ...args]))
        },

        async call (functionName, ...args) {
            debug('call', functionName, args)
            return this.sendPacket(REQUEST.CALL, body.call.apply(null, [functionName, ...args]))
        },

        async select (spaceId, indexId, iterator = 'eq', key = [], limit = 1, offset = 0) {
            debug('select', spaceId, indexId, iterator, key, limit, offset)
            return this.sendPacket(REQUEST.SELECT, body.select(spaceId, indexId, iterator, key, limit, offset))
        },

        async insert (spaceId, tuple) {
            debug('insert', spaceId, tuple)
            return this.sendPacket(REQUEST.INSERT, body.insert(spaceId, tuple))
        },

        async replace (spaceId, tuple) {
            debug('replace')
            return this.sendPacket(REQUEST.REPLACE, body.replace(spaceId, tuple))
        },

        async update (spaceId, indexId, key, ops) {
            debug('update', spaceId, indexId, key, ops)
            return this.sendPacket(REQUEST.UPDATE, body.update(spaceId, indexId, key, ops))
        },

        async upsert (spaceId, indexId, ops, tuple) {
            debug('upsert', spaceId, indexId, ops, tuple)
            return this.sendPacket(REQUEST.UPSERT, body.upsert(spaceId, indexId, ops, tuple))
        },

        async delete (spaceId, indexId, key) {
            debug('delete', spaceId, indexId, key)
            return this.sendPacket(REQUEST.DELETE, body.delete(spaceId, indexId, key))
        },

        getIds (spaceName, indexName) {
            const spaceId = client.spaces[spaceName]
            const indexId = indexName ? client.indexes[spaceId + ':' + indexName] : undefined

            return [spaceId, indexId]
        },
    }
}
