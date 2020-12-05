export interface IDictionary<TValue> {
    [id: string]: TValue
}
export interface IBound {
    missFunction: CallableFunction
    lifetime: number
}