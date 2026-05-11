import type { ColorInstance } from 'color'
import { styles, type StyleKey } from './styles.ts'
import type { TextMateSettings, TextMateTokenColor, TokenStylingStyle } from './types.ts'
import { fjoin, fsplit } from './util.ts'

export type FontStyle = 'italic' | 'bold' | 'underline' | 'strikethrough'

export type Style = {
    name?: string
    fg?: ColorInstance
    in?: FontStyle | readonly FontStyle[]
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
}

export type Scope = string | readonly Scope[] | AnySelector | DescendingSelector

export type Rule = TokenRule | UnorderedRule

export type TokenRule = {
    type: 'rule'
    style: StyleKey
    on?: Scope
    no?: Scope
}

export type RuleOptions = {
    on?: Scope
    no?: Scope
}

export type UnorderedRule = {
    type: 'unordered'
    rules: readonly TokenRule[]
}

export type AnySelector = {
    type: 'any'
    parts: readonly Scope[]
}

export type DescendingSelector = {
    type: 'c'
    parts: readonly Scope[]
}

export type CompileOptions = {
    defaultForeground?: ColorInstance
    defaultFontFamily?: string
    defaultFontSize?: number
    defaultLineHeight?: number
}

export function language(scopeName: string, ...rules: Rule[]): Rule[] {
    return rules.map(u =>
        u.type === 'rule' ? suffixRule(scopeName, u) : unordered(...u.rules.map(u => suffixRule(scopeName, u))),
    )
}
function suffixRule(by: string, u: TokenRule) {
    return r(u.style, {
        on: u.on === undefined ? undefined : [u.on, by],
        no: u.no === undefined ? undefined : [u.no, by],
    })
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

export function r(style: StyleKey, options: RuleOptions): TokenRule {
    return { type: 'rule', style, on: options.on, no: options.no }
}

export function any(...parts: Scope[]): AnySelector {
    if (parts.length < 1) console.error('warning: any called with', parts.length, 'parts')
    return { type: 'any', parts }
}

export function desc(...parts: Scope[]): DescendingSelector {
    if (parts.length < 1) console.error('warning: c called with', parts.length, 'parts')
    return { type: 'c', parts }
}

export function unordered(...rules: TokenRule[]): UnorderedRule {
    if (rules.length < 2) console.error('warning: undordered called with', rules.length, 'rules')
    return { type: 'unordered', rules }
}

export function compileTokenColors(rules: readonly Rule[], options: CompileOptions = {}): TextMateTokenColor[] {
    return mergeRules(rules)
        .flatMap(item => compileRule(item, options))
        .sort(({ name: a }, { name: b }) =>
            a === b ? 0
            : a === undefined || (b !== undefined && a < b) ? -1
            : 1,
        )
}

function mergeRules(rules: readonly Rule[]): Rule[] {
    const mergedRules: Rule[] = []
    const mergedByStyle = new Map<StyleKey, TokenRule>()

    for (const item of rules) {
        if (item.type === 'unordered') {
            mergedRules.push(item)
            continue
        }

        const existing = mergedByStyle.get(item.style)
        if (existing) {
            existing.on = combineOptionalScopes(existing.on, item.on)
            existing.no = combineOptionalScopes(existing.no, item.no)
        } else {
            const merged = { ...item }
            mergedByStyle.set(item.style, merged)
            mergedRules.push(merged)
        }
    }

    return mergedRules
}

function combineOptionalScopes(left: Scope | undefined, right: Scope | undefined): Scope | undefined {
    if (left && right) return any(left, right)
    return left ?? right
}

function compileRule(item: Rule, options: CompileOptions): TextMateTokenColor[] {
    if (item.type === 'unordered') return compileUnordered(item, options)
    return compileTokenRule(item, options)
}

function compileTokenRule(item: TokenRule, options: CompileOptions): TextMateTokenColor[] {
    const style = resolveStyle(item.style)
    const scopes = item.on ? uniqueSorted(expandScope(item.on)) : []
    const compiled: TextMateTokenColor[] = [toTokenColor(style, scopes)]
    if (scopes.length === 0) {
        console.log('warning: empty rule: ', item)
    }
    if (item.no) {
        const resetStyle = invertStyle(style, options)
        const resetScopes = uniqueSorted(expandScope(item.no))
        compiled.push(toTokenColor({ ...resetStyle, name: `${style.name ?? item.style}.reset` }, resetScopes))
    }

    return compiled
}

function compileUnordered(item: UnorderedRule, options: CompileOptions): TextMateTokenColor[] {
    const base = item.rules.flatMap(item => compileTokenRule(item, options))
    const combinations: TextMateTokenColor[] = []

    for (let size = 2; size <= item.rules.length; size++) {
        for (const group of combinationsOf(item.rules, size)) {
            const style = {
                ...group.reduce((style, item) => mergeStyles(style, resolveStyle(item.style)), {} as Style),
                ...combinedName(group),
            }
            const orders = permutations(group)
            const scopes = uniqueSorted(
                orders.flatMap(ordered =>
                    cartesian(ordered.map(item => (item.on ? expandScope(item.on) : []))).map(parts => parts.join(' ')),
                ),
            )
            combinations.push(toTokenColor(style, scopes))
        }
    }

    return [...base, ...combinations]
}

function combinedName(rules: readonly TokenRule[]): Pick<Style, 'name'> {
    const names = rules.flatMap(item => {
        const style = resolveStyle(item.style)
        return style.name ? [style.name] : []
    })
    return names.length > 0 ? { name: names.sort().join(' ') } : {}
}

function resolveStyle(style: StyleKey): Style {
    return styles[style]
}

function toTokenColor(style: Style, scopes: readonly string[]): TextMateTokenColor {
    return {
        ...(style.name ? { name: style.name } : {}),
        scope: scopes.length === 1 ? scopes[0] : [...scopes],
        settings: toSettings(style),
    }
}

function toSettings(style: Style): TextMateSettings {
    return {
        ...('fg' in style ? { foreground: style.fg } : {}),
        ...('in' in style ? { fontStyle: normalizeFontStyle(style.in) } : {}),
        ...(style.fontFamily !== undefined ? { fontFamily: style.fontFamily } : {}),
        ...(style.fontSize !== undefined ? { fontSize: style.fontSize } : {}),
        ...(style.lineHeight !== undefined ? { lineHeight: style.lineHeight } : {}),
    }
}

function normalizeFontStyle(value: Style['in']): string {
    if (value === undefined) return ''
    return uniqueSorted(toFontStyleArray(value)).join(' ')
}

function invertStyle(style: Style, options: CompileOptions): Style {
    const reset: Style = {}

    if ('fg' in style) {
        if (!('defaultForeground' in options))
            throw new Error('compileTokenColors requires defaultForeground for fg exclusions')
        reset.fg = options.defaultForeground
    }

    if ('in' in style) reset.in = []
    if (style.fontFamily !== undefined) reset.fontFamily = options.defaultFontFamily
    if (style.fontSize !== undefined) reset.fontSize = options.defaultFontSize
    if (style.lineHeight !== undefined) reset.lineHeight = options.defaultLineHeight

    return reset
}

function mergeStyles(left: Style, right: Style): Style {
    const merged: Style = { ...left, ...right }

    if ('in' in left || 'in' in right) {
        const rightItems = 'in' in right ? toFontStyleArray(right.in) : undefined
        if (rightItems && rightItems.length === 0) {
            merged.in = []
        } else {
            merged.in = [...('in' in left ? toFontStyleArray(left.in) : []), ...(rightItems ?? [])]
        }
    }

    return merged
}

function toFontStyleArray(value: Style['in']): FontStyle[] {
    if (value === undefined) return []
    return typeof value === 'string' ? [value] : [...value]
}

function expandScope(scope: Scope): string[] {
    if (typeof scope === 'string') return expandString(scope)
    if (isArray(scope)) {
        return cartesian(scope.map(expandScope)).map(fjoin('.'))
    }
    if (scope.type === 'any') return scope.parts.flatMap(expandScope)
    return cartesian(scope.parts.map(expandScope)).map(fjoin(' '))
}

function isArray(arr: unknown): arr is readonly unknown[] {
    return Array.isArray(arr)
}

const expand = {
    split: fsplit(':', '.', ' '),
    join: fjoin(' ', '.'),
}
function expandString(s: string): string[] {
    console.log(
        s,
        expand.split(s),
        expand.split(s).map(set => expand.join(cartesian(set))),
    )
    return expand.split(s).map(set => expand.join(cartesian(set)))
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
    return items.flatMap((item, index) => {
        const rest = items.filter((_, restIndex) => restIndex !== index)
        return permutations(rest).map(permutation => [item, ...permutation])
    })
}

function uniqueSorted(items: readonly string[]): string[] {
    return [...new Set(items)].sort()
}
