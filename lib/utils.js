
module.exports = {
    async resolveOnEvent (listener, event) {
        return new Promise(resolve => listener.once(event, resolve))
    },

    async rejectOnEvent (listener, event) {
        return new Promise((resolve, reject) => listener.once(event, reject))
    }
}
