import type { ColorInstance } from 'color'
import type { TextMateSettings, TextMateTokenColor, TokenStylingStyle } from './types.ts'
import {
    nmap,
    fjoin,
    fsplit,
    isArray,
    type Discriminate,
    type SoftNonEmptyArray,
    type NonEmptyArray,
    strcmp,
    type SoftArray,
} from './util.ts'

export type FontStyle = 'italic' | 'bold' | 'underline' | 'strikethrough'

export type Style = {
    name: string
    fg?: ColorInstance
    in?: SoftArray<FontStyle> | ''
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
}

export type Scope = string
export type Selector = Scope | readonly Selector[] | Discriminate<Combinators>

export type Rule = TokenRule | UnorderedRule

export type TokenRule = {
    type: 'rule'
    style: Style | null
    selector: Selector
}

export type UnorderedRule = {
    type: 'unordered'
    rules: readonly TokenRule[]
}

type Combinators = {
    any: { parts: readonly Selector[] }
    dsc: { parts: readonly Selector[] }
}

export type CompileOptions = {
    /** Default style. Specify all properties to ensure anything else set by another rule is overriden. */
    unstyle: Style
}

type StyleInfo = { from: Rule; style: SoftNonEmptyArray<Style | null> }

export function language(scopeName: Scope, ...rules: Rule[]): Rule[] {
    return rules.map(u =>
        u.type === 'rule' ? suffixRule(scopeName, u) : unordered(...u.rules.map(u => suffixRule(scopeName, u))),
    )
}
function suffixRule(by: string, u: TokenRule): TokenRule {
    return { ...u, type: 'rule', selector: [u.selector, by] }
}

export function semantic(style: Pick<Style, 'fg' | 'in'>): TokenStylingStyle {
    return (
            style.fg !== undefined &&
                (style.in === undefined || (typeof style.in !== 'string' && style.in.length === 0))
        ) ?
            style.fg
        :   {
                foreground: style.fg,
                fontStyle: isArray(style.in) ? style.in.toSorted().join(' ') : style.in,
            }
}

export function r(style: Style | null, ...selectors: readonly Selector[]): TokenRule {
    return { type: 'rule', style, selector: any(...selectors) }
}

export function any(...parts: Selector[]): Selector {
    if (parts.length < 1) console.error('warning: any called with', parts.length, 'parts')
    return parts.length === 1 ? parts[0] : { type: 'any', parts }
}

export function dsc(...parts: Selector[]): Selector {
    if (parts.length < 1) console.error('warning: c called with', parts.length, 'parts')
    return parts.length === 1 ? parts[0] : { type: 'dsc', parts }
}

export function unordered(...rules: TokenRule[]): UnorderedRule {
    if (rules.length < 2) console.error('warning: undordered called with', rules.length, 'rules')
    return { type: 'unordered', rules }
}
export function compileTokenColors(rules: readonly Rule[], options: CompileOptions) {
    const c = new TokenColorsCompiler(options)
    const r = c.emitRules(c.compileRules(rules))
    c.diagnostics.forEach(d => console.error(d))
    return r
}

class TokenColorsCompiler {
    readonly diagnostics: string[] = []
    constructor(private readonly options: CompileOptions) {}

    readonly emitRules = (map: Map<string, StyleInfo>): Required<TextMateTokenColor>[] => {
        // create one item per styleref group
        // resolve their styles, naming them and merge them.
        const items = new Map<string, { styles: NonEmptyArray<Style | null>; selectors: string[] }>()
        for (const [selector, { style }] of map) {
            const identity = JSON.stringify(
                isArray(style) ?
                    style.sort((a, b) =>
                        a === null ? +(b !== null)
                        : b === null ? -(a !== null)
                        : strcmp(a.name, b.name),
                    )
                :   [style],
            )
            if (!items.get(identity)?.selectors.push(selector))
                items.set(identity, { styles: isArray(style) ? style : [style], selectors: [selector] })
        }

        return Array.from(items.values(), ({ styles, selectors }) =>
            toTokenColor(
                this.combineName(styles),
                selectors.sort(),
                mergeStyles(nmap(styles, s => s ?? this.options.unstyle)),
            ),
        ).sort(({ name: a }, { name: b }) => strcmp(a, b))
    }

    readonly combineName = (styles: SoftNonEmptyArray<Style | null>) =>
        (isArray(styles) ? styles : [styles]).map(s => s?.name ?? this.options.unstyle.name).join(' ')

    readonly compileRules = (rules: readonly Rule[]) => {
        const bindings = new Map<string, StyleInfo>()

        const set = (selector: string, info: StyleInfo) => {
            const existing = bindings.get(selector)
            if (existing !== undefined) {
                this.diagnostics.push(
                    `${this.combineName(info.style)}: selector ${selector} already assigned to style ${this.combineName(existing.style)}`,
                )
                return
            }
            bindings.set(selector, info)
        }
        const setRule = (rule: TokenRule) =>
            uniqueSorted(expandSelector(rule.selector)).forEach(s =>
                set(s, {
                    from: rule,
                    style: rule.style,
                }),
            )

        for (const rule of rules) {
            if (rule.type !== 'unordered') {
                setRule(rule)
                continue
            }

            for (const trule of rule.rules) {
                setRule(trule)
            }

            for (let size = 2; size <= rule.rules.length; size++) {
                for (const group of combinationsOf(rule.rules, size)) {
                    const orders = permutations(group)
                    const selectors = uniqueSorted(
                        orders.flatMap(ordered =>
                            cartesian(ordered.map(({ selector }) => (selector ? expandSelector(selector) : []))).map(
                                parts => parts.join(' '),
                            ),
                        ),
                    )
                    const style = group.map(g => g.style) as NonEmptyArray<Style | null>
                    for (const s of selectors) {
                        set(s, { from: rule, style })
                    }
                }
            }
        }

        return bindings
    }
}

function expandSelector(s: Selector): string[] {
    if (typeof s === 'string') {
        return expandString(s)
    }
    if (isArray(s)) {
        return cartesian(s.map(expandSelector)).map(fjoin('.'))
    } else if (s.type === 'any') {
        return s.parts.flatMap(expandSelector)
    } else {
        return cartesian(s.parts.map(expandSelector)).map(fjoin(' '))
    }
}

function toTokenColor(name: string, scopes: readonly Scope[], style: Style): Required<TextMateTokenColor> {
    return {
        name,
        scope: scopes.length === 1 ? scopes[0] : scopes,
        settings: toSettings(style),
    }
}

function toSettings(style: Style): TextMateSettings {
    return {
        ...('fg' in style ? { foreground: style.fg } : undefined),
        ...('in' in style ? { fontStyle: normalizeFontStyle(style.in) } : undefined),
        ...(style.fontFamily !== undefined ? { fontFamily: style.fontFamily } : undefined),
        ...(style.fontSize !== undefined ? { fontSize: style.fontSize } : undefined),
        ...(style.lineHeight !== undefined ? { lineHeight: style.lineHeight } : undefined),
    }
}

function normalizeFontStyle(value: Style['in']) {
    return value === undefined || typeof value === 'string' ? value : uniqueSorted(value).join(' ')
}

function mergeStyles(styles: readonly [Style, ...Style[]]): Style {
    if (styles.length === 1) return styles[0]
    const merged: Style = Object.assign({}, ...styles)
    merged.in = styles.reduce((S, { in: s }): FontStyle[] => {
        if (typeof s === 'string') {
            if (s) S.push(s)
            else return []
        } else {
            if (s) S.push(...s)
        }
        return S
    }, [])
    return merged
}

const expand = {
    split: fsplit('.', ' ', ':'),
    join: fjoin('.', ' '),
}
function expandString(s: string): string[] {
    return cartesian3(expand.split(s)).map(expand.join)
}

function cartesian3<T>(sets: readonly (readonly (readonly T[])[])[]): T[][][] {
    return cartesian(sets.map(group => cartesian(group)))
}
function cartesian<T>(sets: readonly (readonly T[])[]): T[][] {
    return sets.reduce<T[][]>((rows, set) => rows.flatMap(row => set.map(item => [...row, item])), [[]])
}

function combinationsOf<T>(items: readonly T[], size: number): T[][] {
    if (size === 0) return [[]]
    if (items.length < size) return []
    const [head, ...tail] = items
    return [...combinationsOf(tail, size - 1).map(items => [head, ...items]), ...combinationsOf(tail, size)]
}

function permutations<T>(items: readonly T[]): T[][] {
    if (items.length <= 1) return [[...items]]
    return items.flatMap((item, i) =>
        permutations(items.filter((_, restIndex) => restIndex !== i)).map(permutation => [item, ...permutation]),
    )
}

function uniqueSorted<T extends string>(items: readonly T[]): T[] {
    return [...new Set(items)].sort()
}
