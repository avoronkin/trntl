const debug = require('debug')('taran:commands')
const { REQUEST } = require('./constants')

const body = require('./packet/make/body')
const makePacket = require('./packet/make/packet')

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

        /**
        * Execute PING request.
        * Send empty request and receive empty response from server.
        * @method ping
        * @return {promise}
        */
        async ping () {
            debug('ping')
            return this.sendPacket(REQUEST.PING)
        },

        /**
        * Execute authentication request
        * @method auth
        * @param  {string}  user - user to authenticate with
        * @param  {string}  password - password for the user
        * @return {promise}
        */
        async auth (user, password) {
            debug('auth', user, password)
            return this.sendPacket(REQUEST.AUTH, body.auth(user, password, client.salt))
        },

        /**
        * Execute EVAL request. Eval Lua expression.
        * @method eval
        * @param  {string}  expession - Lua expression
        * @param  {...*}  args - list of function arguments
        * @return {promise}
        */
        async eval (expession, ...args) {
            debug('eval', expession, args)
            return this.sendPacket(REQUEST.EVAL, body.eval.apply(null, [expession, ...args]))
        },

        async execute (sql, options) {
            debug('execute', sql, options)
            return this.sendPacket(REQUEST.EXECUTE, body.execute(sql, options))
        },

        /**
        * Execute CALL request. Call stored Lua function.
        * @method call
        * @param  {string}  functionName - stored Lua function name
        * @param  {...*}  args - list of function arguments
        * @return {promise}
        */
        async call (functionName, ...args) {
            debug('call', functionName, args)
            return this.sendPacket(REQUEST.CALL, body.call.apply(null, [functionName, ...args]))
        },

        /**
         * Execute SELECT request.
         * Select and retrieve data from the database.
         * @method select
         * @param  {number}  spaceId - specifies which space to query
         * @param  {number}  indexId - specifies which index to use
         * @param  {string}  [iterator='eq'] - specifies the rule for matching and ordering
         * @param  {array}   [key=[]] - values to search over the index
         * @param  {number}  [limit=1] - limits the total number of returned tuples
         * @param  {number}  [offset=0] - offset in the resulting tuple set
         * @return {promise}
         */

        async select (spaceId, indexId, iterator = 'eq', key = [], limit = 1, offset = 0) {
            debug('select', spaceId, indexId, iterator, key, limit, offset)
            return this.sendPacket(REQUEST.SELECT, body.select(spaceId, indexId, iterator, key, limit, offset))
        },

        /**
        * Execute INSERT request.
        * It will throw error if there's tuple with same PK exists.
        * @method insert
        * @param  {number}  spaceId - space id to insert a record
        * @param  {array}  tuple - record to be inserted.
        * @return {promise}
        */
        async insert (spaceId, tuple) {
            debug('insert', spaceId, tuple)
            return this.sendPacket(REQUEST.INSERT, body.insert(spaceId, tuple))
        },

        /**
        * Execute REPLACE request.
        * It won't throw error if there's no tuple with this PK exists
        * @method replace
        * @param  {number}  spaceId - space id to insert a record
        * @param  {array}  tuple - record to be inserted.
        * @return {promise}
        */
        async replace (spaceId, tuple) {
            debug('replace')
            return this.sendPacket(REQUEST.REPLACE, body.replace(spaceId, tuple))
        },

        /**
        * Execute UPDATE request.
        * The `update` function supports operations on fields — assignment,
        * arithmetic (if the field is unsigned numeric), cutting and pasting
        * fragments of a field, deleting or inserting a field. Multiple
        * operations can be combined in a single update request, and in this
        * case they are performed atomically and sequentially. Each operation
        * requires specification of a field number. When multiple operations are
        * present, the field number for each operation is assumed to be relative
        * to the most recent state of the tuple, that is, as if all previous
        * operations in a multi-operation update have already been applied.
        * In other words, it is always safe to merge multiple update invocations
        * into a single invocation, with no change in semantics.
        *
        * Update single record identified by `key`.
        *
        * List of operations allows to update individual fields.
        * *Allowed operations:*
        * (For every operation you must provide field number, to apply this
        * operation to)
        *
        * `+` for addition (values must be numeric)
        * `-` for subtraction (values must be numeric)
        * `&` for bitwise AND (values must be unsigned numeric)
        * `|` for bitwise OR (values must be unsigned numeric)
        * `^` for bitwise XOR (values must be unsigned numeric)
        * `:` for string splice (you must provide `offset`, `count` and `value` for this operation)
        * `!` for insertion (before) (provide any element to insert)
        * `=` for assignment (provide any element to assign)
        * `#` for deletion (provide count of fields to delete)
        *
        * @example
        * // 'ADD' 55 to second field
        * //  Assign 'x' to third field
        * [['+', 2, 55], ['=', 3, 'x']]
        *
        * @example
        * // 'OR' third field with '1'
        * // Cut three symbols starting from second and replace them with '!!'
        * // Insert 'hello, world' field before fifth element of tuple
        * [['|', 3, 1], [':', 2, 2, 3, '!!'], ['!', 5, 'hello, world']]
        *
        * @example
        * // Delete two fields starting with second field
        * [['#', 2, 2]]
        *
        * @method update
        * @param  {number}  spaceId - space id to update a record
        * @param  {number}  indexId - index id to update a record
        * @param  {*}  key - key that identifies a record
        * @param  {array}  ops - list of operations. Each operation is tuple of three (or more) values
        * @return {promise}
        */
        async update (spaceId, indexId, key, ops) {
            debug('update', spaceId, indexId, key, ops)
            return this.sendPacket(REQUEST.UPDATE, body.update(spaceId, indexId, key, ops))
        },

        /**
        * Execute UPSERT request
        * If there is an existing tuple which matches the key fields of
        * `tuple_value`, then the request has the same effect as UPDATE
        * and the [[field_1, symbol_1, arg_1], ...] parameter is used.
        * If there is no existing tuple which matches the key fields of
        * `tuple_value`, then the request has the same effect as INSERT
        * and the `tuple_value` parameter is used. However, unlike insert
        * or update, upsert will not read a tuple and perform error checks
        * before returning -- this is a design feature which enhances
        * throughput but requires more caution on the part of the user.
        *
        * @method upsert
        * @param  {number}  spaceId - space id
        * @param  {number}  indexId - index id
        * @param  {array}  ops - list of operations. Each operation is tuple of three (or more) values
        * @param  {array}  tuple - record to be upserted.
        * @return {promise}
        */
        async upsert (spaceId, indexId, ops, tuple) {
            debug('upsert', spaceId, indexId, ops, tuple)
            return this.sendPacket(REQUEST.UPSERT, body.upsert(spaceId, indexId, ops, tuple))
        },

        /**
        * Execute DELETE request.
        * Delete single record identified by `key`. If you're using secondary
        index, it must be unique.
        * @method delete
        * @param  {number}  spaceId - space id
        * @param  {number}  indexId - index id
        * @param  {string|number}  key - key that identifies a record
        * @return {promise}
        */
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
