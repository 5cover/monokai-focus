# decleme

`decleme` is a small authoring API for VS Code TextMate token colors.

It lets a theme source describe token-color intent with composable selector and rule expressions, then expands those expressions to ordinary VS Code `tokenColors`.

The compiled output is still plain VS Code theme JSON:

```ts
export type TextMateTokenColor = {
    name?: string
    scope: string | string[]
    settings: TmSettings
}
```

## Core principle

TextMate theme rules are positive selector rules. They do not merge multiple matching styles the way CSS does.

`decleme` provides an authoring algebra where styles can be composed explicitly, then compiles the result to explicit positive TextMate rules.

The source model is:

```txt
selector expression -> selector set
rule expression     -> rule set
```

A selector is a sequence of scopes:

```txt
meta.import keyword.control.as
```

A scope is a dotted TextMate scope:

```txt
keyword.control.as
```

A dot scope can also be built from an array:

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
    fg?: unknown
    in?: FontStyle | FontStyle[]
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

`in` is normalized by sorting and deduplicating font-style values.

Style merging is ordered.

When styles are merged:

```txt
A & B
```

then `B` is applied after `A`.

Rules:

- `fg`, `fontFamily`, `fontSize`, and `lineHeight` are overwritten by later styles when present.
- `in` values are unioned.
- `in: ''` clears the accumulated font style and emits `fontStyle: ''`.
- Merged names are joined from display names in application order.

This means style merging is not commutative.

Example:

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
compileTokenColors(rules: RuleExpr[], options?: CompileOptions): TextMateTokenColor[]
```

Compiles decleme rule expressions to VS Code token-color entries.

The compiler:

1. expands selector and rule expressions
2. canonicalizes selectors
3. rejects duplicate canonical selectors
4. merges styles for composed rules
5. groups final selectors by equivalent TextMate settings
6. emits `tokenColors`

## Rule algebra

### `r(style, ...selectors)`

Creates rules assigning a style to every selector produced by a selector expression.

```ts
r(s.text, 'string')
```

produces:

```txt
string -> text
```

With alternatives:

```ts
r(s.text, 'markup.raw', 'markup.inline.raw')
```

produces:

```txt
markup.raw        -> text
markup.inline.raw -> text
```

`r` accepts combines multiple selectors with `one(...)`.

### `dsc(...parts)`

Creates descendant composition.

For selector expressions:

```ts
dsc('a', 'b', 'c')
```

produces:

```txt
a b c
```

For rule expressions, `dsc` composes the selectors and merges styles in order.

Example:

```ts
const r1 = r(A, 'a')
const r2 = r(B, 'b')

dsc(r1, r2)
```

produces:

```txt
a b -> A & B
```

Mixed selector/rule expressions are allowed.

```ts
dsc('a', r(B, 'b'))
```

is equivalent to:

```ts
r(B, dsc('a', 'b'))
```

and produces:

```txt
a b -> B
```

Example:

```ts
dsc('meta.import', 'keyword.control.as:from')
```

expands to:

```txt
meta.import keyword.control.as
meta.import keyword.control.from
```

The final scope is the target token scope in VS Code’s TextMate matching grammar. Earlier scopes are ancestors.

For simple selectors, a string with spaces may be parsed as a descendant selector:

```ts
'meta.import keyword.control.as:from'
```

is equivalent to:

```ts
dsc('meta.import', 'keyword.control.as:from')
```

### `one(...parts)`

`one` means alternatives.

For selectors:

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

No combinations are produced.

So:

```ts
dsc(r(A, 'a'), one(r(B, 'b'), r(C, 'c')), r(D, 'd'))
```

produces:

```txt
a b d -> A & B & D
a c d -> A & C & D
```

Use `one` when exactly one branch should be selected.

```ts
r(s.text, one('string.quoted', 'string.template'))
```

expands to:

```txt
string.quoted   -> text
string.template -> text
```

`one` does not compose branches.

### `any(...parts)`

`any` means any non-empty combination of the provided parts.

It is the replacement for the old `unordered`.

For rules:

```ts
any(r(A, 'a'), r(B, 'b'))
```

produces:

```txt
a     -> A
b     -> B
a b   -> A & B
b a   -> B & A
```

For three rules:

```ts
any(r(A, 'a'), r(B, 'b'), r(C, 'c'))
```

produces all non-empty ordered combinations:

```txt
a       -> A
b       -> B
c       -> C

a b     -> A & B
b a     -> B & A
a c     -> A & C
c a     -> C & A
b c     -> B & C
c b     -> C & B

a b c   -> A & B & C
a c b   -> A & C & B
b a c   -> B & A & C
b c a   -> B & C & A
c a b   -> C & A & B
c b a   -> C & B & A
```

For selectors, `any` uses the same structure, but there are no styles to merge.

```ts
any('a', 'b')
```

produces:

```txt
a
b
a b
b a
```

This differs from:

```ts
one('a', 'b')
```

which only produces:

```txt
a
b
```

So:

```ts
dsc('a', one('b', 'c'), 'c')
```

produces:

```txt
a b c
a c c
```

while:

```ts
dsc('a', any('b', 'c'), 'c')
```

produces:

```txt
a b c
a c c
a b c c
a c b c
```

For ordinary descendant selectors this may often match the same tokens, because TextMate descendant matching is not exact sequence matching. It becomes meaningful when direct-child selectors are used.

Use `any` when branches may co-occur and styles should compose.

Markdown example:

```ts
any(
    r(s.emphasis, 'markup.italic'),
    r(s.strong, 'markup.bold'),
)
```

expands to:

```txt
markup.italic             -> emphasis
markup.bold               -> strong
markup.italic markup.bold -> emphasis & strong
markup.bold markup.italic -> strong & emphasis
```

If both styles only affect `in`, both combined rules emit:

```txt
fontStyle: 'italic bold'
```

If styles assign conflicting ordered fields, order matters.

### `cld(...parts)`

`cld` creates direct-child composition using TextMate’s `>` combinator.

```ts
cld('a', 'b', 'c')
```

produces:

```txt
a > b > c
```

With `any`:

```ts
cld('a', any('b', 'c'), 'c')
```

produces:

```txt
a > b > c
a > c > c
a > b > c > c
a > c > b > c
```

`dsc` means descendant order.

`cld` means direct-child order.

### Dot nesting

An array creates dotted scope nesting.

```ts
['keyword', 'control', 'flow']
```

expands to the selector:

```txt
keyword.control.flow
```

Each array item is expanded before joining, so arrays can contain alternatives.

Example:

```ts
['keyword', one('control', 'operator'), 'flow']
```

expands to:

```txt
keyword.control.flow
keyword.operator.flow
```

Arrays only make sense for selector expressions.

Arrays of rule expressions are invalid because there is no meaningful rule-level dot nesting.

Invalid:

```ts
[r(A, 'a'), r(B, 'b')]
```

### Null expression

`null` is a valid expression.

It matches nothing.

It is useful for optional composition.

```ts
one(null, r(s.declaration, 'markup.heading'))
```

means:

```txt
nothing
or
markup.heading -> declaration
```

### Selector values

```ts
type SelectorExpr =
    | null
    | string
    | readonly SelectorExpr[]
    | OneExpr
    | AnyExpr
    | DescExpr
    | ChildExpr
```

Strings are compact selector syntax.

Arrays create dot nesting.

Helpers create selector expressions.

### Colon alternatives

Inside a string atom, `:` creates one-alternatives for the nearest dot segment.

```ts
'keyword.control.flow:conditional'
```

expands to:

```txt
keyword.control.flow
keyword.control.conditional
```

An empty alternative means the current segment is omitted:

```ts
'keyword.control:.ts'
```

expands to:

```txt
keyword.control.ts
keyword.ts
```

equivalently to

```ts
['keyword', one('control', null), 'ts']
```

Colon alternatives are local to their dot segment. Cross-products are produced when multiple segments contain alternatives.

## Rule canonicalization

After expansion, every rule has:

```ts
type ExpandedRule = {
    selector: Selector
    styles: Style[]
}
```

The compiler canonicalizes selectors.

A canonical selector may appear only once.

This is an error even when styles are identical.

Examples that must fail:

```ts
one(r(s.text, 'string'), r(s.text, 'string'))
```

```ts
any(r(s.text, 'string'), r(s.text, 'string'))
```

Reason:

```txt
duplicate selector definitions introduce drift
```

If a user wants multiple styles on the same selector, they must intentionally produce a combined style through `any`, `dsc`, or an explicit style object.

## Source order

Source order must not affect selector meaning.

The compiler must reject duplicate canonical selectors instead of allowing later rules to override earlier rules.

Rule order is only an emission detail, but it must be stable.

## TextMate emission

After expansion and canonicalization, rules are grouped by equivalent final settings.

Example:

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
    scope: [
        'string.quoted',
        'string.template',
    ],
    settings: {
        foreground: '#...',
    },
}
```

The emitted rules are ordinary positive TextMate token-color entries.

## Sample patterns

### `null` with `one`

This pattern expresses optional structure:

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

This means:

```txt
the any-combination of null/italic/bold/quote
optionally preceded by heading declaration
```

null in any naturally permits it to match the empty sequence.

This produces:

```txt
markup.heading -> declaration

markup.italic -> emphasis
markup.bold   -> strong
markup.quote  -> quote
markup.heading markup.italic -> declaration & emphasis
markup.heading markup.bold   -> declaration & strong
markup.heading markup.quote  -> declaration & quote

markup.italic markup.bold -> emphasis & strong
markup.bold markup.italic -> strong & emphasis
...
markup.heading markup.italic markup.bold -> declaration & emphasis & strong
markup.heading markup.bold markup.italic -> declaration & strong & emphasis
...
```

It does not produce:

```txt
markup.italic markup.heading
markup.bold markup.heading
```

because `markup.heading` is structurally anchored first by `dsc`.
