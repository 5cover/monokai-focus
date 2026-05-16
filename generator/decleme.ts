import type { ColorInstance } from 'color'
import type { TextMateSettings, TextMateTokenColor, TokenStylingStyle } from './types.ts'
import { isArray, strcmp, type NonEmptyArray, type SoftArray } from './util.ts'

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
export type Selector = null | Scope | readonly Selector[] | Expr
export type Rule = null | TokenRule | Expr
type Part = Selector | TokenRule

export type TokenRule = {
    type: 'rule'
    style: Style | null
    selector: Selector
}

export type Expr = {
    type: 'one' | 'any' | 'dsc' | 'cld'
    parts: readonly Part[]
}

export type CompileOptions = {
    /** Default style. Specify all properties to ensure anything else set by another rule is overriden. */
    unstyle: Style
}

type ExpandedRule = { selector: string; styles: NonEmptyArray<Style | null> }
type Expansion = { selector: string; styles: readonly (Style | null)[] }
type StyleInfo = { from: Rule; styles: NonEmptyArray<Style | null> }

const defaultOptions: CompileOptions = {
    unstyle: {
        name: 'unstyled',
        in: '',
    },
}

export function language(scopeName: Selector, ...rules: Rule[]) {
    return dsc(scopeName, one(...rules))
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
    return { type: 'rule', style, selector: one(...selectors) }
}

export function one(...parts: readonly Part[]): Expr {
    if (parts.length < 1) console.error('warning: one called with', parts.length, 'parts')
    return { type: 'one', parts }
}

export function any(...parts: readonly Part[]): Expr {
    if (parts.length < 1) console.error('warning: any called with', parts.length, 'parts')
    return { type: 'any', parts }
}

export function dsc(...parts: readonly Part[]): Expr {
    if (parts.length < 1) console.error('warning: dsc called with', parts.length, 'parts')
    return { type: 'dsc', parts }
}

export function cld(...parts: readonly Part[]): Expr {
    if (parts.length < 1) console.error('warning: cld called with', parts.length, 'parts')
    return { type: 'cld', parts }
}

export function compileTokenColors(rules: readonly Rule[], options: CompileOptions = defaultOptions) {
    const c = new TokenColorsCompiler(options)
    return c.emitRules(c.compileRules(rules))
}

class TokenColorsCompiler {
    constructor(private readonly options: CompileOptions) {}

    readonly emitRules = (map: Map<string, StyleInfo>): Required<TextMateTokenColor>[] => {
        const items = new Map<string, { style: Style; names: Set<string>; selectors: string[] }>()
        for (const [selector, { styles }] of map) {
            const style = this.mergeStyles(styles)
            const identity = styleIdentity(style)
            const existing = items.get(identity)
            if (existing) {
                existing.selectors.push(selector)
                existing.names.add(style.name)
            } else {
                items.set(identity, { style, names: new Set<string>().add(style.name), selectors: [selector] })
            }
        }

        return Array.from(items.values(), ({ selectors, names, style }) =>
            toTokenColor(selectors.sort(), names.values().toArray().sort(), style),
        ).sort(({ name: a }, { name: b }) => strcmp(a, b))
    }

    readonly compileRules = (rules: readonly Rule[]) => {
        const bindings = new Map<string, StyleInfo>()

        const set = (rule: Rule, { selector, styles }: ExpandedRule) => {
            const existing = bindings.get(selector)
            if (existing !== undefined) {
                throw new Error(
                    `${this.combineName(styles)}: selector ${selector} already assigned to style ${this.combineName(existing.styles)}`,
                )
            }
            bindings.set(selector, { from: rule, styles })
        }

        for (const rule of rules) {
            for (const expanded of expandRule(rule)) set(rule, expanded)
        }

        return bindings
    }

    private readonly mergeStyles = (styles: NonEmptyArray<Style | null>): Style => {
        if (styles.length === 1) return styles[0] ?? this.options.unstyle

        const seed: FontStyle[] = []
        const merged: Style = Object.assign({}, ...styles, {
            name: this.combineName(styles, true),
            in: styles.reduce((S, style): FontStyle[] => {
                const s = (style ?? this.options.unstyle).in
                if (typeof s === 'string') {
                    if (s) S.push(s)
                    else return []
                } else {
                    if (s) S.push(...s)
                }
                return S
            }, seed),
        })
        if (seed.length === 0 && seed === merged.in) delete merged.in
        return merged
    }

    private readonly combineName = (styles: NonEmptyArray<Style | null>, sort = false) => {
        const n = styles.map(s => s?.name ?? this.options.unstyle.name)
        if (sort) n.sort()
        return n.join(' ')
    }
}

function expandRule(rule: Rule): ExpandedRule[] {
    return expandPart(rule)
        .filter((expansion): expansion is ExpandedRule => expansion.styles.length > 0)
        .map(expansion => ({
            selector: expansion.selector,
            styles: expansion.styles as NonEmptyArray<Style | null>,
        }))
}

function expandPart(part: Part): Expansion[] {
    if (part === null) return [{ selector: '', styles: [] }]
    if (typeof part === 'string') return expandString(part).map(selector => ({ selector, styles: [] }))
    if (isArray(part)) return expandSelectorArray(part).map(selector => ({ selector, styles: [] }))
    if (part.type === 'rule') {
        return expandPart(part.selector).map(({ selector }) => ({
            selector,
            styles: [part.style],
        }))
    }
    if (part.type === 'one') return part.parts.flatMap(expandPart)
    if (part.type === 'any') return expandAny(part.parts)
    return expandSequence(part.parts, part.type === 'cld' ? ' > ' : ' ')
}

function expandAny(parts: readonly Part[]): Expansion[] {
    const expanded: Expansion[] = []
    const nullable = parts.some(part =>
        expandPart(part).some(({ selector, styles }) => selector === '' && styles.length === 0),
    )
    if (nullable) expanded.push({ selector: '', styles: [] })

    for (let size = 1; size <= parts.length; size++) {
        for (const group of combinationsOf(parts, size)) {
            if (group.some(part => part === null)) continue
            for (const ordered of permutations(group)) expanded.push(...expandSequence(ordered, ' '))
        }
    }

    return expanded
}

function expandSequence(parts: readonly Part[], separator: string): Expansion[] {
    return cartesian(parts.map(expandPart)).map(expansions => ({
        selector: joinSelector(
            expansions.map(({ selector }) => selector),
            separator,
        ),
        styles: expansions.flatMap(({ styles }) => styles),
    }))
}

function expandSelectorArray(parts: readonly Selector[]): string[] {
    return cartesian(parts.map(expandPart)).map(expansions =>
        expansions
            .map(({ selector, styles }) => {
                if (styles.length > 0) throw new Error('rule expressions are invalid inside selector arrays')
                return selector
            })
            .filter(Boolean)
            .join('.'),
    )
}

function toTokenColor(
    scopes: readonly Scope[],
    names: readonly string[],
    style: Omit<Style, 'name'>,
): Required<TextMateTokenColor> {
    return {
        name: names.join(`\n`),
        scope: scopes.length === 1 ? scopes[0] : scopes,
        settings: toSettings(style),
    }
}

function toSettings(style: Omit<Style, 'name'>): TextMateSettings {
    return {
        ...('fg' in style ? { foreground: style.fg } : undefined),
        ...('in' in style ? { fontStyle: normalizeFontStyle(style.in) } : undefined),
        ...('fontFamily' in style ? { fontFamily: style.fontFamily } : undefined),
        ...('fontSize' in style ? { fontSize: style.fontSize } : undefined),
        ...('lineHeight' in style ? { lineHeight: style.lineHeight } : undefined),
    }
}

function styleIdentity(style: Style): string {
    return JSON.stringify(toSettings(style))
}

function normalizeFontStyle(value: Style['in']) {
    return value === undefined || typeof value === 'string' ? value : uniqueSorted(value).join(' ')
}

function expandString(s: string): string[] {
    return cartesian(s.split(' ').map(expandDotScope)).map(parts => joinSelector(parts, ' '))
}

function expandDotScope(scope: string): string[] {
    return cartesian(scope.split('.').map(part => part.split(':'))).map(parts => parts.filter(Boolean).join('.'))
}

function joinSelector(parts: readonly string[], separator: string): string {
    return parts.filter(Boolean).join(separator)
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
