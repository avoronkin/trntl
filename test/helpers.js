const { SPACE, INDEX_SPACE } = require('../lib/constants')

module.exports = {

    async loadSchema (client) {
        const spaces = await client.select(SPACE.SPACE, INDEX_SPACE.NAME, 'all', [], 10000, 0)
        const _spaces = {}
        spaces.forEach(space => _spaces[space[2]] = space[0])

        const indexes = await client.select(SPACE.INDEX, INDEX_SPACE.INDEX_NAME, 'all', [], 10000, 0)
        const _indexes = {}
        indexes.forEach(index => _indexes[`${index[0]}:${index[2]}`] = index[1])


        return function (spaceName, indexName) {
            const spaceId = _spaces[spaceName]
            const indexId = indexName ? _indexes[spaceId + ':' + indexName] : undefined
    
            return [spaceId, indexId]
        }
    },

}