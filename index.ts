import { IDictionary as IDictionary, IBound } from './defs'

class Cache {
    private _cache: IDictionary<unknown>
    private _missHandlers: IDictionary<IBound>
    private _anyMissHandlers: Array<IBound>
    private _timeouts: IDictionary<ReturnType<typeof setTimeout>>

    constructor() {
        this._cache = {}
        this._missHandlers = {}
        this._anyMissHandlers = []
        this._timeouts = {}
    }

    public async get(key: any): Promise<unknown> {
        let firstData = this._cache[key]

        // check for miss
        if (firstData === undefined) {
            return await this._cacheMissed(key)

        } else {

            return firstData
        }
    }

    public async getConcat(keys: Array<any>): Promise<Array<any> | any> {
        let ret: Array<any> = []
        for (let i = 0; i < keys.length; i++) {
            let data: any = await this.get(keys[i])
            ret = ret.concat(data)
        }

        return ret
    }

    public bindMissHandler(key: any | number, lifetime: number | CallableFunction, missHandler?: CallableFunction) {

        if (typeof key === 'string') {

            let bound = this._missHandlers[key]

            if (bound !== undefined) {
                throw new Error("Cannot overwrite bound miss function for " + key);

            } else {
                this._missHandlers[key] = {
                    missFunction: missHandler,
                    lifetime: lifetime
                } as IBound
            }
        } else {
            this._anyMissHandlers.push({
                missFunction: lifetime,
                lifetime: key
            } as IBound)
        }
    }

    public async miss(key: any): Promise<void> {
        await this._cacheMissed(key)
    }

    public async unbindMissHandler(key: any): Promise<void> {
        if (this._missHandlers[key] !== undefined) {
            delete this._missHandlers[key]
        }
    }

    private async _cacheMissed(key: any): Promise<void> {
        let boundMiss = this._missHandlers[key]

        if (boundMiss === undefined && this._anyMissHandlers.length < 1) {
            throw new Error('No data retrival function bound to ' + key + '. \n You must first set Cache.bindMiss(' + key + ')')

        } else if (this._anyMissHandlers.length === 1) {
            boundMiss = this._anyMissHandlers[0]
            let data = await boundMiss.missFunction(key)
            this._setData(key, data)

            if (boundMiss.lifetime > 0) {
                this._timeouts[key] = setTimeout(() => {
                    this._deleteData(key)

                }, boundMiss.lifetime)
            }
        } else {

            if (this._timeouts[key] !== undefined) {
                clearTimeout(this._timeouts[key])
                delete this._timeouts[key]
            }

            let data = await boundMiss.missFunction(key)
            this._setData(key, data)

            // if this data expires bind deletion to timeout
            if (boundMiss.lifetime > 0) {
                this._timeouts[key] = setTimeout(() => {
                    this._deleteData(key)

                }, boundMiss.lifetime)
            }
        }
    }

    private _setData(key: any, data: any): void {

        this._cache[key] = data
    }

    private async _deleteData(key: string): Promise<void> {
        delete this._cache[key]

        if (this._timeouts[key] !== undefined) {
            clearTimeout(this._timeouts[key])
            delete this._timeouts[key]
        }
    }
}


class SectionedCacheClass {

    private _caches: IDictionary<Cache>

    constructor() {
        this._caches = {}
    }

    public async get(sectionName: string, key: any): Promise<unknown> {

        //check if cache exists 
        if (this._caches[sectionName] === undefined) {

            //throw new error if not made yet 
            throw new Error('No cache named ' + sectionName + 'exists. \n You must first set SectionedCache.bindMiss(' + sectionName + ', ' + key + ')')

        } else {
            return await this._caches[sectionName].get(key)
        }
    }


    public bindMissHandler(sectionName: string, key: any | number, lifetime: number | CallableFunction, missHandler?: CallableFunction) {
        let thisCache = this._caches[sectionName]

        if (thisCache === undefined) {
            this._caches[sectionName] = new Cache()
            thisCache = this._caches[sectionName]
        }

        if (typeof key === 'string') {
            thisCache.bindMissHandler(key, lifetime, missHandler)
        } else if (typeof key === 'number') {
            thisCache.bindMissHandler(key, lifetime)
        }
    }

    public async miss(sectionName: string, key: any): Promise<void> {
        const thisCache = this._caches[sectionName]

        if (thisCache === undefined) {
            throw new Error('Cannot force miss: Cache Section ' + sectionName + ' does not exist')
        } else {
            await thisCache.miss(key)
        }
    }
}

export const SectionedCache = new SectionedCacheClass()
export default new Cache()