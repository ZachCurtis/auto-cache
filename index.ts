import { IDictonary, IBound } from './defs'

class Cache {
    private _cache: IDictonary<any>
    private _missHandlers: IDictonary<IBound>
    private _timeouts: IDictonary<ReturnType<typeof setTimeout>>

    constructor() {
        this._cache = {}
        this._missHandlers = {}
        this._timeouts = {}
    }

    public async get(key: string): Promise<any> {
        let firstData = this._cache[key]

        // check for miss
        if (firstData === undefined) {
            return await this._cacheMissed(key)
                                             
        } else {

            return firstData
        }
    }



    public bindMissHandler(key: string, lifetime: number, missHandler: CallableFunction) {

        let bound = this._missHandlers[key]

        if (bound !== undefined) {
            throw new Error("Cannot overwrite bound miss function for " + key);

        } else {
            this._missHandlers[key] = {
                missFunction: missHandler,
                lifetime: lifetime
            } as IBound
        }
    }

    public async miss (key: string): Promise<void> {
        await this._cacheMissed(key)
    }

    public unbindMissHandler(key: string): void {
        let bound = this._missHandlers[key]

        if (bound !== undefined) {
            delete this._missHandlers[key]
        }
    }

    private async _cacheMissed(key: string): Promise<void> {
        let boundMiss = this._missHandlers[key]

        if (boundMiss === undefined) {
            throw new Error('No data retrival function bound to ' + key + '. \n You must first set Cache.bindMiss(' + key + ')')

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

    private _setData(key: string, data: any): void {

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



export default new Cache()
