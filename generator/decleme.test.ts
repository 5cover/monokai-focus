import test from 'node:test'
import assert from 'node:assert/strict'
import { any, cld, compileTokenColors, dsc, language, one, r, type Rule, type Style } from './decleme.ts'
import type { TextMateSettings, TextMateTokenColor } from './types.ts'

const A = { name: 'A', fontSize: 10, in: 'italic' } satisfies Style
const B = { name: 'B', fontSize: 12, in: 'bold' } satisfies Style
const C = { name: 'C', lineHeight: 1.5 } satisfies Style
const clear = { name: 'clear', in: '' } satisfies Style

const unstyle = { name: 'unstyled', fontSize: 1, in: '' } satisfies Style

function compile(rules: readonly Rule[]): Required<TextMateTokenColor>[] {
    return compileTokenColors(rules, { unstyle })
}

function byScope(rules: readonly Required<TextMateTokenColor>[]): Map<string, Required<TextMateTokenColor>> {
    const map = new Map<string, Required<TextMateTokenColor>>()
    for (const rule of rules) {
        for (const scope of Array.isArray(rule.scope) ? rule.scope : [rule.scope]) map.set(scope, rule)
    }
    return map
}

function settingsFor(rules: readonly Required<TextMateTokenColor>[], scope: string): TextMateSettings {
    const settings = byScope(rules).get(scope)?.settings
    assert.ok(settings, `expected settings for ${scope}`)
    return settings
}

test('expands compact string selectors', () => {
    const [tokenColor] = compile([
        r(A, 'keyword.control.flow:conditional', 'keyword.control:.ts', 'meta.import keyword.control.as:from'),
    ])

    assert.deepEqual(tokenColor.scope, [
        'keyword.control.conditional',
        'keyword.control.flow',
        'keyword.control.ts',
        'keyword.ts',
        'meta.import keyword.control.as',
        'meta.import keyword.control.from',
    ])
})

test('one expands alternatives without composition', () => {
    const scopes = byScope(compile([one(r(A, 'a'), r(B, 'b'))]))

    assert.deepEqual([...scopes.keys()].sort(), ['a', 'b'])
    assert.equal(scopes.get('a')?.name, 'A')
    assert.equal(scopes.get('b')?.name, 'B')
})

test('any expands every non-empty ordered combination', () => {
    const rules = compile([any(r(A, 'a'), r(B, 'b'))])

    assert.deepEqual([...byScope(rules).keys()].sort(), ['a', 'a b', 'b', 'b a'])
    assert.deepEqual(settingsFor(rules, 'a b'), { fontStyle: 'bold italic', fontSize: 12 })
    assert.deepEqual(settingsFor(rules, 'b a'), { fontStyle: 'bold italic', fontSize: 10 })
})

test('dsc and cld compose selectors and styles in order', () => {
    const rules = compile([dsc(r(A, 'a'), cld('b', r(B, 'c')), r(C, 'd'))])

    assert.deepEqual(settingsFor(rules, 'a b > c d'), {
        fontStyle: 'bold italic',
        fontSize: 12,
        lineHeight: 1.5,
    })
})

test('selector arrays create dotted scopes and reject rule expressions', () => {
    assert.deepEqual([...byScope(compile([r(A, ['keyword', one('control', 'operator'), 'flow'])])).keys()], [
        'keyword.control.flow',
        'keyword.operator.flow',
    ])

    const invalidSelector = ['keyword', r(B, 'control')] as unknown as Parameters<typeof r>[1]
    assert.throws(() => compile([r(A, invalidSelector)]), /rule expressions are invalid/)
})

test('null styles compile through unstyle and in empty string clears font style', () => {
    const rules = compile([r(null, 'unstyled.scope'), dsc(r(A, 'a'), r(clear, 'clear'))])

    assert.deepEqual(settingsFor(rules, 'unstyled.scope'), { fontStyle: '', fontSize: 1 })
    assert.deepEqual(settingsFor(rules, 'a clear'), { fontStyle: '', fontSize: 10 })
})

test('duplicate canonical selectors throw', () => {
    assert.throws(() => compile([one(r(A, 'a'), r(A, 'a'))]), /selector a already assigned/)
    assert.throws(() => compile([any(r(A, 'a'), r(A, 'a'))]), /selector a already assigned/)
})

test('groups identical final settings with stable sorted scopes', () => {
    const rules = compile([r(A, 'z.scope'), r({ ...A }, 'a.scope')])

    assert.equal(rules.length, 1)
    assert.equal(rules[0].name, 'A')
    assert.deepEqual(rules[0].scope, ['a.scope', 'z.scope'])
})

test('language suffixes every emitted rule selector', () => {
    const rules = compile(language('source.ts', any(r(A, 'a'), r(B, 'b'))))

    assert.deepEqual([...byScope(rules).keys()].sort(), [
        'a.source.ts',
        'a.source.ts b.source.ts',
        'b.source.ts',
        'b.source.ts a.source.ts',
    ])
})

test('documentation sample pattern typechecks and compiles to expected token colors', () => {
    const s = {
        declaration: { name: 'declaration', fontSize: 20 },
        emphasis: { name: 'emphasis', in: 'italic' },
        strong: { name: 'strong', in: 'bold' },
        quote: { name: 'quote', lineHeight: 2 },
    } satisfies Record<string, Style>

    const sample = dsc(
        one(null, r(s.declaration, 'markup.heading')),
        any(null, r(s.emphasis, 'markup.italic'), r(s.strong, 'markup.bold'), r(s.quote, 'markup.quote')),
    )

    const scopes = byScope(compile([sample]))

    assert.equal(scopes.size, 31)
    assert.deepEqual(scopes.get('markup.heading')?.settings, { fontSize: 20 })
    assert.deepEqual(scopes.get('markup.italic')?.settings, { fontStyle: 'italic' })
    assert.deepEqual(scopes.get('markup.bold')?.settings, { fontStyle: 'bold' })
    assert.deepEqual(scopes.get('markup.heading markup.italic')?.settings, {
        fontStyle: 'italic',
        fontSize: 20,
    })
    assert.deepEqual(scopes.get('markup.heading markup.bold markup.italic')?.settings, {
        fontStyle: 'bold italic',
        fontSize: 20,
    })
    assert.equal(scopes.has('markup.italic markup.heading'), false)
})
