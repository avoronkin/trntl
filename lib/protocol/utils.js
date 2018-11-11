'use strict'

module.exports = {
    promisifyEvents (emitter, resolveEvents = [], rejectEvents = ['error'], method, args = []) {
        if (resolveEvents && !Array.isArray(resolveEvents)) {
            resolveEvents = [resolveEvents]
        }

        if (rejectEvents && !Array.isArray(rejectEvents)) {
            rejectEvents = [rejectEvents]
        }

        return new Promise((resolve, reject) => {
            rejectEvents.forEach(eventName => {
                emitter.once(eventName, error => {

                    rejectEvents.forEach(eventName => {
                        emitter.off(eventName, reject)
                    })

                    resolveEvents.forEach(eventName => {
                        emitter.off(eventName, resolve)
                    })

                    reject(error)
                })
            })

            resolveEvents.forEach(eventName => {
                emitter.once(eventName, (...args) => {

                    rejectEvents.forEach(eventName => {
                        emitter.off(eventName, reject)
                    })

                    resolveEvents.forEach(eventName => {
                        emitter.off(eventName, resolve)
                    })

                    resolve(args.length === 1 ? args[0] : args)
                })
            })

            if(method) {
                emitter[method].apply(emitter, args)
            }
        })
    },
}
