const delegates = (function() {
    const globalDelegates = []

    Function.prototype.valueOf = function () {
        if (this.globalIndex !== undefined) return this.globalIndex
        const index = globalDelegates.length;
        Object.defineProperty(this, 'globalIndex', {
            get() {
                return index
            }
        })
        globalDelegates.push(this)
        return index
    }

    return function delegates() {
        const handlers = {}
        const callers = {}
        return new Proxy(
            {}, {
            get(target, p) {
                handlers[p] ??= []
                return callers[p] ??= function (...args) {
                    handlers[p]?.forEach(x => x(...args))
                }
            },

            set(target, p, newValue) {
                const event = handlers[p] ??= [];
                switch (typeof newValue) {
                    case 'function':
                        event.push(newValue)
                        return true;
                    case 'number':
                        const eventIndex = callers[p].valueOf();
                        let index = Math.abs(newValue - eventIndex);
                        const delegate = globalDelegates[index];
                        if (delegate == null) return false;
                        if (newValue > eventIndex) {
                            handlers[p].push(delegate)
                            return true;
                        }
                        else {
                            handlers[p].splice(handlers[p].findIndex(x => x === delegate), 1)
                            return true;
                        }
                }
                return false;
            }
        })
    }
})()