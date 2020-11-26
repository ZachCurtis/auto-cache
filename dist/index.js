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
class AutoCache {
    constructor() {
        this._cache = {};
        this._missBinds = {};
        this._timeouts = {};
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = this._cache[key];
            // check for miss
            if (data === undefined) {
                data = yield this._cacheMissed(key);
            }
            return data;
        });
    }
    bindMiss(key, lifetime, missFunction) {
        let bound = this._missBinds[key];
        if (bound !== undefined) {
            throw new Error("Cannot overwrite bound miss function for " + key);
        }
        else {
            this._missBinds[key] = {
                missFunction: missFunction,
                lifetime: lifetime
            };
        }
    }
    unbindMiss(key) {
        let bound = this._missBinds[key];
        if (bound !== undefined) {
            delete this._missBinds[key];
        }
    }
    _cacheMissed(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let boundMiss = this._missBinds[key];
            if (boundMiss === undefined) {
                throw new Error('No data retrival function bound to ' + key + '. \n You must first set cache.bindMiss(' + key + ')');
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
exports.default = new Cache();
