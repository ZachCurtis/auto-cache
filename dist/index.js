"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionedCache = void 0;
class Cache {
    constructor() {
        this._cache = {};
        this._missHandlers = {};
        this._anyMissHandlers = [];
        this._timeouts = {};
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let firstData = this._cache[key];
            // check for miss
            if (firstData === undefined) {
                return yield this._cacheMissed(key);
            }
            else {
                return firstData;
            }
        });
    }
    getConcat(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = [];
            for (let i = 0; i < keys.length; i++) {
                let data = yield this.get(keys[i]);
                ret = ret.concat(data);
            }
            return ret;
        });
    }
    bindMissHandler(key, lifetime, missHandler) {
        if (typeof key === 'string') {
            let bound = this._missHandlers[key];
            if (bound !== undefined) {
                throw new Error("Cannot overwrite bound miss function for " + key);
            }
            else {
                this._missHandlers[key] = {
                    missFunction: missHandler,
                    lifetime: lifetime
                };
            }
        }
        else {
            this._anyMissHandlers.push({
                missFunction: lifetime,
                lifetime: key
            });
        }
    }
    miss(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._cacheMissed(key);
        });
    }
    unbindMissHandler(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._missHandlers[key] !== undefined) {
                delete this._missHandlers[key];
            }
        });
    }
    _cacheMissed(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let boundMiss = this._missHandlers[key];
            if (boundMiss === undefined && this._anyMissHandlers.length < 1) {
                throw new Error('No data retrival function bound to ' + key + '. \n You must first set Cache.bindMiss(' + key + ')');
            }
            else if (this._anyMissHandlers.length === 1) {
                boundMiss = this._anyMissHandlers[0];
                let data = yield boundMiss.missFunction(key);
                this._setData(key, data);
                if (boundMiss.lifetime > 0) {
                    this._timeouts[key] = setTimeout(() => {
                        this._deleteData(key);
                    }, boundMiss.lifetime);
                }
            }
            else {
                if (this._timeouts[key] !== undefined) {
                    clearTimeout(this._timeouts[key]);
                    delete this._timeouts[key];
                }
                let data = yield boundMiss.missFunction(key);
                this._setData(key, data);
                // if this data expires bind deletion to timeout
                if (boundMiss.lifetime > 0) {
                    this._timeouts[key] = setTimeout(() => {
                        this._deleteData(key);
                    }, boundMiss.lifetime);
                }
            }
        });
    }
    _setData(key, data) {
        this._cache[key] = data;
    }
    _deleteData(key) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this._cache[key];
            if (this._timeouts[key] !== undefined) {
                clearTimeout(this._timeouts[key]);
                delete this._timeouts[key];
            }
        });
    }
}
class SectionedCacheClass {
    constructor() {
        this._caches = {};
    }
    get(sectionName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            //check if cache exists 
            if (this._caches[sectionName] === undefined) {
                //throw new error if not made yet 
                throw new Error('No cache named ' + sectionName + 'exists. \n You must first set SectionedCache.bindMiss(' + sectionName + ', ' + key + ')');
            }
            else {
                return yield this._caches[sectionName].get(key);
            }
        });
    }
    bindMissHandler(sectionName, key, lifetime, missHandler) {
        let thisCache = this._caches[sectionName];
        if (thisCache === undefined) {
            this._caches[sectionName] = new Cache();
            thisCache = this._caches[sectionName];
        }
        if (typeof key === 'string') {
            thisCache.bindMissHandler(key, lifetime, missHandler);
        }
        else if (typeof key === 'number') {
            thisCache.bindMissHandler(key, lifetime);
        }
    }
    miss(sectionName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const thisCache = this._caches[sectionName];
            if (thisCache === undefined) {
                throw new Error('Cannot force miss: Cache Section ' + sectionName + ' does not exist');
            }
            else {
                yield thisCache.miss(key);
            }
        });
    }
}
exports.SectionedCache = new SectionedCacheClass();
exports.default = new Cache();
