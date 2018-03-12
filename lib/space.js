module.exports = function (client) {
    return function (spaceName) {

        return {
            async insert (tuple) {
                const [spaceId] = client.getIds(spaceName)

                return client.insert(spaceId, tuple)
            },
            async select (indexName, iterator, key, limit, offset) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.select(spaceId, indexId, iterator, key, limit, offset)
            },
            async replace (tuple) {
                const [spaceId] = client.getIds(spaceName)

                return client.replace(spaceId, tuple)
            },
            async update (indexName, key, ops) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.update(spaceId, indexId, key, ops)
            },
            async upsert (indexName, ops, tuple) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.upsert(spaceId, indexId, ops, tuple)
            },
            async delete (indexName, key) {
                const [spaceId, indexId] = client.getIds(spaceName, indexName)

                return client.delete(spaceId, indexId, key)
            }
        }
    }

}
