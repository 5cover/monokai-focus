type NonEmptyTuple<T> = readonly [T, ...T[]]
type FlexArray<T> = T | FlexArray<T>[]
type Nest<T, Shape extends readonly unknown[]> =
    Shape extends readonly [unknown] ? T[]
    : Shape extends readonly [unknown, ...infer Rest] ? Nest<T, Rest>[]
    : never

export function fsplit<const Seps extends NonEmptyTuple<string>>(...seps: Seps) {
    return (value: string) =>
        seps.reduce<FlexArray<string>>((acc, sep) => splitLeaves(acc, sep), value) as Nest<string, Seps>
}

function splitLeaves(value: FlexArray<string>, sep: string): FlexArray<string>[] {
    if (typeof value === 'string') {
        return value.split(sep)
    }

    return value.map(item => splitLeaves(item, sep))
}

export function fjoin<const Seps extends NonEmptyTuple<string>>(...seps: Seps) {
    return (value: Nest<string, Seps>) =>
        seps.reduceRight<FlexArray<string>>((acc, sep) => joinLeaves(acc, sep), value) as string
}

function joinLeaves(value: FlexArray<string>, sep: string): string {
    if (typeof value === 'string') {
        return value
    }

    return value
        .filter(Boolean)
        .map(item => joinLeaves(item, sep))
        .join(sep)
}
