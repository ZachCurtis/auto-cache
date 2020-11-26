export interface IDictonary<TValue> {
    [id: string]: TValue
}

export interface IBound {
    missFunction: CallableFunction
    lifetime: number
}