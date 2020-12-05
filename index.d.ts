declare interface IDictionary<TValue> {
    [id: string]: TValue
}

declare interface IBound {
    missFunction: CallableFunction
    lifetime: number
}

declare class Cache {
    private _cache: IDictionary<unknown>;
    private _missHandlers: IDictionary<IBound>;
    private _timeouts: IDictionary<ReturnType<typeof setTimeout>>;

    constructor();

    get(key: string): Promise<unknown>;
    getConcat(keys: Array<string>): Promise<Array<any> | any>;
    bindMissHandler(key: string, lifetime: number, missHandler: CallableFunction): void;
    bindMissHandler(lifetime: number, missHandler: CallableFunction): void;
    miss(key: string): Promise<void>;
    unbindMissHandler(key: string): Promise<void>;
    private _cacheMissed(): Promise<void>  
    private _setData(): void;
    private _deleteData(): Promise<void>;
}
declare class SectionedCacheClass {
    private _caches: IDictionary<Cache>;

    constructor();
    
    get(sectionName: string, key: string): Promise<unknown>;
    bindMissHandler(sectionName: string, key: string, lifetime: number, missHandler: CallableFunction): void;
    bindMissHandler(sectionName: string, lifetime: number, missHandler: CallableFunction): void;
    
    miss(sectionName: string, key: string): Promise<void>;
}
export declare const SectionedCache: SectionedCacheClass;
declare const _default: Cache;
export default _default;
