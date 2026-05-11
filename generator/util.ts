type Tup<T = unknown> = readonly [T, ...T[]]
type FlexArray<T> = T | FlexArray<T>[]
type Nest<T, Shape extends Tup> = Shape extends readonly [T, ...infer Rest]
    ? Rest extends Tup
        ? Nest<T, Rest>[]
        : T[]
    : never

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
