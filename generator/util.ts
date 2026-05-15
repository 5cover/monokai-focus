type Tup<T = unknown> = readonly [T, ...T[]]
type FlexArray<T> = T | FlexArray<T>[]
type Nest<T, Shape extends Tup> =
    Shape extends readonly [T, ...infer Rest] ?
        Rest extends Tup ?
            Nest<T, Rest>[]
        :   T[]
    :   never

export function fsplit<const Seps extends Tup<string>>(...seps: Seps) {
    return seps.reduceRight(
        (next, sep) => value => value.split(sep).map(next),
        (value: string): FlexArray<string> => value,
    ) as (value: string) => Nest<string, Seps>
}

export function fjoin<const Seps extends Tup<string>>(...seps: Seps) {
    return seps.reduceRight(
        (next, sep) => value => (value as FlexArray<string[]>).filter(Boolean).map(next).join(sep),
        (value: FlexArray<string>) => value,
    ) as (value: Nest<string, Seps>) => string
}

export type Discriminant<T, K extends keyof T> = { type: K } & T[K]
export type Discriminate<T> = { [K in keyof T]: Discriminant<T, K> }[keyof T]

export function isArray(arr: unknown): arr is readonly unknown[] {
    return Array.isArray(arr)
}
export type NonEmptyArray<T> = [T, ...T[]]
export type SoftNonEmptyArray<T> = T | NonEmptyArray<T>
export type SoftArray<T> = T | T[]

export function nmap<T, U>(arr: NonEmptyArray<T>, map: (item: T) => U) {
    return arr.map(map) as NonEmptyArray<U>
}

export function strcmp(a: string, b: string) {
    return (
        a === b ? 0
        : a < b ? -1
        : 1
    )
}
