# decleme

`decleme` is a small authoring API for VS Code TextMate token colors. It lets the theme source describe token-color intent with compact, composable selectors, then expands those selectors to ordinary VS Code `tokenColors` entries.

The compiled output is still plain VS Code theme JSON:

```ts
type TmTokenColor = {
    name?: string
    scope: string | string[]
    settings: TmSettings
}
```

## Design Constraints

VS Code TextMate theme selectors are positive selectors. They support:

- dot-separated scope-prefix matching, such as `string.quoted`
- ancestor selectors separated by spaces, such as `meta.import keyword.control.as`
- comma alternatives in string scopes
- the parent-scope child combinator `>`

They do not support negation, parent references from the target, or combinatorial style merging. `decleme` expands compact definitions into the explicit positive selectors VS Code can consume.

## API

```ts
compileTokenColors(rules: Rule[], options?: CompileOptions): TmTokenColor[]
```

Compiles decleme rules to VS Code token-color entries. Before selector expansion, plain rules with the same `StyleKey` are merged by OR-combining `on` and `no`. This lets modules reuse semantic style keys while producing one compact target rule per style.

```ts
type CompileOptions = {
    defaultForeground?: unknown
    defaultFontFamily?: string
    defaultFontSize?: number
    defaultLineHeight?: number
}
```

The default values are used when compiling `no` exclusions into reset rules.

```ts
r(styleKey, { on })
```

Creates a binding between a style key and one or more selectors. `on` is required. The style key must be a `StyleKey` exported by `styles.ts`.

```ts
r(styleKey, { on, no })
```

Creates the same binding, then creates positive reset rules for excluded contexts.

```ts
unordered(...rules)
```

Creates independent rules plus every unordered-product of their selectors and merged styles. This is useful for styles that can overlap without lexical nesting in the authoring source, such as markdown bold and italic.

```ts
desc(...parts)
```

Creates an ancestor selector. The parts are joined by spaces after expansion.

```ts
any(...parts)
```

Creates selector alternatives. Alternatives are expanded independently and flattened.

## Styles

```ts
type Style = {
    name?: string
    fg?: unknown
    in?: FontStyle | FontStyle[]
    fontFamily?: string
    fontSize?: number
    lineHeight?: number
}

type FontStyle = 'italic' | 'bold' | 'underline' | 'strikethrough'

const styles = {
    declaration: { name: 'declaration', fg: colors.declaration },
    operation: { name: 'operation', fg: colors.operation },
} as const satisfies Record<string, Style>

type StyleKey = keyof typeof styles
```

Style fields compile as follows:

- `name` becomes the token-color entry name.
- `fg` becomes `settings.foreground`.
- `in` becomes `settings.fontStyle`.
- `fontFamily`, `fontSize`, and `lineHeight` are copied to settings.

`in` is normalized by sorting and deduplicating font-style items. `in: []` intentionally emits `fontStyle: ''`, which clears inherited font style.

Rule identity is the style key, not `Style.name`. `name` is display metadata for the generated token-color entry.

When multiple styles are merged by `unordered`, later resolved styles override `fg`, `fontFamily`, `fontSize`, and `lineHeight`. Font styles are unioned unless a later style has `in: []`, which clears the accumulated font style. Merged rule names are joined from display names.

## Selector Values

```ts
type Scope =
    | string
    | Scope[]
    | AnySelector
    | DescendingSelector
```

Strings are compact scope atoms. Arrays create dot nesting. Helpers create alternatives and ancestor selectors.

## Dot Nesting

An array creates nominative dot nesting:

```ts
['keyword', 'control', 'flow']
```

expands to:

```text
keyword.control.flow
```

Each array item is expanded before joining, so arrays can contain compact atoms and alternatives.

## Colon Alternatives

Inside a string atom, `:` creates alternatives for the nearest dot segment.

```ts
'keyword.control.flow:conditional'
```

expands to:

```text
keyword.control.flow
keyword.control.conditional
```

An empty alternative means the current segment is omitted:

```ts
'keyword.control:.ts'
```

expands to:

```text
keyword.control.ts
keyword.ts
```

Colon alternatives are local to their dot segment. Cross-products are produced when several segments contain alternatives.

## Ancestor Selectors

`desc(...parts)` creates hierarchical nesting:

```ts
desc('meta.import', 'keyword.control.as:from')
```

expands to:

```text
meta.import keyword.control.as
meta.import keyword.control.from
```

The final scope segment is the target token scope in VS Code's TextMate matching grammar. Earlier segments are parent scopes.

For simple selectors, the space can be used:

```ts
'meta.import keyword.control.as:from'
```

## Alternatives

`any(...parts)` creates alternatives:

```ts
any('string', 'constant.numeric', c('meta.import', 'keyword.control.as'))
```

expands to:

```text
string
constant.numeric
meta.import keyword.control.as
```

Alternatives are flattened, sorted, and deduplicated within a compiled rule.

## Unordere Rules

`unordered` emits each base rule and all merged selector combinations:

```ts
unordered(
    r('emphasis', { on: 'markup.italic' }),
    r('strong', { on: 'markup.bold' }),
)
```

emits selectors equivalent to:

```text
markup.italic
markup.bold
markup.italic markup.bold
markup.bold markup.italic
```

The merged rules use the merged style. For the example above, both combination selectors use `fontStyle: 'bold italic'`.

## Negation

VS Code token-color entries do not have a native negative selector. `decleme` implements `no` by generating positive override rules.

```ts
r('text', {
    on: 'string',
    no: 'meta.object-literal.key string',
})
```

compiles conceptually to:

```ts
[
    {
        name: 'Text',
        scope: 'string',
        settings: { foreground: text },
    },
    {
        name: 'Text reset',
        scope: 'string meta.object-literal.key',
        settings: { foreground: defaultForeground },
    },
]
```

`no` is an excluded context selector.

The reset style is the inverse of the fields present in the original style:

- if `fg` is set, reset `foreground` to `options.defaultForeground`
- if `in` is set, reset `fontStyle` to `''`
- if `fontFamily` is set, reset `fontFamily` to `options.defaultFontFamily`
- if `fontSize` is set, reset `fontSize` to `options.defaultFontSize`
- if `lineHeight` is set, reset `lineHeight` to `options.defaultLineHeight`

Reset defaults are explicit compiler inputs because TextMate token-color rules cannot read `editor.foreground` or editor font settings directly. A rule that uses `no` with `fg` requires `defaultForeground`.
