declare class Cache {
    private _cache;
    private _missHandlers;
    private _anyMissHandlers;
    private _timeouts;
    constructor();
    get(key: any): Promise<unknown>;
    getConcat(keys: Array<any>): Promise<Array<any> | any>;
    bindMissHandler(key: any | number, lifetime: number | CallableFunction, missHandler?: CallableFunction): void;
    miss(key: any): Promise<void>;
    unbindMissHandler(key: any): Promise<void>;
    private _cacheMissed;
    private _setData;
    private _deleteData;
}
declare class SectionedCacheClass {
    private _caches;
    constructor();
    get(sectionName: string, key: any): Promise<unknown>;
    bindMissHandler(sectionName: string, key: any | number, lifetime: number | CallableFunction, missHandler?: CallableFunction): void;
    miss(sectionName: string, key: any): Promise<void>;
}
export declare const SectionedCache: SectionedCacheClass;
declare const _default: Cache;
export default _default;
