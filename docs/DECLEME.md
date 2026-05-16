# decleme

`decleme` is a small authoring API for VS Code TextMate token colors.

It lets a theme source describe token-color intent with composable selector and rule expressions, then expands those expressions to ordinary VS Code `tokenColors`.

The compiler is intentionally explicit: every emitted rule is a positive TextMate selector with final settings already merged.

## Core Model

TextMate token color rules do not merge all matching rules like CSS. `decleme` provides a small algebra for composing selectors and styles before emitting plain TextMate rules.

```txt
selector expression -> selector set
rule expression     -> styled selector set
```

A selector is a sequence of scopes:

```txt
meta.import keyword.control.as
```

A scope is a dotted TextMate scope:

```txt
keyword.control.as
```

A dotted scope can also be built with an array:

```ts
['keyword', 'control', 'as']
```

## Styles

```ts
export type FontStyle =
    | 'italic'
    | 'bold'
    | 'underline'
    | 'strikethrough'

export type Style = {
    name: string
    fg?: ColorInstance
    in?: FontStyle | FontStyle[] | ''
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
}
```

Style fields compile as follows:

```txt
name       -> token-color entry name
fg         -> settings.foreground
in         -> settings.fontStyle
fontFamily -> settings.fontFamily
fontSize   -> settings.fontSize
lineHeight -> settings.lineHeight
```

`in` is normalized by sorting and deduplicating font-style values. `in: ''` emits `fontStyle: ''` and clears accumulated font styles.

Style merging is ordered. Later styles overwrite `fg`, `fontFamily`, `fontSize`, and `lineHeight` when present. Font styles are accumulated unless a later style uses `in: ''`.

```ts
const A = { name: 'A', fontSize: 10 }
const B = { name: 'B', fontSize: 12 }
```

```txt
A & B -> fontSize 12
B & A -> fontSize 10
```

## API

```ts
compileTokenColors(rules: readonly Rule[], options?: CompileOptions): TextMateTokenColor[]
```

Compiles rule expressions to VS Code token-color entries.

```ts
type CompileOptions = {
    unstyle: Style
}
```

`unstyle` is used when a rule style is `null`. If omitted, the default is `{ name: 'unstyled', in: '' }`.

Other exports:

```ts
r(style, ...selectors)
one(...parts)
any(...parts)
dsc(...parts)
cld(...parts)
language(scopeName, ...rules)
semantic(style)
```

## Expressions

### `r(style, ...selectors)`

Creates a token rule assigning `style` to every selector produced by the selector expressions. Multiple selector arguments are alternatives, equivalent to `one(...)`.

```ts
r(s.text, 'markup.raw', 'markup.inline.raw')
```

produces:

```txt
markup.raw        -> text
markup.inline.raw -> text
```

`style` may be `null`; `compileTokenColors` resolves it through `options.unstyle`.

### `one(...parts)`

`one` means alternatives. It does not compose branches.

```ts
one('a', 'b')
```

produces:

```txt
a
b
```

For rules:

```ts
one(r(A, 'a'), r(B, 'b'))
```

produces:

```txt
a -> A
b -> B
```

### `any(...parts)`

`any` means every non-empty ordered combination of the provided non-null parts.

```ts
any(r(A, 'a'), r(B, 'b'))
```

produces:

```txt
a   -> A
b   -> B
a b -> A & B
b a -> B & A
```

When `null` is included, `any` also permits the empty sequence:

```ts
any(null, r(A, 'a'))
```

can produce either nothing or:

```txt
a -> A
```

Use `any` when branches may co-occur and styles should compose.

### `dsc(...parts)`

`dsc` composes parts with TextMate descendant spacing.

```ts
dsc('a', 'b', 'c')
```

produces:

```txt
a b c
```

For rule expressions, selectors compose and styles merge in order:

```ts
dsc(r(A, 'a'), r(B, 'b'))
```

produces:

```txt
a b -> A & B
```

Mixed selector and rule expressions are allowed:

```ts
dsc('meta.import', r(B, 'keyword.control.as:from'))
```

produces:

```txt
meta.import keyword.control.as   -> B
meta.import keyword.control.from -> B
```

### `cld(...parts)`

`cld` composes parts with TextMate's direct-child combinator.

```ts
cld('a', 'b', 'c')
```

produces:

```txt
a > b > c
```

`cld` otherwise follows the same selector/rule composition rules as `dsc`.

### `null`

`null` matches nothing and carries no style. It is useful for optional composition.

```ts
one(null, r(s.declaration, 'markup.heading'))
```

means either no rule contribution or:

```txt
markup.heading -> declaration
```

## Selector Syntax

Strings use compact selector syntax.

Spaces create descendant selectors:

```ts
'meta.import keyword.control.as:from'
```

is equivalent to:

```ts
dsc('meta.import', 'keyword.control.as:from')
```

Colon alternatives are local to the nearest dot segment:

```ts
'keyword.control.flow:conditional'
```

expands to:

```txt
keyword.control.flow
keyword.control.conditional
```

An empty colon alternative omits that segment:

```ts
'keyword.control:.ts'
```

expands to:

```txt
keyword.control.ts
keyword.ts
```

Arrays create dotted scope nesting. Each array item is expanded before joining:

```ts
['keyword', one('control', 'operator'), 'flow']
```

expands to:

```txt
keyword.control.flow
keyword.operator.flow
```

Arrays are selector-only. Rule expressions inside selector arrays are invalid.

## Language Scoping

```ts
language('ts', r(s.declaration, 'keyword.control.import'))
```

suffixes each selector scope with the language scope:

```txt
keyword.control.import.ts -> declaration
```

For composed rules, `language` maps every nested token rule selector before compilation.

## Semantic Token Settings

```ts
semantic(style)
```

Converts a decleme style fragment to a VS Code semantic token color value.

If the style has a foreground and no font style, or an empty font-style array, it returns the foreground color directly:

```ts
semantic({ fg: colors.green })
```

Otherwise it returns an object with `foreground` and `fontStyle`:

```ts
semantic({ fg: colors.green, in: ['italic', 'bold'] })
```

produces a semantic token setting equivalent to:

```ts
{
    foreground: colors.green,
    fontStyle: 'bold italic',
}
```

## Canonicalization And Emission

The compiler expands expressions, canonicalizes selectors, merges styles for composed rules, groups selectors by equivalent final TextMate settings, and emits stable `tokenColors`.

A canonical selector may appear only once. Duplicate selector definitions throw, even when the styles are identical:

```ts
one(r(s.text, 'string'), r(s.text, 'string'))
```

```ts
any(r(s.text, 'string'), r(s.text, 'string'))
```

Both fail because duplicate selector definitions introduce drift. To apply multiple styles to the same selector, intentionally compose them through `any`, `dsc`, `cld`, or an explicit style object.

Equivalent final settings are grouped into one token-color entry:

```ts
[
    r(s.text, 'string.quoted'),
    r(s.text, 'string.template'),
]
```

may emit:

```ts
{
    name: 'text',
    scope: ['string.quoted', 'string.template'],
    settings: {
        foreground: '#...',
    },
}
```

Rule order is only an emission detail. It does not provide override semantics.

## Sample Pattern

This pattern expresses optional heading structure followed by any combination of markdown inline styles:

```ts
dsc(
    one(null, r(s.declaration, 'markup.heading')),
    any(
        null,
        r(s.emphasis, 'markup.italic'),
        r(s.strong, 'markup.bold'),
        r(s.quote, 'markup.quote'),
    ),
)
```

It produces the standalone inline styles, the optional heading rule, and heading-first combinations such as:

```txt
markup.heading                           -> declaration
markup.italic                            -> emphasis
markup.bold                              -> strong
markup.quote                             -> quote
markup.heading markup.italic             -> declaration & emphasis
markup.heading markup.bold               -> declaration & strong
markup.heading markup.quote              -> declaration & quote
markup.heading markup.italic markup.bold -> declaration & emphasis & strong
```

It does not produce heading-last selectors such as:

```txt
markup.italic markup.heading
markup.bold markup.heading
```

because `markup.heading` is structurally anchored first by `dsc`.
